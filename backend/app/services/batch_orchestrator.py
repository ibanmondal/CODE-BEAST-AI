import os
import uuid
import json
import asyncio
import logging
import datetime
from typing import List, Dict, Any, Optional
from app.database import SessionLocal, AnalysisJob, BatchEvaluation
from app.api.endpoints.ws import broadcast_ws_message

logger = logging.getLogger(__name__)

# In-memory tracking for fast status polling
_ACTIVE_BATCHES: Dict[str, Dict[str, Any]] = {}
_RUNNING_BATCH_TASKS: Dict[str, asyncio.Task] = {}

def broadcast_batch_event(batch_id: str, payload: Dict[str, Any]):
    """Broadcasts batch events to memory cache, WebSockets, and Redis."""
    if batch_id in _ACTIVE_BATCHES:
        _ACTIVE_BATCHES[batch_id].update(payload)
    else:
        _ACTIVE_BATCHES[batch_id] = payload

    # WebSocket broadcast
    try:
        broadcast_ws_message(payload)
    except Exception as e:
        logger.debug(f"WS broadcast warning: {e}")

    # Redis broadcast
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r_client = redis.from_url(redis_url, socket_timeout=0.3, socket_connect_timeout=0.3)
        msg = json.dumps(payload)
        r_client.publish("job_updates", msg)
        r_client.set(f"batch_state_{batch_id}", msg)
    except Exception:
        pass


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


async def _execute_repo_with_celery_or_direct(task_id: str, repo_url: str):
    """
    Executes repository evaluation.
    1. Checks if Celery worker is active via Redis ping & Celery inspect.
    2. If Celery is active, dispatches via evaluate_repo.apply_async and awaits completion.
    3. If Celery is offline, falls back to in-process _execute_evaluation_job.
    """
    # First check if the job is already completed in DB
    db = SessionLocal()
    try:
        existing = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
        if existing and existing.status == "Completed":
            logger.info(f"Job {task_id} ({repo_url}) is already Completed. Skipping.")
            return
    finally:
        db.close()

    celery_dispatched = False
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r_client = redis.from_url(redis_url, socket_timeout=0.4, socket_connect_timeout=0.4)
        if r_client.ping():
            from app.worker import celery_app, evaluate_repo
            inspect_ctrl = celery_app.control.inspect(timeout=0.4)
            active_workers = inspect_ctrl.ping() if inspect_ctrl else None
            if active_workers:
                logger.info(f"[Batch Orchestrator] Dispatching task {task_id} ({repo_url}) to Celery workers: {list(active_workers.keys())}")
                async_res = evaluate_repo.apply_async(args=[repo_url], task_id=task_id)
                celery_dispatched = True

                # Await Celery completion asynchronously
                start_time = asyncio.get_event_loop().time()
                timeout_seconds = 180  # 3 minutes max per repo
                while not async_res.ready():
                    if (asyncio.get_event_loop().time() - start_time) > timeout_seconds:
                        logger.warning(f"[Batch Orchestrator] Celery task {task_id} reached {timeout_seconds}s timeout, advancing.")
                        break
                    
                    db = SessionLocal()
                    try:
                        j = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
                        if j and j.status in ["Completed", "Failed"]:
                            break
                    finally:
                        db.close()
                    await asyncio.sleep(0.8)
    except Exception as e:
        logger.warning(f"[Batch Orchestrator] Celery dispatch error ({e}), falling back to direct async worker.")

    if not celery_dispatched:
        from app.api.endpoints.evaluate import _execute_evaluation_job
        await _execute_evaluation_job(task_id, repo_url)


