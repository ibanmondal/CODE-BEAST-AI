import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

from app.agents.nodes import gemini_supervisor_node

async def test_cons_judge():
    print("[TEST] Running Test: ConsJudge Multi-Pass Supervisor Consistency Layer")
    
    mock_state = {
        "task_id": "test-consjudge-001",
        "repo_url": "https://github.com/ibanmondal/CodeBeast-Test",
        "security_report": {
            "vulnerabilities_found": ["Hardcoded test API key in auth.py:12"],
            "risk_level": "MEDIUM",
            "recommendations": ["Move credentials to .env"],
            "security_score": 75
        },
        "architecture_report": {
            "patterns_identified": ["Repository Pattern", "FastAPI Service Layer"],
            "modularity_score": 88,
            "concerns": ["Slight coupling in router handlers"]
        },
        "perf_report": {
            "bottlenecks": ["Uncached database read in loop"],
            "perf_score": 82,
            "suggestions": ["Add Redis cache layer"]
        },
        "testing_report": {
            "test_coverage": "Moderate",
            "frameworks_used": ["pytest", "jest"],
            "testing_score": 80
        },
        "db_report": {
            "schema_quality": "High",
            "orms_used": ["SQLAlchemy", "Alembic"],
            "db_score": 90
        },
        "deterministic_score_result": {
            "score": 85,
            "details": "Healthy repo with balanced modularity"
        }
    }
    
    result = await gemini_supervisor_node(mock_state)
    final_report = result.get("final_report", {})
    
    print("\n[SUCCESS] --- ConsJudge Evaluation Output ---")
    print(json.dumps(final_report, indent=2))
    
    assert "overall_score" in final_report, "Missing overall_score"
    assert "confidence_score" in final_report, "Missing confidence_score"
    assert "variance_margin" in final_report, "Missing variance_margin"
    assert "consistency_status" in final_report, "Missing consistency_status"
    
    print("\n[PASSED] All Assertions Passed!")
    print(f"Final Score: {final_report['overall_score']} +/- {final_report['variance_margin']}")
    print(f"Consistency Status: {final_report['consistency_status']}")
    print(f"Confidence Score: {final_report['confidence_score'] * 100}%")
    print(f"Judge Passes: {final_report.get('judge_passes', 1)}")

if __name__ == "__main__":
    asyncio.run(test_cons_judge())
