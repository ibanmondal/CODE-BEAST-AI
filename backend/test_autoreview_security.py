import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv()

from app.agents.nodes import security_agent_node

async def test_autoreview():
    print("[TEST] Running 3-Stage AutoReview Security Agent...")
    
    mock_state = {
        "task_id": "test-sec-001",
        "repo_url": "https://github.com/ibanmondal/vulnerable-app",
        "context": {
            "directory_tree": "app/\n  routes/\n    auth.py\n    database.py\n  main.py",
            "dependencies": ["fastapi", "sqlite3", "pyjwt"],
            "readme_content": "# Vulnerable App demo with raw SQL queries",
            "faiss_index_path": ""
        }
    }
    
    result = await security_agent_node(mock_state)
    sec_report = result.get("security_report", {})
    
    print("\n[RESULT] AutoReview Security Output:")
    print(json.dumps(sec_report, indent=2))
    
    assert "security_score" in sec_report, "Missing security_score in SecurityReport"
    print("\n[PASSED] AutoReview 3-Stage Security Test Verified!")

if __name__ == "__main__":
    asyncio.run(test_autoreview())
