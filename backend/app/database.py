import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

logger = logging.getLogger(__name__)

from dotenv import load_dotenv
load_dotenv()

# Primary PostgreSQL or SQLite connection string
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./codebeast.db")

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
    finops_score = Column(Integer, default=0)
    
    final_report = Column(JSON, nullable=True)
    batch_id = Column(String, nullable=True, index=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class BatchEvaluation(Base):
    __tablename__ = "batch_evaluations"

    id = Column(String, primary_key=True, index=True) # Batch ID e.g. batch_uuid
    name = Column(String, default="Bulk Evaluation Batch")
    status = Column(String, default="Processing") # Processing, Synthesizing, Completed, Failed
    total_repos = Column(Integer, default=0)
    completed_repos = Column(Integer, default=0)
    current_chunk = Column(Integer, default=1)
    total_chunks = Column(Integer, default=1)
    chunk_size = Column(Integer, default=5)
    
    repo_ids = Column(JSON, default=list) # List of task_ids / job specs
    leaderboard_report = Column(JSON, nullable=True) # Full AI Leaderboard Agent output
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

def init_engine():
    global DATABASE_URL
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    try:
        if DATABASE_URL.startswith("sqlite"):
            eng = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            eng = create_engine(DATABASE_URL, pool_pre_ping=True)
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

def ensure_schema_migrations():
    try:
        with engine.connect() as conn:
            if str(engine.url).startswith("sqlite"):
                raw_conn = conn.connection
                cursor = raw_conn.cursor()
                cursor.execute("PRAGMA table_info(analysis_jobs)")
                cols = [r[1] for r in cursor.fetchall()]
                if "batch_id" not in cols:
                    cursor.execute("ALTER TABLE analysis_jobs ADD COLUMN batch_id VARCHAR")
                    raw_conn.commit()
    except Exception as e:
        logger.debug(f"Schema check notice: {e}")

ensure_schema_migrations()

