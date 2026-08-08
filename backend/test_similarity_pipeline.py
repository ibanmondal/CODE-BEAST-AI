import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv()

from app.agents.graph import create_orchestrator_graph

async def test_full_graph():
    print("[TEST] Running 6-Agent LangGraph Pipeline with Similarity Agent...")
    
    graph = create_orchestrator_graph()
    
    initial_state = {
        "task_id": "test-sim-001",
        "repo_url": "https://github.com/ibanmondal/CodeBeast-Test",
        "metadata": {"stars": 12, "forks": 2, "commits_count": 45},
        "context": {"faiss_index_path": ""},
        "similarity_result": {
            "similarity_score": 14,
            "evidence": ["Found 2 functions matching standard template out of 14 total functions."]
        },
        "deterministic_score_result": {
            "score": 88,
            "details": "Healthy repository"
        },
        "security_report": None,
        "architecture_report": None,
        "perf_report": None,
        "testing_report": None,
        "db_report": None,
        "similarity_report": None,
        "final_report": None
    }
    
    final_output = await graph.ainvoke(initial_state)
    
    print("\n[SUCCESS] Pipeline Execution Complete!")
    sim_report = final_output.get("similarity_report", {})
    final_report = final_output.get("final_report", {})
    
    print("\n--- Similarity Report ---")
    print(json.dumps(sim_report, indent=2))
    
    print("\n--- Final Consolidated Report ---")
    print(json.dumps(final_report, indent=2))
    
    assert "originality_score" in sim_report, "Missing originality_score in similarity report"
    assert "overall_score" in final_report, "Missing overall_score in final report"
    assert "confidence_score" in final_report, "Missing confidence_score in final report"
    
    print("\n[PASSED] All Phase 2 Assertions Verified!")

if __name__ == "__main__":
    asyncio.run(test_full_graph())
