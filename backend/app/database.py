import os
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

# PostgreSQL connection string
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/codebeast")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String, primary_key=True, index=True) # Task ID
    repo_url = Column(String, index=True)
    status = Column(String, default="Queued") # Queued, Running, Completed, Failed
    language = Column(String, default="Unknown")
    team_name = Column(String, default="Unknown")
    
    overall_score = Column(Integer, default=0)
    security_score = Column(Integer, default=0)
    arch_score = Column(Integer, default=0)
    perf_score = Column(Integer, default=0)
    testing_score = Column(Integer, default=0)
    db_score = Column(Integer, default=0)
    originality_score = Column(Integer, default=0)
    
    final_report = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)
