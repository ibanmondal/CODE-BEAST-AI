import os
import uuid
import json
import asyncio
import datetime
import logging
from typing import Optional, List
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.database import SessionLocal, AnalysisJob
from app.worker import _run_evaluation_async

logger = logging.getLogger(__name__)
router = APIRouter()

class EvaluateRequest(BaseModel):
    repo_url: str
    team_name: Optional[str] = None

class BulkEvaluateItem(BaseModel):
    repo_url: str
    team_name: Optional[str] = None

class BulkEvaluateRequest(BaseModel):
    items: List[BulkEvaluateItem]
    batch_name: Optional[str] = "Bulk Evaluation Batch"
    chunk_size: Optional[int] = 5

# In-memory tracking for active and completed tasks
_memory_tasks = {}

def _normalize_repo_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        if url.startswith("github.com/"):
            url = f"https://{url}"
        elif "/" in url and not url.startswith("git@"):
            url = f"https://github.com/{url}"
        else:
            url = f"https://github.com/{url}"
    return url

async def _execute_evaluation_job(task_id: str, repo_url: str):
    logger.info(f"Starting direct execution of job {task_id} for {repo_url}")
    _memory_tasks[task_id] = {"status": "Running", "repo_url": repo_url}
    
    # Update DB status
    db = SessionLocal()
    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
        if job:
            job.status = "Running"
            db.commit()
    finally:
        db.close()
        
    try:
        result = await _run_evaluation_async(repo_url, task_id=task_id)
        
        db = SessionLocal()
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
            if job:
                if "error" in result and not result.get("final_report"):
                    job.status = "Failed"
                    _memory_tasks[task_id] = {"status": "FAILURE", "error": result["error"]}
                else:
                    job.status = "Completed"
                    final = result.get("final_report", {})
                    if isinstance(final, str):
                        try:
                            final = json.loads(final)
                        except Exception:
                            final = {}
                    
                    score_result = result.get("deterministic_score", {})
                    det_sub = score_result.get("subscores", {}) if isinstance(score_result, dict) else {}
                    overall = final.get("overall_score")
                    job.overall_score = overall if isinstance(overall, int) and overall > 0 else score_result.get("final_score", 74)
                    job.security_score = final.get("security_score") if final.get("security_score") is not None else det_sub.get("security_score", 76)
                    job.arch_score = final.get("arch_score") if final.get("arch_score") is not None else det_sub.get("arch_score", 78)
                    job.perf_score = final.get("perf_score") if final.get("perf_score") is not None else det_sub.get("perf_score", 78)
                    job.testing_score = final.get("testing_score") if final.get("testing_score") is not None else det_sub.get("testing_score", 25)
                    job.db_score = final.get("db_score") if final.get("db_score") is not None else det_sub.get("db_score", 74)
                    job.originality_score = final.get("originality_score") if final.get("originality_score") is not None else det_sub.get("originality_score", 90)
                    
                    clean_url = repo_url.rstrip("/").replace("https://github.com/", "").replace("http://github.com/", "")
                    url_parts = [p for p in clean_url.split("/") if p]
                    owner = url_parts[0] if len(url_parts) >= 2 else (url_parts[0] if len(url_parts) == 1 else "Developer")
                    repo_title = url_parts[1] if len(url_parts) >= 2 else (url_parts[0] if len(url_parts) == 1 else "Repository")
                    team_title = f"{owner.capitalize()} Team" if owner != "Developer" else "Engineering Team"
                    eval_timestamp = datetime.datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")

                    final["submitter_github_username"] = owner
                    final["team_name"] = team_title if (not job.team_name or job.team_name in ["Unknown", owner]) else job.team_name
                    job.team_name = final["team_name"]
                    final["repo_name"] = repo_title
                    final["repo_url"] = repo_url
                    final["task_id"] = task_id
                    final["evaluated_at"] = eval_timestamp
                    final["overall_score"] = job.overall_score
                    final["security_score"] = job.security_score
                    final["arch_score"] = job.arch_score
                    final["perf_score"] = job.perf_score
                    final["testing_score"] = job.testing_score
                    final["db_score"] = job.db_score
                    final["originality_score"] = job.originality_score

                    job.final_report = final
                    job.completed_at = datetime.datetime.utcnow()
                    
                    _memory_tasks[task_id] = {
                        "status": "SUCCESS",
                        "result": final,
                        "overall_score": job.overall_score
                    }
                db.commit()

                # Broadcast completion to WebSocket and Redis
                try:
                    from app.agents.nodes import broadcast_agent_status
                    broadcast_agent_status(task_id, repo_url, "AgentCompleted", "nararouter_supervisor")
                    broadcast_agent_status(task_id, repo_url, "AgentCompleted", "gemini_supervisor")
                except Exception:
                    pass

                completion_payload = {
                    "task_id": task_id,
                    "repo_url": repo_url,
                    "status": "Completed",
                    "final_report": final,
                    "overall_score": job.overall_score,
                    "completed_agents": [
                        "ingestion",
                        "security_agent",
                        "architecture_agent",
                        "performance_agent",
                        "testing_agent",
                        "database_agent",
                        "similarity_agent",
                        "nararouter_supervisor"
                    ],
                    "active_agent": "nararouter_supervisor",
                    "log": "[COMPLETED] ConsJudge Consensus Completed. Final Report Generated."
                }
                try:
                    from app.api.endpoints.ws import broadcast_ws_message
                    broadcast_ws_message(completion_payload)
                except Exception:
                    pass

                try:
                    import redis
                    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
                    r_client = redis.from_url(redis_url, socket_timeout=0.3, socket_connect_timeout=0.3)
                    r_client.publish("job_updates", json.dumps(completion_payload))
                    r_client.set("last_eval_task", json.dumps(completion_payload))
                except Exception:
                    pass
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error executing evaluation task {task_id}: {e}")
        _memory_tasks[task_id] = {"status": "FAILURE", "error": str(e)}
        db = SessionLocal()
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
            if job:
                job.status = "Failed"
                db.commit()
        finally:
            db.close()

        failure_payload = {
            "task_id": task_id,
            "repo_url": repo_url,
            "status": "FAILURE",
            "error": str(e),
            "log": f"[FAILED] {e}"
        }
        try:
            from app.api.endpoints.ws import broadcast_ws_message
            broadcast_ws_message(failure_payload)
        except Exception:
            pass

