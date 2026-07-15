from app.database import SessionLocal, AnalysisJob
import json

db = SessionLocal()
jobs = db.query(AnalysisJob).order_by(AnalysisJob.created_at.desc()).limit(3).all()

for job in jobs:
    print(f"Job ID: {job.id}")
    print(f"Status: {job.status}")
    print(f"Overall: {job.overall_score}")
    print(f"Final Report: {json.dumps(job.final_report)[:200]}...")
    print("-" * 40)
db.close()