async def _run_batch_worker(batch_id: str, batch_name: str, chunks: List[List[Dict[str, Any]]]):
    """
    Core Batch Orchestrator Worker:
    1. Iterates through chunks of 5 repositories.
    2. Runs evaluation one-by-one sequentially within each chunk using Celery (or direct fallback).
    3. Advances to the next chunk after completion.
    4. Automatically invokes the BatchLeaderboardAgent to arbitrate the entire cohort.
    """
    try:
        _RUNNING_BATCH_TASKS[batch_id] = asyncio.current_task()
        from app.agents.leaderboard_agent import BatchLeaderboardAgent

        total_repos = sum(len(c) for c in chunks)
        
        # Pre-populate with any jobs already completed in DB (e.g. on resume)
        completed_jobs = []
        db_init = SessionLocal()
        try:
            prior_jobs = db_init.query(AnalysisJob).filter(
                AnalysisJob.batch_id == batch_id,
                AnalysisJob.status == "Completed"
            ).all()
            for pj in prior_jobs:
                completed_jobs.append({
                    "id": pj.id,
                    "task_id": pj.id,
                    "repo_url": pj.repo_url,
                    "team_name": pj.team_name,
                    "overall_score": pj.overall_score or 0,
                    "security_score": pj.security_score or 0,
                    "arch_score": pj.arch_score or 0,
                    "perf_score": pj.perf_score or 0,
                    "testing_score": pj.testing_score or 0,
                    "db_score": pj.db_score or 0,
                    "originality_score": pj.originality_score or 0,
                    "final_report": pj.final_report or {}
                })
            completed_count = len(completed_jobs)
        finally:
            db_init.close()

        logger.info(f"Starting batch orchestrator for {batch_id}: {total_repos} repositories ({completed_count} already completed) across {len(chunks)} chunks.")

        for chunk_idx, chunk in enumerate(chunks):
            current_chunk_num = chunk_idx + 1

            # 1. Update DB for chunk advancement
            db = SessionLocal()
            try:
                batch_row = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
                if batch_row:
                    batch_row.current_chunk = current_chunk_num
                    batch_row.status = "Processing"
                    db.commit()
            finally:
                db.close()

            broadcast_batch_event(batch_id, {
                "type": "BATCH_CHUNK_STARTED",
                "batch_id": batch_id,
                "status": "Processing",
                "current_chunk": current_chunk_num,
                "total_chunks": len(chunks),
                "chunk_size": len(chunk),
                "completed_repos": completed_count,
                "total_repos": total_repos,
                "message": f"Processing Window {current_chunk_num} of {len(chunks)} ({len(chunk)} repositories one by one)..."
            })

            # 2. Process each repository in the chunk sequentially (one by one)
            for item in chunk:
                task_id = item["task_id"]
                repo_url = item["repo_url"]
                repo_clean = item.get("repo_clean", repo_url)
                team_name = item.get("team_name", "Engineering Team")

                # Check if this repository is already completed
                db_chk = SessionLocal()
                already_done = False
                try:
                    curr_j = db_chk.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
                    if curr_j and curr_j.status == "Completed" and curr_j.overall_score is not None:
                        already_done = True
                finally:
                    db_chk.close()

                if already_done:
                    logger.info(f"[Batch Orchestrator] Skipping already completed task {task_id} ({repo_clean})")
                else:
                    broadcast_batch_event(batch_id, {
                        "type": "BATCH_ITEM_EVALUATING",
                        "batch_id": batch_id,
                        "status": "Processing",
                        "active_task_id": task_id,
                        "active_repo": repo_clean,
                        "active_repo_url": repo_url,
                        "team_name": team_name,
                        "current_chunk": current_chunk_num,
                        "total_chunks": len(chunks),
                        "completed_repos": completed_count,
                        "total_repos": total_repos,
                        "progress_percentage": round((completed_count / max(total_repos, 1)) * 100),
                        "message": f"Window {current_chunk_num}/{len(chunks)}: Analyzing '{repo_clean}' ({completed_count + 1}/{total_repos})..."
                    })

                    # Execute evaluation for this repository (dispatches to Celery worker)
                    try:
                        await _execute_repo_with_celery_or_direct(task_id, repo_url)
                    except Exception as e:
                        logger.error(f"Error evaluating repo {repo_url} in batch {batch_id}: {e}")

                    completed_count += 1

                # Fetch fresh evaluation data for leaderboard agent synthesis
                db = SessionLocal()
                try:
                    j = db.query(AnalysisJob).filter(AnalysisJob.id == task_id).first()
                    if j and not any(cj["task_id"] == task_id for cj in completed_jobs):
                        completed_jobs.append({
                            "id": j.id,
                            "task_id": j.id,
                            "repo_url": j.repo_url,
                            "team_name": j.team_name,
                            "overall_score": j.overall_score or 0,
                            "security_score": j.security_score or 0,
                            "arch_score": j.arch_score or 0,
                            "perf_score": j.perf_score or 0,
                            "testing_score": j.testing_score or 0,
                            "db_score": j.db_score or 0,
                            "originality_score": j.originality_score or 0,
                            "final_report": j.final_report or {}
                        })
                    
                    # Update Batch completed_repos in DB
                    b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
                    if b:
                        b.completed_repos = completed_count
                        db.commit()
                finally:
                    db.close()

                broadcast_batch_event(batch_id, {
                    "type": "BATCH_ITEM_COMPLETED",
                    "batch_id": batch_id,
                    "status": "Processing",
                    "completed_task_id": task_id,
                    "completed_repo": repo_clean,
                    "current_chunk": current_chunk_num,
                    "total_chunks": len(chunks),
                    "completed_repos": completed_count,
                    "total_repos": total_repos,
                    "progress_percentage": round((completed_count / max(total_repos, 1)) * 100)
                })

            # Cooldown between chunks of 5 repos to free resources cleanly
            await asyncio.sleep(1.0)

        # 3. All chunks completed -> Run the BatchLeaderboardAgent
        logger.info(f"All {total_repos} repositories evaluated for batch {batch_id}. Starting BatchLeaderboardAgent...")
        
        db = SessionLocal()
        try:
            b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
            if b:
                b.status = "Synthesizing"
                db.commit()
        finally:
            db.close()

        broadcast_batch_event(batch_id, {
            "type": "BATCH_LEADERBOARD_SYNTHESIZING",
            "batch_id": batch_id,
            "status": "Synthesizing",
            "completed_repos": completed_count,
            "total_repos": total_repos,
            "progress_percentage": 100,
            "message": "Cohort evaluations complete! Batch Leaderboard Agent synthesizing rankings, awards & badges..."
        })

        leaderboard_agent = BatchLeaderboardAgent()
        try:
            leaderboard_report = await leaderboard_agent.generate_leaderboard(
                batch_id=batch_id,
                batch_name=batch_name,
                evaluated_jobs=completed_jobs
            )
        except Exception as e:
            logger.error(f"Error in BatchLeaderboardAgent synthesis ({e}): falling back to deterministic synthesis")
            leaderboard_report = leaderboard_agent._deterministic_cohort_synthesis(batch_id, batch_name, completed_jobs)

        # 4. Save completed leaderboard report to DB
        db = SessionLocal()
        try:
            b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
            if b:
                b.status = "Completed"
                b.leaderboard_report = leaderboard_report
                b.completed_at = datetime.datetime.utcnow()
                db.commit()
        finally:
            db.close()

        broadcast_batch_event(batch_id, {
            "type": "BATCH_COMPLETED",
            "batch_id": batch_id,
            "status": "Completed",
            "completed_repos": total_repos,
            "total_repos": total_repos,
            "progress_percentage": 100,
            "leaderboard": leaderboard_report,
            "message": f"Leaderboard generation complete for batch '{batch_name}' ({total_repos} repositories ranked)!"
        })

        logger.info(f"Batch {batch_id} fully completed with AI Leaderboard generated.")
    except Exception as e:
        logger.exception(f"Unhandled error in batch orchestrator for {batch_id}: {e}")
        db = SessionLocal()
        try:
            b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
            if b and b.status != "Completed":
                b.status = "Failed"
                db.commit()
        finally:
            db.close()
    finally:
        _RUNNING_BATCH_TASKS.pop(batch_id, None)