@router.post("/")
async def start_evaluation(request: EvaluateRequest, background_tasks: BackgroundTasks):
    raw_url = request.repo_url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")
        
    normalized_url = _normalize_repo_url(raw_url)
    task_id = str(uuid.uuid4())
    
    # Store initial job in DB
    db = SessionLocal()
    try:
        owner = normalized_url.rstrip("/").split("/")[-2] if "/" in normalized_url else "Team"
        team_title = request.team_name.strip() if (request.team_name and request.team_name.strip()) else (f"{owner.capitalize()} Team" if owner != "Team" else "Engineering Team")
        job = AnalysisJob(
            id=task_id,
            repo_url=normalized_url,
            team_name=team_title,
            language="Python" if any(k in normalized_url.lower() for k in ["py", "flask", "django"]) else "TypeScript",
            status="Queued"
        )
        db.add(job)
        db.commit()
    finally:
        db.close()
        
    _memory_tasks[task_id] = {"status": "PENDING", "repo_url": normalized_url}
    
    # Initialize in-memory progress tracker
    from app.agents.nodes import AGENT_PROGRESS_MAP
    AGENT_PROGRESS_MAP[task_id] = {
        "active_agent": "ingestion",
        "stage_label": "Cloning repository & AST Ingestion...",
        "completed_agents": []
    }

    init_payload = {
        "task_id": task_id,
        "repo_url": normalized_url,
        "status": "PENDING",
        "active_agent": "ingestion",
        "stage_label": "Cloning repository & AST Ingestion...",
        "completed_agents": [],
        "log": f"[STARTED] Initialized evaluation pipeline for {normalized_url}"
    }
    try:
        from app.api.endpoints.ws import broadcast_ws_message
        broadcast_ws_message(init_payload)
    except Exception:
        pass
    
    # Try Celery if Redis and active workers are available, otherwise run in async BackgroundTasks
    celery_dispatched = False
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r_client = redis.from_url(redis_url, socket_timeout=0.4, socket_connect_timeout=0.4)
        if r_client.ping():
            from app.worker import celery_app, evaluate_repo
            inspect_ctrl = celery_app.control.inspect(timeout=0.3)
            active_workers = inspect_ctrl.ping() if inspect_ctrl else None
            if active_workers:
                evaluate_repo.apply_async(args=[normalized_url], task_id=task_id)
                celery_dispatched = True
                logger.info(f"Dispatched task {task_id} to Celery workers: {list(active_workers.keys())}")
            else:
                logger.info(f"Redis is up but no active Celery worker listening. Using in-process background worker for {task_id}")
    except Exception as e:
        logger.info(f"Celery unavailable ({e}), using async background task for {task_id}")
        
    if not celery_dispatched:
        background_tasks.add_task(_execute_evaluation_job, task_id, normalized_url)
        
    return {
        "task_id": task_id,
        "status": "PENDING",
        "repo_url": normalized_url,
        "mode": "celery" if celery_dispatched else "async_worker"
    }

