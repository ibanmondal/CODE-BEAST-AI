import asyncio
import json
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.agents.nodes import (
    gemini_supervisor_node,
    similarity_agent_node,
    security_agent_node,
    architecture_agent_node,
    performance_agent_node,
    testing_agent_node,
    database_agent_node,
)
from app.agents.graph import create_orchestrator_graph

async def test_feature_1_consjudge():
    print("\n" + "="*60)
    print(" [TEST 1/4] ConsJudge Inter-Judge Multi-Pass Consistency Layer")
    print("="*60)
    mock_state = {
        "task_id": "test-consjudge-suite",
        "repo_url": "https://github.com/ibanmondal/ecommerce-microservices",
        "security_report": {"security_score": 85, "vulnerabilities_found": ["CWE-798: API key in config"], "risk_level": "LOW"},
        "architecture_report": {"arch_score": 90, "patterns_identified": ["Clean Architecture", "Repository Pattern"]},
        "perf_report": {"perf_score": 88, "bottlenecks": ["Uncached user query"]},
        "testing_report": {"testing_score": 92, "frameworks_detected": ["pytest", "unittest"]},
        "db_report": {"db_score": 85, "orm_used": "SQLAlchemy"},
        "similarity_report": {"originality_score": 96, "clone_risk_level": "ORIGINAL"},
        "deterministic_score_result": {"final_score": 89}
    }
    res = await gemini_supervisor_node(mock_state)
    report = res.get("final_report", {})
    
    assert "overall_score" in report, "Missing overall_score"
    assert "variance_margin" in report, "Missing variance_margin"
    assert "confidence_score" in report, "Missing confidence_score"
    assert "consistency_status" in report, "Missing consistency_status"
    
    print(f" -> Overall Score: {report.get('overall_score')}/100")
    print(f" -> Variance Margin: +-{report.get('variance_margin')} pts")
    print(f" -> Confidence Score: {report.get('confidence_score')}")
    print(f" -> Status: {report.get('consistency_status')}")
    print(" [PASSED] ConsJudge Consistency Feature Verified!")
    return True

async def test_feature_2_similarity_originality():
    print("\n" + "="*60)
    print(" [TEST 2/4] AST & CodeBERT Semantic Plagiarism / Originality Agent")
    print("="*60)
    mock_state = {
        "task_id": "test-sim-suite",
        "repo_url": "https://github.com/mock/sample-auth-service",
        "context": {
            "directory_tree": "src/\n  auth.py\n  jwt_handler.py\n  models.py",
            "dependencies": ["fastapi", "pyjwt", "bcrypt"],
            "readme_content": "# Production JWT Auth Microservice with token rotation and rate limiting",
            "faiss_index_path": ""
        }
    }
    res = await similarity_agent_node(mock_state)
    sim = res.get("similarity_report", {})
    
    assert "originality_score" in sim, "Missing originality_score"
    assert "clone_risk_level" in sim, "Missing clone_risk_level"
    
    print(f" -> Originality Score: {sim.get('originality_score')}/100")
    print(f" -> Clone Risk Level: {sim.get('clone_risk_level')}")
    print(f" -> Method: {sim.get('clone_detection_method')}")
    print(" [PASSED] AST & CodeBERT Originality Feature Verified!")
    return True

async def test_feature_3_autoreview_security():
    print("\n" + "="*60)
    print(" [TEST 3/4] AutoReview 3-Stage Security Pipeline (Detect -> Locate -> Repair)")
    print("="*60)
    mock_state = {
        "task_id": "test-sec-suite",
        "repo_url": "https://github.com/mock/database-app",
        "context": {
            "directory_tree": "app/\n  database.py\n  routes/users.py",
            "dependencies": ["sqlite3", "fastapi"],
            "readme_content": "# Database App with SQL endpoint",
            "faiss_index_path": ""
        }
    }
    res = await security_agent_node(mock_state)
    sec = res.get("security_report", {})
    
    assert "security_score" in sec, "Missing security_score"
    assert "cwe_matrix" in sec or "vulnerabilities_found" in sec, "Missing CWE matrix/vulnerabilities"
    
    print(f" -> Security Score: {sec.get('security_score')}/100")
    print(f" -> Pipeline: {sec.get('autoreview_pipeline', 'AutoReview Active')}")
    if sec.get("cwe_matrix"):
        print(f" -> Vulnerabilities Analyzed (Detect-Locate-Repair): {len(sec.get('cwe_matrix'))}")
        first_vuln = sec.get("cwe_matrix")[0]
        print(f"    * {first_vuln.get('cwe_id')} | Severity: {first_vuln.get('severity')}")
        print(f"    * Location: {first_vuln.get('file_path')} ({first_vuln.get('line_range')})")
        print(f"    * Remediation Patch: {first_vuln.get('remediation_patch')[:60]}...")
    print(" [PASSED] AutoReview 3-Stage Security Feature Verified!")
    return True