def start_bulk_pipeline(
    items: List[Dict[str, Any]], 
    batch_name: str = "Bulk Evaluation Batch", 
    chunk_size: int = 5
) -> Dict[str, Any]:
    """
    Prepares and enqueues bulk repositories in chunks of 5.
    Returns immediately with queued batch details.
    """
    if not items:
        return {"status": "ERROR", "message": "No items provided"}

    batch_id = f"batch_{uuid.uuid4().hex[:10]}"
    normalized_items = []
    
    db = SessionLocal()
    try:
        for idx, item in enumerate(items):
            raw_url = item.get("repo_url", "").strip()
            if not raw_url:
                continue
            normalized_url = _normalize_repo_url(raw_url)
            task_id = str(uuid.uuid4())
            clean_url = normalized_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
            parts = [p for p in clean_url.split("/") if p]
            owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Developer")
            repo_title = parts[1] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Repository")
            
            user_team = item.get("team_name")
            team_title = user_team.strip() if (user_team and user_team.strip()) else f"{owner.capitalize()} Team"

            job = AnalysisJob(
                id=task_id,
                batch_id=batch_id,
                repo_url=normalized_url,
                team_name=team_title,
                language="Python" if any(k in normalized_url.lower() for k in ["py", "flask", "django"]) else "TypeScript",
                status="Queued"
            )
            db.add(job)

            normalized_items.append({
                "task_id": task_id,
                "repo_url": normalized_url,
                "repo_clean": clean_url,
                "team_name": team_title,
                "repo_title": repo_title
            })

        # Divide into chunks of chunk_size (default 5 repos at a time)
        chunks = [normalized_items[i:i + chunk_size] for i in range(0, len(normalized_items), chunk_size)]

        batch_record = BatchEvaluation(
            id=batch_id,
            name=batch_name,
            status="Processing",
            total_repos=len(normalized_items),
            completed_repos=0,
            current_chunk=1,
            total_chunks=len(chunks),
            chunk_size=chunk_size,
            repo_ids=[item["task_id"] for item in normalized_items]
        )
        db.add(batch_record)
        db.commit()
    finally:
        db.close()

    # Track in memory
    _ACTIVE_BATCHES[batch_id] = {
        "batch_id": batch_id,
        "name": batch_name,
        "status": "Processing",
        "total_repos": len(normalized_items),
        "completed_repos": 0,
        "current_chunk": 1,
        "total_chunks": len(chunks),
        "chunk_size": chunk_size,
        "jobs": normalized_items,
        "progress_percentage": 0,
        "message": f"Batch initialized. Processing window 1 of {len(chunks)} ({chunk_size} repos at a time)..."
    }

    # Dispatch asynchronous background worker
    try:
        loop = asyncio.get_running_loop()
        task = loop.create_task(_run_batch_worker(batch_id, batch_name, chunks))
        _RUNNING_BATCH_TASKS[batch_id] = task
    except RuntimeError:
        import threading
        def _bg_start():
            asyncio.run(_run_batch_worker(batch_id, batch_name, chunks))
        t = threading.Thread(target=_bg_start, daemon=True)
        t.start()

    return {
        "status": "QUEUED",
        "batch_id": batch_id,
        "name": batch_name,
        "total_repos": len(normalized_items),
        "total_chunks": len(chunks),
        "chunk_size": chunk_size,
        "jobs": normalized_items
    }