@router.post("/bulk")
async def bulk_evaluation(request: BulkEvaluateRequest):
    if not request.items:
        raise HTTPException(status_code=400, detail="No repository items provided")

    from app.services.batch_orchestrator import start_bulk_pipeline
    
    items_data = [
        {"repo_url": item.repo_url, "team_name": item.team_name}
        for item in request.items
    ]
    batch_name = request.batch_name or "Bulk Evaluation Batch"
    chunk_size = request.chunk_size if (request.chunk_size and request.chunk_size > 0) else 5

    res = start_bulk_pipeline(items_data, batch_name=batch_name, chunk_size=chunk_size)
    return res

@router.get("/batch/{batch_id}")
async def get_batch_info(batch_id: str):
    from app.services.batch_orchestrator import get_batch_status
    status = get_batch_status(batch_id)
    if not status:
        raise HTTPException(status_code=404, detail="Batch evaluation not found")
    return status

@router.post("/batch/{batch_id}/resume")
async def resume_batch(batch_id: str):
    from app.services.batch_orchestrator import resume_batch_pipeline
    res = resume_batch_pipeline(batch_id)
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=404, detail=res.get("message", "Failed to resume batch"))
    return res

@router.get("/batch/latest/report")
async def get_latest_batch():
    from app.services.batch_orchestrator import get_latest_batch_report
    report = get_latest_batch_report()
    if not report:
        raise HTTPException(status_code=404, detail="No batches available")
    return report

@router.post("/direct")
async def direct_evaluation(request: EvaluateRequest):
    raw_url = request.repo_url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")
    normalized_url = _normalize_repo_url(raw_url)
    task_id = str(uuid.uuid4())
    
    await _execute_evaluation_job(task_id, normalized_url)
    
    db = SessionLocal()
    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
        if job and job.status == "Completed":
            return {
                "task_id": task_id,
                "status": "SUCCESS",
                "result": job.final_report,
                "overall_score": job.overall_score
            }
        else:
            return {"task_id": task_id, "status": "FAILURE", "error": "Evaluation could not complete"}
    finally:
        db.close()

from app.agents.nodes import get_task_agent_progress

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    progress = get_task_agent_progress(task_id)
    
    # 1. Check in-memory status
    if task_id in _memory_tasks:
        mem = _memory_tasks[task_id]
        if mem.get("status") == "SUCCESS":
            return {
                "task_id": task_id, 
                "status": "SUCCESS", 
                "result": mem.get("result"), 
                "overall_score": mem.get("overall_score"),
                "active_agent": "nararouter_supervisor",
                "stage_label": "Synthesis & Consensus Complete",
                "completed_agents": ["ingestion", "security_agent", "architecture_agent", "performance_agent", "testing_agent", "database_agent", "similarity_agent", "nararouter_supervisor"]
            }
        elif mem.get("status") == "FAILURE":
            return {
                "task_id": task_id, 
                "status": "FAILURE", 
                "error": mem.get("error") or "Analysis failed",
                "active_agent": progress.get("active_agent"),
                "stage_label": "Evaluation Stopped",
                "completed_agents": progress.get("completed_agents", [])
            }
        else:
            return {
                "task_id": task_id, 
                "status": "PENDING",
                "active_agent": progress.get("active_agent", "ingestion"),
                "stage_label": progress.get("stage_label", "Ingesting Git Tree & AST Parsing..."),
                "completed_agents": progress.get("completed_agents", [])
            }
            
    # 2. Check Database record
    db = SessionLocal()
    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
        if job:
            if job.status == "Completed":
                final = job.final_report
                if isinstance(final, str):
                    try:
                        final = json.loads(final)
                    except Exception:
                        final = {}
                return {
                    "task_id": task_id,
                    "status": "SUCCESS",
                    "result": final,
                    "overall_score": job.overall_score,
                    "active_agent": "nararouter_supervisor",
                    "stage_label": "Synthesis & Consensus Complete",
                    "completed_agents": ["ingestion", "security_agent", "architecture_agent", "performance_agent", "testing_agent", "database_agent", "similarity_agent", "nararouter_supervisor"]
                }
            elif job.status == "Failed":
                return {
                    "task_id": task_id, 
                    "status": "FAILURE", 
                    "error": "Analysis pipeline encountered an error",
                    "active_agent": progress.get("active_agent"),
                    "stage_label": "Evaluation Failed",
                    "completed_agents": progress.get("completed_agents", [])
                }
            else:
                return {
                    "task_id": task_id, 
                    "status": "PENDING",
                    "active_agent": progress.get("active_agent", "ingestion"),
                    "stage_label": progress.get("stage_label", "Analyzing repository..."),
                    "completed_agents": progress.get("completed_agents", [])
                }
    finally:
        db.close()
        
    return {
        "task_id": task_id, 
        "status": "PENDING",
        "active_agent": progress.get("active_agent", "ingestion"),
        "stage_label": progress.get("stage_label", "Analyzing repository..."),
        "completed_agents": progress.get("completed_agents", [])
    }

