from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class RepositoryBase(BaseModel):
    url: HttpUrl

class RepositoryCreate(RepositoryBase):
    pass

class RepositoryResponse(RepositoryBase):
    id: int
    owner: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    stars: int = 0
    forks: int = 0
    language: Optional[str] = None
    topics: Optional[List[str]] = None
    status: str
    error_message: Optional[str] = None
    similarity_score: Optional[int] = None
    final_score: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
