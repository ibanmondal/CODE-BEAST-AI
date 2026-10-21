from fastapi import APIRouter, Response, Query
from typing import Optional, List, Dict, Any
import urllib.parse
from app.database import SessionLocal, AnalysisJob, BatchEvaluation
from sqlalchemy import desc
import datetime

router = APIRouter()

def _group_jobs_into_cohorts(jobs_list: List[AnalysisJob]) -> List[List[AnalysisJob]]:
    """
    Groups completed analysis jobs into distinct cohorts/sessions:
    1. Jobs sharing the same batch_id belong to that batch cohort.
    2. Jobs with no batch_id evaluated within a 2-hour window are clustered into a session cohort.
    3. The first cohort in the returned list is always the most recent cohort.
    """
    cohorts = []
    current = []
    for j in jobs_list:
        if not current:
            current.append(j)
        else:
            last = current[-1]
            same_batch = bool(j.batch_id and j.batch_id == last.batch_id)
            both_no_batch = bool(not j.batch_id and not last.batch_id)
            time_diff = abs((last.created_at - j.created_at).total_seconds()) if (last.created_at and j.created_at) else 999999
            close_time = time_diff < 7200 # within 2 hours
            if same_batch or (both_no_batch and close_time):
                current.append(j)
            else:
                cohorts.append(current)
                current = [j]
    if current:
        cohorts.append(current)
    return cohorts

def _get_cohort_id(cohort_jobs: List[AnalysisJob], index: int) -> str:
    first = cohort_jobs[0]
    if first.batch_id:
        return first.batch_id
    dstr = first.created_at.strftime('%Y%m%d_%H%M') if first.created_at else str(index)
    return f"session_{dstr}"

@router.get("/cohorts")
async def get_cohorts():
    """
    Returns all evaluation cohorts (batches and evaluation sessions)
    so faculty and evaluators can switch between recent cohorts without mixing old test runs.
    """
    db = SessionLocal()
    batches = db.query(BatchEvaluation).all()
    batch_map = {b.id: b.name for b in batches}
    completed_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").order_by(desc(AnalysisJob.created_at)).all()
    db.close()

    cohorts = _group_jobs_into_cohorts(completed_jobs)
    cohort_list = []

    for i, c in enumerate(cohorts):
        first = c[0]
        cid = _get_cohort_id(c, i)
        is_batch = bool(first.batch_id)
        
        if is_batch:
            b_name = batch_map.get(first.batch_id, "Bulk Evaluation Batch")
            name = f"{b_name} ({len(c)} repos)"
        else:
            time_str = first.created_at.strftime("%B %d, %H:%M UTC") if first.created_at else "Recent"
            name = f"Evaluation Session • {time_str} ({len(c)} repos)"

        sample_repos = []
        for j in c[:4]:
            clean = j.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
            sample_repos.append(clean)

        cohort_list.append({
            "cohort_id": cid,
            "name": name,
            "type": "batch" if is_batch else "session",
            "batch_id": first.batch_id,
            "repo_count": len(c),
            "is_recent": (i == 0),
            "created_at": first.created_at.strftime("%B %d, %Y - %H:%M UTC") if first.created_at else None,
            "sample_repos": sample_repos
        })

    recent_id = cohort_list[0]["cohort_id"] if cohort_list else None
    recent_name = cohort_list[0]["name"] if cohort_list else "Recent Evaluation"

    return {
        "recent_cohort_id": recent_id,
        "recent_cohort_name": recent_name,
        "total_cohorts": len(cohort_list),
        "cohorts": cohort_list
    }