def resume_batch_pipeline(batch_id: str) -> Dict[str, Any]:
    """
    Resumes an existing batch that was paused or interrupted (e.g. after backend reload).
    Dispatches remaining queued/running jobs to Celery in 5-repo chunks.
    """
    # Prevent duplicate runs if already active
    existing_task = _RUNNING_BATCH_TASKS.get(batch_id)
    if existing_task and not existing_task.done():
        logger.info(f"Batch {batch_id} is already actively running.")
        return {"status": "ALREADY_RUNNING", "batch_id": batch_id}

    db = SessionLocal()
    try:
        b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
        if not b:
            return {"status": "ERROR", "message": f"Batch {batch_id} not found"}
        
        b_name = b.name or "Bulk Evaluation Batch"
        b_chunk_size = b.chunk_size or 5
        b_completed_repos = b.completed_repos or 0
        b_current_chunk = b.current_chunk or 1

        jobs = db.query(AnalysisJob).filter(AnalysisJob.batch_id == batch_id).all()
        if not jobs:
            return {"status": "ERROR", "message": f"No jobs found for batch {batch_id}"}
        
        normalized_items = []
        for j in jobs:
            clean_url = j.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
            parts = [p for p in clean_url.split("/") if p]
            owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Developer")
            repo_title = parts[1] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Repository")
            normalized_items.append({
                "task_id": j.id,
                "repo_url": j.repo_url,
                "repo_clean": clean_url,
                "team_name": j.team_name,
                "repo_title": repo_title
            })
        
        # Reset prematurely failed jobs (without reports) back to Queued
        db.query(AnalysisJob).filter(
            AnalysisJob.batch_id == batch_id,
            AnalysisJob.status == "Failed",
            AnalysisJob.final_report.is_(None)
        ).update({"status": "Queued"}, synchronize_session=False)
        db.commit()

        b_completed_repos = db.query(AnalysisJob).filter(
            AnalysisJob.batch_id == batch_id,
            AnalysisJob.status == "Completed"
        ).count()

        chunks = [normalized_items[i:i + b_chunk_size] for i in range(0, len(normalized_items), b_chunk_size)]
        
        b.status = "Processing"
        b.completed_repos = b_completed_repos
        db.commit()
    finally:
        db.close()
        
    _ACTIVE_BATCHES[batch_id] = {
        "batch_id": batch_id,
        "name": b_name,
        "status": "Processing",
        "total_repos": len(normalized_items),
        "completed_repos": b_completed_repos,
        "current_chunk": b_current_chunk,
        "total_chunks": len(chunks),
        "chunk_size": b_chunk_size,
        "jobs": normalized_items,
        "progress_percentage": round((b_completed_repos / max(len(normalized_items), 1)) * 100),
        "message": f"Processing batch {batch_id} (5 at a time via Celery)..."
    }
    
    try:
        loop = asyncio.get_running_loop()
        task = loop.create_task(_run_batch_worker(batch_id, b_name, chunks))
        _RUNNING_BATCH_TASKS[batch_id] = task
    except RuntimeError:
        import threading
        def _bg_resume():
            asyncio.run(_run_batch_worker(batch_id, b_name, chunks))
        t = threading.Thread(target=_bg_resume, daemon=True)
        t.start()

    return {
        "status": "RESUMED",
        "batch_id": batch_id,
        "total_repos": len(normalized_items),
        "total_chunks": len(chunks),
        "chunk_size": b_chunk_size
    }


