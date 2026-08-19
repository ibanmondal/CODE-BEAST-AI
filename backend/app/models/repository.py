from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    owner = Column(String, index=True)
    name = Column(String, index=True)
    description = Column(String)
    
    # Metadata
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    language = Column(String)
    topics = Column(JSON)
    
    # Analysis Status
    status = Column(String, default="PENDING") # PENDING, CLONING, ANALYZING, COMPLETED, FAILED
    error_message = Column(String)
    
    # Results
    similarity_score = Column(Integer, nullable=True)
    final_score = Column(Integer, nullable=True)
    report_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
