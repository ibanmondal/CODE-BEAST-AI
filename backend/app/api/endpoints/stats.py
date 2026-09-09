from fastapi import APIRouter, Response
import urllib.parse
from app.database import SessionLocal, AnalysisJob
from sqlalchemy import desc

router = APIRouter()

@router.get("/history")
async def get_history():
    db = SessionLocal()
    
    # Cleanup stale jobs (older than 10 minutes and still running/queued)
    import datetime
    stale_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    db.query(AnalysisJob).filter(
        AnalysisJob.status.in_(["Running", "Queued"]),
        AnalysisJob.created_at < stale_threshold
    ).update({"status": "Failed"}, synchronize_session=False)
    db.commit()

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
            "finops": job.finops_score,
            "submitted": submitted,
            "final_report": job.final_report
        })
    return {"history": history}

@router.get("/dashboard")
async def get_dashboard_stats():
    db = SessionLocal()
    
    # Cleanup stale jobs
    import datetime
    stale_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    db.query(AnalysisJob).filter(
        AnalysisJob.status.in_(["Running", "Queued"]),
        AnalysisJob.created_at < stale_threshold
    ).update({"status": "Failed"}, synchronize_session=False)
    db.commit()
    
    jobs = db.query(AnalysisJob).all()
    db.close()
    
    total = len(jobs)
    completed = len([j for j in jobs if j.status == "Completed"])
    running = len([j for j in jobs if j.status in ["Running", "Queued"]])
    failed = len([j for j in jobs if j.status == "Failed"])
    avg_score = sum(j.overall_score for j in jobs if j.status == "Completed") / (completed or 1)
    
    highest = max([j.overall_score for j in jobs if j.status == "Completed"] or [0])
    
    # Lang distribution with CodeBeast warm orange/copper color palette
    langs = {}
    for j in jobs:
        lang_name = j.language or "Python"
        langs[lang_name] = langs.get(lang_name, 0) + 1
    
    cb_palette = ["#FF8C42", "#E07A48", "#FFB085", "#D96B27", "#FFA04A", "#C44C0D"]
    pieData = [
        {"name": k, "value": v, "color": cb_palette[i % len(cb_palette)]} 
        for i, (k, v) in enumerate(langs.items())
    ]
    
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

@router.get("/badge")
async def get_badge(repo: str):
    """
    Returns an SVG badge for the given repository indicating its CodeBeast overall score.
    Expects URL encoded repo url.
    """
    db = SessionLocal()
    # Decode if needed
    clean_repo = urllib.parse.unquote(repo).strip().lower()
    
    # Try exact match or substring
    jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").order_by(desc(AnalysisJob.created_at)).all()
    db.close()
    
    job_found = None
    for job in jobs:
        if job.repo_url.lower() == clean_repo or clean_repo in job.repo_url.lower():
            job_found = job
            break
            
    if not job_found:
        score_text = "N/A"
        color = "#e05d44" # Red for not found
    else:
        score = job_found.overall_score
        score_text = f"{score}/100"
        
        if score >= 80:
            color = "#FF8C42" # CodeBeast Orange
        elif score >= 60:
            color = "#dfb317" # Yellow
        else:
            color = "#e05d44" # Red

    # Simple Shields.io style SVG
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="130" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="130" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h75v20H0z"/>
    <path fill="{color}" d="M75 0h55v20H75z"/>
    <path fill="url(#b)" d="M0 0h130v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="37.5" y="15" fill="#010101" fill-opacity=".3">CodeBeast</text>
    <text x="37.5" y="14">CodeBeast</text>
    <text x="101.5" y="15" fill="#010101" fill-opacity=".3">{score_text}</text>
    <text x="101.5" y="14">{score_text}</text>
  </g>
</svg>"""
    
    return Response(content=svg, media_type="image/svg+xml")
