from fastapi import APIRouter
from pydantic import BaseModel
from app.worker import evaluate_repo
from celery.result import AsyncResult
from app.database import SessionLocal, AnalysisJob

router = APIRouter()

class EvaluateRequest(BaseModel):
    repo_url: str

@router.post("/")
async def start_evaluation(request: EvaluateRequest):
    task = evaluate_repo.delay(request.repo_url)
    
    db = SessionLocal()
    job = AnalysisJob(
        id=task.id,
        repo_url=request.repo_url,
        status="Queued"
    )
    db.add(job)
    db.commit()
    db.close()
    
    return {"task_id": task.id, "status": "PENDING"}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    task_result = AsyncResult(task_id)
    response = {
        "task_id": task_id,
        "status": task_result.status,
    }
    if task_result.status == "SUCCESS":
        response["result"] = task_result.result
    elif task_result.status == "FAILURE":
        response["error"] = str(task_result.info)
        
    return response
