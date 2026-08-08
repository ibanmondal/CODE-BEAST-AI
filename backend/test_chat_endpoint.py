import asyncio
import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.endpoints.chat import chat_with_repository, ChatRequest, ChatMessage

async def run_chat_test():
    print("============================================================")
    print("      TESTING 'TALK TO REPOSITORY' JUDGE AI ASSISTANT       ")
    print("============================================================")
    
    mock_report = {
        "repoName": "ibanmondal/CODE-BEAST-AI",
        "overall_score": 88,
        "sec": 75,
        "arch": 92,
        "perf": 85,
        "testing_score": 80,
        "db_score": 90,
        "orig": 95,
        "confidence_score": 0.98,
        "variance_margin": 1.2,
        "consistency_status": "HIGH_CONFIDENCE",
        "executive_summary": "High performance multi-agent architecture with minor SQL parameterization issues.",
        "strengths": [
            "Modular LangGraph parallel fan-out orchestrator",
            "ConsJudge dual-pass consensus supervisor ensures deterministic bounds"
        ],
        "weaknesses": [
            "AutoReview detected potential CWE-89 raw string concatenation in queries",
            "Test coverage for edge-case clone mutations can be expanded"
        ],
        "cwe_matrix": [
            {
                "cwe_id": "CWE-89: SQL Injection",
                "severity": "MEDIUM",
                "file_path": "backend/app/database.py",
                "line_range": "lines 45-52",
                "trigger_vector": "String interpolation in dynamic SQL query execution without bind parameters.",
                "remediation_patch": "db.execute(select(AnalysisJob).where(AnalysisJob.id == :id), {'id': job_id})",
                "test_guidance": "assert malicious payload 'OR 1=1--' is safely escaped and raises 404."
            }
        ],
        "clone_risk_level": "LOW",
        "detected_clones": ["0 known templates matched"]
    }
    
    # Test Query 1: Security Deductions
    print("\n[Query 1] Asking about Security deductions & AutoReview findings...")
    req1 = ChatRequest(
        question="Why was the security score 75/100, and how do we fix the vulnerabilities?",
        report_context=mock_report
    )
    res1 = await chat_with_repository(req1)
    print(f"-> Model Used: {res1.model_used}")
    print(f"-> Citations: {res1.citations}")
    print(f"-> Answer Preview:\n{res1.answer[:300]}...\n")
    assert len(res1.answer) > 20, "Answer should not be empty"
    
    # Test Query 2: Architecture Critique
    print("[Query 2] Asking for a 30-second Hackathon Awards Pitch...")
    req2 = ChatRequest(
        question="Give me a 30-second awards pitch highlighting this project's top technical strengths.",
        report_context=mock_report
    )
    res2 = await chat_with_repository(req2)
    print(f"-> Model Used: {res2.model_used}")
    print(f"-> Answer Preview:\n{res2.answer[:300]}...\n")
    assert len(res2.answer) > 20, "Answer should not be empty"
    
    print("============================================================")
    print("      [PASSED] 'TALK TO REPOSITORY' COPILOT VERIFIED!      ")
    print("============================================================")

if __name__ == "__main__":
    asyncio.run(run_chat_test())