@router.get("/history")
async def get_history(
    recent_only: bool = Query(False, description="Filter only to the most recent evaluation session / cohort"),
    cohort_id: Optional[str] = Query(None, description="Filter to a specific cohort ID or batch ID")
):
    db = SessionLocal()
    
    # Cleanup orphaned non-batch jobs (running for > 60 minutes)
    stale_threshold = datetime.datetime.utcnow() - datetime.timedelta(minutes=60)
    db.query(AnalysisJob).filter(
        AnalysisJob.batch_id.is_(None),
        AnalysisJob.status == "Running",
        AnalysisJob.created_at < stale_threshold
    ).update({"status": "Failed"}, synchronize_session=False)
    db.commit()

    all_jobs = db.query(AnalysisJob).order_by(desc(AnalysisJob.created_at)).all()
    completed_jobs = [j for j in all_jobs if j.status == "Completed"]
    batches = db.query(BatchEvaluation).all()
    batch_map = {b.id: b.name for b in batches}
    db.close()

    cohorts = _group_jobs_into_cohorts(completed_jobs)
    
    # Target jobs selection based on recency/cohort filter
    active_cohort_id = None
    active_cohort_name = "All Historical Audits"
    
    if recent_only and cohorts:
        target_jobs = cohorts[0]
        active_cohort_id = _get_cohort_id(cohorts[0], 0)
        first = cohorts[0][0]
        if first.batch_id:
            active_cohort_name = batch_map.get(first.batch_id, "Latest Batch")
        else:
            time_str = first.created_at.strftime("%B %d, %H:%M UTC") if first.created_at else "Recent"
            active_cohort_name = f"Recent Session ({time_str})"
    elif cohort_id and cohort_id != "all":
        matched = None
        for i, c in enumerate(cohorts):
            if _get_cohort_id(c, i) == cohort_id or (c[0].batch_id and c[0].batch_id == cohort_id):
                matched = c
                active_cohort_id = cohort_id
                first = c[0]
                if first.batch_id:
                    active_cohort_name = batch_map.get(first.batch_id, f"Batch {first.batch_id}")
                else:
                    time_str = first.created_at.strftime("%B %d, %H:%M UTC") if first.created_at else "Session"
                    active_cohort_name = f"Session ({time_str})"
                break
        target_jobs = matched if matched else all_jobs
    else:
        target_jobs = all_jobs

    # Format for the frontend
    history = []
    now = datetime.datetime.utcnow()
    for job in target_jobs:
        diff = now - job.created_at if job.created_at else datetime.timedelta(seconds=0)
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
            "batch_id": job.batch_id,
            "submitted": submitted,
            "created_at_iso": job.created_at.isoformat() if job.created_at else None,
            "evaluated_at": job.completed_at.strftime("%B %d, %Y - %H:%M UTC") if job.completed_at else submitted,
            "final_report": job.final_report
        })

    return {
        "history": history,
        "total": len(history),
        "is_filtered_recent": recent_only,
        "active_cohort_id": active_cohort_id,
        "active_cohort_name": active_cohort_name
    }

@router.get("/recent-leaderboard")
async def get_recent_leaderboard():
    """
    Returns the leaderboard strictly for the most recent evaluation cohort,
    sorted by overall score without pollution from older historical runs.
    """
    db = SessionLocal()
    completed_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").order_by(desc(AnalysisJob.created_at)).all()
    batches = db.query(BatchEvaluation).all()
    batch_map = {b.id: b.name for b in batches}
    db.close()

    cohorts = _group_jobs_into_cohorts(completed_jobs)
    if not cohorts:
        return {"leaderboard": [], "cohort_name": "No evaluations found", "total_repos": 0}

    recent_jobs = cohorts[0]
    sorted_jobs = sorted(recent_jobs, key=lambda j: j.overall_score or 0, reverse=True)

    first = recent_jobs[0]
    if first.batch_id:
        c_name = batch_map.get(first.batch_id, f"Batch {first.batch_id}")
    else:
        time_str = first.created_at.strftime("%B %d - %H:%M UTC") if first.created_at else "Recent"
        c_name = f"Recent Evaluation Session ({time_str})"

    leaderboard = []
    for i, job in enumerate(sorted_jobs):
        clean_url = job.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
        parts = [p for p in clean_url.split("/") if p]
        owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Developer")
        team_title = job.team_name if (job.team_name and job.team_name not in ["Unknown", owner]) else f"{owner.capitalize()} Team"
        leaderboard.append({
            "rank": i + 1,
            "id": job.id,
            "repo": clean_url,
            "repoId": job.repo_url,
            "team": team_title,
            "overall": job.overall_score,
            "sec": job.security_score,
            "arch": job.arch_score,
            "perf": job.perf_score,
            "testing_score": job.testing_score,
            "db_score": job.db_score,
            "orig": job.originality_score,
            "batch_id": job.batch_id,
            "evaluated_at": job.completed_at.strftime("%B %d, %Y - %H:%M UTC") if job.completed_at else None
        })

    return {
        "cohort_name": c_name,
        "cohort_id": _get_cohort_id(recent_jobs, 0),
        "total_repos": len(leaderboard),
        "leaderboard": leaderboard
    }

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
