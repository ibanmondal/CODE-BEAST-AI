from fastapi import APIRouter
from app.database import SessionLocal, AnalysisJob
from sqlalchemy import desc

router = APIRouter()

@router.get("/history")
async def get_history():
    db = SessionLocal()
    jobs = db.query(AnalysisJob).order_by(desc(AnalysisJob.created_at)).all()
    db.close()
    
    # Format for the frontend
    history = []
    for job in jobs:
        
        # Calculate time ago roughly
        import datetime
        now = datetime.datetime.utcnow()
        diff = now - job.created_at
        if diff.days > 0:
            submitted = f"{diff.days} days ago"
        elif diff.seconds > 3600:
            submitted = f"{diff.seconds // 3600} hours ago"
        elif diff.seconds > 60:
            submitted = f"{diff.seconds // 60} mins ago"
        else:
            submitted = "Just now"

        history.append({
            "repo": job.repo_url.split("/")[-1] if "/" in job.repo_url else job.repo_url,
            "repoId": job.repo_url,
            "team": job.team_name,
            "lang": job.language,
            "status": job.status,
            "overall": job.overall_score,
            "sec": job.security_score,
            "arch": job.arch_score,
            "perf": job.perf_score,
            "testing_score": job.testing_score,
            "db_score": job.db_score,
            "orig": job.originality_score,
            "submitted": submitted,
            "final_report": job.final_report
        })
    return {"history": history}

@router.get("/dashboard")
async def get_dashboard_stats():
    db = SessionLocal()
    jobs = db.query(AnalysisJob).all()
    db.close()
    
    total = len(jobs)
    completed = len([j for j in jobs if j.status == "Completed"])
    running = len([j for j in jobs if j.status in ["Running", "Queued"]])
    failed = len([j for j in jobs if j.status == "Failed"])
    avg_score = sum(j.overall_score for j in jobs if j.status == "Completed") / (completed or 1)
    
    highest = max([j.overall_score for j in jobs if j.status == "Completed"] or [0])
    
    # Lang distribution
    langs = {}
    for j in jobs:
        langs[j.language] = langs.get(j.language, 0) + 1
    
    pieData = [{"name": k, "value": v, "color": "#3B82F6" if k=="Python" else "#10B981"} for k, v in langs.items()]
    
    return {
        "stats": {
            "submitted": total,
            "analyzed": completed,
            "running": running,
            "avg_score": round(avg_score, 1),
            "highest": highest,
            "failed": failed
        },
        "pieData": pieData
    }

@router.get("/leaderboard")
async def get_leaderboard():
    db = SessionLocal()
    jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").order_by(desc(AnalysisJob.overall_score)).all()
    db.close()
    
    leaderboard = []
    for i, job in enumerate(jobs):
        leaderboard.append({
            "rank": i + 1,
            "repo": job.repo_url.split("/")[-1] if "/" in job.repo_url else job.repo_url,
            "team": job.team_name,
            "overall": job.overall_score,
            "sec": job.security_score,
            "arch": job.arch_score,
            "perf": job.perf_score,
            "testing_score": job.testing_score,
            "db_score": job.db_score,
            "orig": job.originality_score
        })
    return {"leaderboard": leaderboard}
