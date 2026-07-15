import os
import asyncio
from celery import Celery
from dotenv import load_dotenv

from app.services.github_collector import GithubMetadataCollector
from app.services.repo_cloner import RepositoryCloner
from app.services.context_builder import ContextBuilder
from app.services.similarity_engine import SimilarityEngine
from app.services.scoring_engine import ScoringEngine
from app.agents.graph import create_orchestrator_graph
from app.database import SessionLocal, AnalysisJob
import datetime
import redis
import json

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("codebeast_worker", broker=redis_url, backend=redis_url)
worker_redis_client = redis.from_url(redis_url)

def broadcast_agent_status(task_id, repo_url, status, agent_name):
    if task_id:
        try:
            payload = json.dumps({
                "task_id": task_id,
                "repo_url": repo_url,
                "status": status,
                "agent": agent_name
            })
            worker_redis_client.publish("job_updates", payload)
            worker_redis_client.set("last_eval_task", payload)
        except Exception as e:
            print(f"Redis publish error: {e}")

async def _run_evaluation_async(repo_url: str, task_id: str = None):
    cloner = RepositoryCloner(base_dir="./worker_repos")
    repo_path = ""
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "ingestion")
    try:
        collector = GithubMetadataCollector()
        metadata = await collector.collect_metadata(repo_url)
        
        repo_path = cloner.clone_repository(repo_url)
        
        builder = ContextBuilder(repo_path)
        context = builder.build_context()
        
        sim_engine = SimilarityEngine()
        # Ensure mock templates exist for similarity engine
        if not os.path.exists("./mock_templates_db"):
            sim_engine.seed_mock_template_db()
        similarity = sim_engine.analyze_repository(repo_path)
        
        scoring_engine = ScoringEngine()
        score_result = scoring_engine.calculate_score(metadata, context, similarity)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "ingestion")
        
        graph = create_orchestrator_graph()
        
        initial_state = {
            "task_id": task_id,
            "repo_url": repo_url,
            "metadata": metadata,
            "context": context,
            "similarity_result": {"score": similarity["similarity_score"], "message": "Analyzed"},
            "deterministic_score_result": {"score": score_result["final_score"], "message": str(score_result.get("evidence", []))},
            "security_report": None,
            "architecture_report": None,
            "dx_report": None,
            "testing_report": None,
            "db_report": None,
            "final_report": None
        }
        
        result_state = await graph.ainvoke(initial_state)
        
        return {
            "metadata": metadata,
            "deterministic_score": score_result,
            "final_report": result_state.get("final_report", {})
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if repo_path:
            cloner.cleanup(repo_path)

@celery_app.task(bind=True, name="evaluate_repo")
def evaluate_repo(self, repo_url: str):
    task_id = self.request.id
    
    redis_client = redis.from_url(redis_url)
    
    def broadcast_update(status, payload={}):
        redis_client.publish("job_updates", json.dumps({
            "task_id": task_id,
            "repo_url": repo_url,
            "status": status,
            **payload
        }))
    
    db = SessionLocal()
    job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
    if job:
        job.status = "Running"
        db.commit()
    db.close()
    
    broadcast_update("Running")
    
    result = asyncio.run(_run_evaluation_async(repo_url, task_id=task_id))
    
    db = SessionLocal()
    job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
    if job:
        if "error" in result:
            job.status = "Failed"
        else:
            job.status = "Completed"
            final = result.get("final_report", {})
            
            # Ensure final is a dict, not a string (if json parser failed)
            if isinstance(final, str):
                try:
                    final = json.loads(final)
                except:
                    final = {}
                    
            job.final_report = final
            
            score_result = result.get("deterministic_score", {})
            overall = final.get("overall_score")
            job.overall_score = overall if isinstance(overall, int) else score_result.get("final_score", 0)
            
            job.security_score = final.get("security_score", 0)
            job.arch_score = final.get("arch_score", 0)
            job.perf_score = final.get("perf_score", 0)
            job.testing_score = final.get("testing_score", 0)
            job.db_score = final.get("db_score", 0)
            job.originality_score = final.get("originality_score", score_result.get("final_score", 0))
            
            # Simple language heuristic
            job.language = "Python" if "py" in repo_url.lower() else "TypeScript"
            job.team_name = repo_url.split("/")[-2] if "/" in repo_url else "Unknown"
            
            job.completed_at = datetime.datetime.utcnow()
            broadcast_update("Completed", {"final_report": final, "overall_score": job.overall_score})
        db.commit()
    db.close()
    
    return result
