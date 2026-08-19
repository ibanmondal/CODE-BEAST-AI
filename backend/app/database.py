import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

logger = logging.getLogger(__name__)

# Primary PostgreSQL or SQLite connection string
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/codebeast")

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

def init_engine():
    global DATABASE_URL
    try:
        if DATABASE_URL.startswith("sqlite"):
            eng = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            eng = create_engine(DATABASE_URL)
        # Attempt a quick connection test
        with eng.connect():
            pass
        return eng
    except Exception as e:
        print(f"[CodeBeast DB] Notice: PostgreSQL at '{DATABASE_URL}' is unreachable ({e}).")
        print("[CodeBeast DB] -> Gracefully initializing local SQLite database (sqlite:///./codebeast.db)...")
        sqlite_url = "sqlite:///./codebeast.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

