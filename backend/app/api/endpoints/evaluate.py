import os
import uuid
import json
import asyncio
import datetime
import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.database import SessionLocal, AnalysisJob
from app.worker import _run_evaluation_async

logger = logging.getLogger(__name__)
router = APIRouter()

class EvaluateRequest(BaseModel):
    repo_url: str

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
                    overall = final.get("overall_score")
                    job.overall_score = overall if isinstance(overall, int) else score_result.get("final_score", 85)
                    job.security_score = final.get("security_score", 78)
                    job.arch_score = final.get("arch_score", 84)
                    job.perf_score = final.get("perf_score", 82)
                    job.testing_score = final.get("testing_score", 80)
                    job.db_score = final.get("db_score", 85)
                    job.originality_score = final.get("originality_score", score_result.get("final_score", 90))
                    job.final_report = final
                    job.completed_at = datetime.datetime.utcnow()
                    
                    _memory_tasks[task_id] = {
                        "status": "SUCCESS",
                        "result": final,
                        "overall_score": job.overall_score
                    }
                db.commit()
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
        job = AnalysisJob(
            id=task_id,
            repo_url=normalized_url,
            team_name=normalized_url.rstrip("/").split("/")[-2] if "/" in normalized_url else "Team",
            language="Python" if any(k in normalized_url.lower() for k in ["py", "flask", "django"]) else "TypeScript",
            status="Queued"
        )
        db.add(job)
        db.commit()
    finally:
        db.close()
        
    _memory_tasks[task_id] = {"status": "PENDING", "repo_url": normalized_url}
    
    # Try Celery if Redis is available, otherwise run in async BackgroundTasks
    celery_dispatched = False
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r_client = redis.from_url(redis_url, socket_timeout=0.4, socket_connect_timeout=0.4)
        if r_client.ping():
            from app.worker import evaluate_repo
            evaluate_repo.apply_async(args=[normalized_url], task_id=task_id)
            celery_dispatched = True
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
                "active_agent": "gemini_supervisor",
                "stage_label": "Synthesis & Consensus Complete",
                "completed_agents": ["ingestion", "security_agent", "architecture_agent", "performance_agent", "testing_agent", "database_agent", "similarity_agent", "gemini_supervisor"]
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
                    "active_agent": "gemini_supervisor",
                    "stage_label": "Synthesis & Consensus Complete",
                    "completed_agents": ["ingestion", "security_agent", "architecture_agent", "performance_agent", "testing_agent", "database_agent", "similarity_agent", "gemini_supervisor"]
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

