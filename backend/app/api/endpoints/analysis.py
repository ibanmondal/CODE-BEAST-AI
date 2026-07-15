from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.repository import Repository
from app.schemas.repository import RepositoryCreate, RepositoryResponse
# from app.services.github import collect_metadata # To be implemented
# from app.services.worker import trigger_analysis # To be implemented

router = APIRouter()

@router.post("/analyze", response_model=RepositoryResponse)
async def analyze_repository(
    repo_in: RepositoryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    url_str = str(repo_in.url)
    
    # Check if repo already exists and is analyzing
    stmt = select(Repository).where(Repository.url == url_str)
    result = await db.execute(stmt)
    existing_repo = result.scalars().first()
    
    if existing_repo:
        if existing_repo.status in ["PENDING", "CLONING", "ANALYZING"]:
            return existing_repo
        
        # If completed/failed, we might want to re-analyze, but for MVP let's just return it
        # or we could update status to PENDING and trigger again
        existing_repo.status = "PENDING"
        await db.commit()
        await db.refresh(existing_repo)
        repo = existing_repo
    else:
        # Create new repository record
        repo = Repository(url=url_str, status="PENDING")
        db.add(repo)
        await db.commit()
        await db.refresh(repo)
    
    # Trigger background task for analysis (Stage 1-5)
    # background_tasks.add_task(trigger_analysis, repo.id)
    
    return repo

@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository_status(
    repo_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Repository).where(Repository.id == repo_id)
    result = await db.execute(stmt)
    repo = result.scalars().first()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    return repo