def get_batch_status(batch_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full status and leaderboard report for a batch."""
    # Check in-memory first for live stats
    mem = _ACTIVE_BATCHES.get(batch_id, {})

    db = SessionLocal()
    try:
        b = db.query(BatchEvaluation).filter(BatchEvaluation.id == batch_id).first()
        if not b:
            return None if not mem else mem

        b_id = b.id
        b_name = b.name
        b_status = b.status
        b_total = b.total_repos
        b_completed = b.completed_repos
        b_chunk = b.current_chunk
        b_chunks_total = b.total_chunks
        b_chunk_size = b.chunk_size
        b_leaderboard = b.leaderboard_report
        b_created = b.created_at.strftime("%B %d, %Y - %H:%M UTC") if b.created_at else None
        b_completed_at = b.completed_at.strftime("%B %d, %Y - %H:%M UTC") if b.completed_at else None

        # Self-healing: If batch is marked Processing but no background task is currently running for it (e.g., after server reload), resume it!
        if b_status == "Processing":
            task = _RUNNING_BATCH_TASKS.get(b_id)
            if not task or task.done():
                logger.info(f"[Batch Orchestrator] Auto-resuming interrupted batch {b_id}")
                resume_batch_pipeline(b_id)

        # Query child jobs
        jobs = db.query(AnalysisJob).filter(AnalysisJob.batch_id == batch_id).all()
        job_list = []
        for j in jobs:
            clean_url = j.repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
            job_list.append({
                "task_id": j.id,
                "repo_url": j.repo_url,
                "repo": clean_url,
                "team_name": j.team_name,
                "status": j.status,
                "overall_score": j.overall_score,
                "security_score": j.security_score,
                "arch_score": j.arch_score,
                "perf_score": j.perf_score,
                "testing_score": j.testing_score,
                "db_score": j.db_score,
                "originality_score": j.originality_score,
                "completed_at": j.completed_at.strftime("%B %d, %Y - %H:%M UTC") if j.completed_at else None
            })

        return {
            "batch_id": b_id,
            "name": b_name,
            "status": b_status,
            "total_repos": b_total,
            "completed_repos": b_completed,
            "current_chunk": b_chunk,
            "total_chunks": b_chunks_total,
            "chunk_size": b_chunk_size,
            "progress_percentage": round((b_completed / max(b_total, 1)) * 100),
            "leaderboard": b_leaderboard,
            "active_repo": mem.get("active_repo"),
            "message": mem.get("message", f"Status: {b_status}"),
            "created_at": b_created,
            "completed_at": b_completed_at,
            "jobs": job_list
        }
    finally:
        db.close()


def get_latest_batch_report() -> Optional[Dict[str, Any]]:
    """Retrieves the most recent batch evaluation report."""
    db = SessionLocal()
    try:
        from sqlalchemy import desc
        b = db.query(BatchEvaluation).order_by(desc(BatchEvaluation.created_at)).first()
        if not b:
            return None
        return get_batch_status(b.id)
    finally:
        db.close()
