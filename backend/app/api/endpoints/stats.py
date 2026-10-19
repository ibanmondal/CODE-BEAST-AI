from fastapi import APIRouter, Response
import urllib.parse
from app.database import SessionLocal, AnalysisJob
from sqlalchemy import desc

router = APIRouter()

@router.get("/history")
async def get_history():
    db = SessionLocal()
    
    # Cleanup orphaned non-batch jobs (running for > 60 minutes)
    import datetime
    stale_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=60)
    db.query(AnalysisJob).filter(
        AnalysisJob.batch_id.is_(None),
        AnalysisJob.status == "Running",
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

        clean_url = job.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
        parts = [p for p in clean_url.split("/") if p]
        owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else (job.team_name or "Developer"))
        clean_name = clean_url if clean_url else "Repository"
        team_title = job.team_name if (job.team_name and job.team_name not in ["Unknown", owner]) else f"{owner.capitalize()} Team"
        history.append({
            "id": job.id,
            "repo": clean_name,
            "repoId": job.repo_url,
            "submitter_github_username": owner,
            "team": team_title,
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
            "evaluated_at": job.completed_at.strftime("%B %d, %Y - %H:%M UTC") if job.completed_at else submitted,
            "final_report": job.final_report
        })
    return {"history": history}

@router.get("/dashboard")
async def get_dashboard_stats():
    db = SessionLocal()
    
    # Cleanup orphaned non-batch jobs (running for > 60 minutes)
    import datetime
    stale_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=60)
    db.query(AnalysisJob).filter(
        AnalysisJob.batch_id.is_(None),
        AnalysisJob.status == "Running",
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
    
    cb_palette = ["#3B2A20", "#7B5E4A", "#A67C52", "#D1B89A", "#8B5A2B", "#5C4033"]
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
        clean_url = job.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
        parts = [p for p in clean_url.split("/") if p]
        owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Developer")
        team_title = job.team_name if (job.team_name and job.team_name not in ["Unknown", owner]) else f"{owner.capitalize()} Team"
        leaderboard.append({
            "rank": i + 1,
            "repo": clean_url,
            "repoId": job.repo_url,
            "team": team_title,
            "overall": job.overall_score,
            "sec": job.security_score,
            "arch": job.arch_score,
            "perf": job.perf_score,
            "testing_score": job.testing_score,
            "db_score": job.db_score,
            "orig": job.originality_score
        })
    return {"leaderboard": leaderboard}

@router.get("/batch-leaderboard")
async def get_batch_leaderboard(batch_id: str = None):
    """
    Returns the AI Leaderboard Agent's curated batch cohort standings,
    including honor badges, awards, differentiated ranks, and comparative insights.
    """
    from app.services.batch_orchestrator import get_batch_status, get_latest_batch_report
    batch_data = None
    if batch_id:
        batch_data = get_batch_status(batch_id)
    else:
        batch_data = get_latest_batch_report()

    if batch_data and batch_data.get("leaderboard"):
        return {
            "batch_id": batch_data.get("batch_id"),
            "name": batch_data.get("name"),
            "status": batch_data.get("status"),
            "total_repos": batch_data.get("total_repos"),
            "completed_repos": batch_data.get("completed_repos"),
            "leaderboard": batch_data.get("leaderboard")
        }

    # Fallback: Synthesize on-the-fly from historical completed jobs if no batch evaluated yet
    db = SessionLocal()
    jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").limit(20).all()
    db.close()

    job_dicts = []
    for j in jobs:
        job_dicts.append({
            "id": j.id,
            "task_id": j.id,
            "repo_url": j.repo_url,
            "team_name": j.team_name,
            "overall_score": j.overall_score,
            "security_score": j.security_score,
            "arch_score": j.arch_score,
            "perf_score": j.perf_score,
            "testing_score": j.testing_score,
            "db_score": j.db_score,
            "originality_score": j.originality_score,
            "final_report": j.final_report
        })

    from app.agents.leaderboard_agent import BatchLeaderboardAgent
    agent = BatchLeaderboardAgent()
    fallback_leaderboard = agent._deterministic_cohort_synthesis(
        batch_id or "global_cohort", 
        "Global Repository Benchmark Cohort", 
        job_dicts
    )

    return {
        "batch_id": batch_id or "global_cohort",
        "name": "Global Repository Benchmark Cohort",
        "status": "Completed",
        "total_repos": len(job_dicts),
        "completed_repos": len(job_dicts),
        "leaderboard": fallback_leaderboard
    }

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
