import asyncio
import json
import os
import sys
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

from app.services.batch_orchestrator import start_bulk_pipeline, get_batch_status, get_latest_batch_report
from app.agents.leaderboard_agent import BatchLeaderboardAgent
from app.database import SessionLocal, BatchEvaluation, AnalysisJob

async def test_bulk_pipeline_and_agent():
    print("=================================================================")
    print("🚀 TEST: 5-at-a-Time Batch Pipeline & BatchLeaderboardAgent")
    print("=================================================================")

    # 1. Test BatchLeaderboardAgent standalone with sample evaluated cohort
    print("\n[Phase 1] Testing BatchLeaderboardAgent Cohort Synthesis...")
    mock_cohort = [
        {
            "id": "job-001",
            "repo_url": "https://github.com/pallets/flask",
            "team_name": "Pallets Team",
            "overall_score": 92,
            "security_score": 90,
            "arch_score": 94,
            "perf_score": 88,
            "testing_score": 85,
            "db_score": 90,
            "originality_score": 95,
            "final_report": {
                "strengths": ["Clear WSGI abstraction", "Modular blueprint design"],
                "weaknesses": ["Requires extension pinning"],
                "executive_summary": "Industry standard micro-framework with clean decoupled internals."
            }
        },
        {
            "id": "job-002",
            "repo_url": "https://github.com/fastapi/fastapi",
            "team_name": "FastAPI Core",
            "overall_score": 96,
            "security_score": 95,
            "arch_score": 96,
            "perf_score": 96,
            "testing_score": 94,
            "db_score": 92,
            "originality_score": 98,
            "final_report": {
                "strengths": ["Pydantic v2 async validation", "Native OpenAPI schema generator"],
                "weaknesses": ["Middleware layering overhead under extreme loads"],
                "executive_summary": "High-throughput modern ASGI framework with exceptional type safety."
            }
        },
        {
            "id": "job-003",
            "repo_url": "https://github.com/BlackIQ/Minis",
            "team_name": "Minis Team",
            "overall_score": 68,
            "security_score": 72,
            "arch_score": 60,
            "perf_score": 70,
            "testing_score": 25,
            "db_score": 70,
            "originality_score": 99,
            "final_report": {
                "strengths": ["Original multi-language beginner codebases"],
                "weaknesses": ["No automated testing suite", "Flat monolithic scripts"],
                "executive_summary": "Educational collection of starter scripts with high originality but minimal CI."
            }
        },
        {
            "id": "job-004",
            "repo_url": "https://github.com/expressjs/express",
            "team_name": "Express Foundation",
            "overall_score": 86,
            "security_score": 84,
            "arch_score": 88,
            "perf_score": 88,
            "testing_score": 82,
            "db_score": 85,
            "originality_score": 92,
            "final_report": {
                "strengths": ["Ubiquitous middleware ecosystem", "Minimalist routing layer"],
                "weaknesses": ["Legacy callback patterns in legacy modules"],
                "executive_summary": "Robust enterprise workhorse with proven stability."
            }
        },
        {
            "id": "job-005",
            "repo_url": "https://github.com/yuzakki/To-Do-List-App",
            "team_name": "Yuzakki Team",
            "overall_score": 74,
            "security_score": 75,
            "arch_score": 72,
            "perf_score": 74,
            "testing_score": 40,
            "db_score": 74,
            "originality_score": 96,
            "final_report": {
                "strengths": ["Clean responsive client-side UI"],
                "weaknesses": ["Local storage persistence without backend validations"],
                "executive_summary": "Simple frontend application with good UI finish."
            }
        },
        {
            "id": "job-006",
            "repo_url": "https://github.com/ONEmanLAW/Globe-DataVis",
            "team_name": "DataVis Team",
            "overall_score": 80,
            "security_score": 82,
            "arch_score": 80,
            "perf_score": 84,
            "testing_score": 50,
            "db_score": 80,
            "originality_score": 97,
            "final_report": {
                "strengths": ["3D globe WebGL shader pipelines"],
                "weaknesses": ["Bundle size optimization required"],
                "executive_summary": "Visually impressive WebGL visualization project."
            }
        }
    ]

    agent = BatchLeaderboardAgent()
    leaderboard_output = await agent.generate_leaderboard(
        batch_id="test_batch_001",
        batch_name="Engineering Hackathon Cohort",
        evaluated_jobs=mock_cohort
    )

    print(f"✅ Generated Leaderboard for {leaderboard_output.get('total_evaluated')} repositories!")
    print(f"📊 Cohort Average Score: {leaderboard_output.get('cohort_average_score')}/100")
    print(f"🏆 Top Ranked Repository: {leaderboard_output.get('highest_scoring_repo')}")
    print(f"🎖️ Awards Given: {len(leaderboard_output.get('awards', []))}")
    print(f"🏅 Rankings Count: {len(leaderboard_output.get('rankings', []))}")

    top_rank = leaderboard_output.get('rankings', [])[0]
    print(f"\n[Rank #1 Details]:")
    print(f"  - Repo: {top_rank.get('repo_name')}")
    print(f"  - Team: {top_rank.get('team_name')}")
    print(f"  - Score: {top_rank.get('overall_score')} (Grade: {top_rank.get('grade')})")
    print(f"  - Honor Badge: {top_rank.get('badge')}")
    print(f"  - Key Differentiator: {top_rank.get('key_differentiator')}")

    # Assertions
    assert len(leaderboard_output.get('rankings', [])) == 6, "Expected 6 ranked repos"
    assert leaderboard_output.get('rankings', [])[0]['rank'] == 1, "Expected rank 1 at index 0"
    assert leaderboard_output.get('rankings', [])[0]['overall_score'] >= leaderboard_output.get('rankings', [])[1]['overall_score'], "Rank 1 score must be >= Rank 2"
    assert len(leaderboard_output.get('awards', [])) >= 1, "Expected at least 1 award"

    # 2. Test Batch Chunking in BatchOrchestrator
    print("\n[Phase 2] Testing 5-at-a-Time Batch Pipeline Chunking...")
    sample_repos = [
        {"repo_url": "https://github.com/repo1/test", "team_name": "Team 1"},
        {"repo_url": "https://github.com/repo2/test", "team_name": "Team 2"},
        {"repo_url": "https://github.com/repo3/test", "team_name": "Team 3"},
        {"repo_url": "https://github.com/repo4/test", "team_name": "Team 4"},
        {"repo_url": "https://github.com/repo5/test", "team_name": "Team 5"},
        {"repo_url": "https://github.com/repo6/test", "team_name": "Team 6"},
        {"repo_url": "https://github.com/repo7/test", "team_name": "Team 7"},
    ]

    batch_resp = start_bulk_pipeline(sample_repos, batch_name="Test Window Cohort", chunk_size=5)
    print("Batch Response:", json.dumps({
        "batch_id": batch_resp["batch_id"],
        "total_repos": batch_resp["total_repos"],
        "total_chunks": batch_resp["total_chunks"],
        "chunk_size": batch_resp["chunk_size"],
        "status": batch_resp["status"]
    }, indent=2))

    assert batch_resp["total_repos"] == 7, "Expected 7 total repos"
    assert batch_resp["total_chunks"] == 2, "Expected 2 chunks (5 in chunk 1, 2 in chunk 2)"
    assert batch_resp["chunk_size"] == 5, "Expected chunk size of 5"

    status = get_batch_status(batch_resp["batch_id"])
    assert status is not None, "Expected batch status record"
    print(f"Batch Status retrieved: {status.get('status')} (Window {status.get('current_chunk')} of {status.get('total_chunks')})")

    print("\n=================================================================")
    print("✅ ALL TESTS PASSED! 5-at-a-time Pipeline & Leaderboard Agent Verified!")
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(test_bulk_pipeline_and_agent())