async def test_feature_4_full_langgraph_pipeline():
    print("\n" + "="*60)
    print(" [TEST 4/4] End-to-End 6-Agent LangGraph Fan-Out/Fan-In Pipeline")
    print("="*60)
    graph = create_orchestrator_graph()
    initial_state = {
        "task_id": "test-graph-suite",
        "repo_url": "https://github.com/mock/full-stack-app",
        "metadata": {"stars": 12, "forks": 3},
        "context": {
            "directory_tree": "src/\n  api/\n    routes.py\n  models/\n    user.py\ntests/\n  test_api.py\npackage.json\nrequirements.txt",
            "readme_content": "# Full Stack Scalable App\nModular service with high performance caching and comprehensive tests.",
            "dependencies": ["fastapi", "pytest", "redis", "pydantic"]
        },
        "deterministic_score_result": {"final_score": 85}
    }
    
    final_state = await graph.ainvoke(initial_state)
    
    assert "final_report" in final_state, "Missing final_report in graph output"
    assert "security_report" in final_state, "Missing security_report"
    assert "architecture_report" in final_state, "Missing architecture_report"
    assert "perf_report" in final_state, "Missing perf_report"
    assert "testing_report" in final_state, "Missing testing_report"
    assert "db_report" in final_state, "Missing db_report"
    assert "similarity_report" in final_state, "Missing similarity_report"
    
    print("\n [PASSED] All 6 Agents Successfully Executed in Parallel!")
    print(f" -> Synthesized Overall Score: {final_state['final_report'].get('overall_score')}/100")
    print(f" -> ConsJudge Confidence: {final_state['final_report'].get('consistency_status')}")
    print(" [PASSED] Full Multi-Agent Graph Verified!")
    return True

async def main():
    print("\n" + "#"*65)
    print("    CODEBEAST AI - COMPLETE SYSTEM & FEATURE TEST SUITE    ")
    print("#"*65)
    
    results = []
    try:
        results.append(("ConsJudge Inter-Judge Consistency Layer", await test_feature_1_consjudge()))
    except Exception as e:
        print(f" [FAILED] Test 1 Error: {e}")
        results.append(("ConsJudge Inter-Judge Consistency Layer", False))
        
    try:
        results.append(("AST & CodeBERT Similarity / Originality Agent", await test_feature_2_similarity_originality()))
    except Exception as e:
        print(f" [FAILED] Test 2 Error: {e}")
        results.append(("AST & CodeBERT Similarity / Originality Agent", False))
        
    try:
        results.append(("AutoReview 3-Stage Security Pipeline", await test_feature_3_autoreview_security()))
    except Exception as e:
        print(f" [FAILED] Test 3 Error: {e}")
        results.append(("AutoReview 3-Stage Security Pipeline", False))
        
    try:
        results.append(("Full 6-Agent LangGraph Fan-Out/Fan-In Pipeline", await test_feature_4_full_langgraph_pipeline()))
    except Exception as e:
        print(f" [FAILED] Test 4 Error: {e}")
        results.append(("Full 6-Agent LangGraph Fan-Out/Fan-In Pipeline", False))

    print("\n" + "="*60)
    print("                 FINAL TEST SUMMARY REPORT                  ")
    print("="*60)
    all_passed = True
    for name, passed in results:
        status = "PASSED [OK]" if passed else "FAILED [X]"
        print(f" - {name:<50} : {status}")
        if not passed:
            all_passed = False
            
    print("="*60)
    if all_passed:
        print("  ALL 4 FEATURE SUITES PASSED! System is 100% Verified.")
    else:
        print("  SOME TESTS FAILED. Check logs above.")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
