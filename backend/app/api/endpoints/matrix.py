import logging
from typing import List, Dict, Any
from fastapi import APIRouter
import hashlib

from app.database import SessionLocal, AnalysisJob

logger = logging.getLogger(__name__)
router = APIRouter()

def compute_pairwise_similarity(job_a: AnalysisJob, job_b: AnalysisJob) -> float:
    """
    Computes a deterministic mock similarity score between two repositories.
    In a full production scenario, this would compute FAISS/CodeBERT distances 
    between the stored AST vectors.
    """
    if job_a.id == job_b.id:
        return 100.0
    
    # Deterministic mock based on repo names to keep it consistent
    combined = sorted([job_a.repo_url.lower(), job_b.repo_url.lower()])
    hash_val = int(hashlib.md5(f"{combined[0]}_{combined[1]}".encode()).hexdigest(), 16)
    
    # Scale to a 0-100 range, heavily biased towards low similarity (0-30%)
    # unless it's a known clone pair
    base_sim = (hash_val % 300) / 10.0  # 0 to 30.0
    
    # Adjust based on originality scores if available
    orig_a = job_a.originality_score or 100
    orig_b = job_b.originality_score or 100
    
    # If both have low originality, increase similarity chance
    if orig_a < 80 and orig_b < 80:
        base_sim += (100 - orig_a) * 0.5 + (100 - orig_b) * 0.5
        
    return min(100.0, max(0.0, base_sim))

@router.get("/heatmap")
def get_plagiarism_heatmap() -> Dict[str, Any]:
    """
    Returns an N x N similarity matrix for all evaluated repositories.
    Used for the N x N Plagiarism Heatmap visualization.
    """
    db = SessionLocal()
    try:
        # Fetch all completed jobs
        jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "Completed").all()
        
        # We need unique repos (take latest if multiple runs)
        repo_map = {}
        for job in jobs:
            repo_slug = job.repo_url.split("/")[-1] if "/" in job.repo_url else job.repo_url
            if repo_slug not in repo_map or job.created_at > repo_map[repo_slug].created_at:
                repo_map[repo_slug] = job
                
        unique_jobs = list(repo_map.values())
        
        # Limit to 20 for visualization sanity if too large
        unique_jobs = unique_jobs[:20]
        
        labels = []
        for job in unique_jobs:
            name = job.team_name if job.team_name else (job.repo_url.split("/")[-1] if "/" in job.repo_url else job.repo_url)
            labels.append(name)
            
        matrix = []
        for i, job_a in enumerate(unique_jobs):
            row = []
            for j, job_b in enumerate(unique_jobs):
                sim = compute_pairwise_similarity(job_a, job_b)
                row.append(round(sim, 1))
            matrix.append(row)
            
        return {
            "labels": labels,
            "matrix": matrix,
            "count": len(labels)
        }
    except Exception as e:
        logger.error(f"Error generating heatmap: {e}")
        return {"labels": [], "matrix": [], "count": 0, "error": str(e)}
    finally:
        db.close()
