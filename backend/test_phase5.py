import asyncio
import json
from dotenv import load_dotenv
from app.agents.graph import create_orchestrator_graph

load_dotenv()

async def run_test():
    print("Testing Phase 5: Gemini Supervisor")
    
    graph = create_orchestrator_graph()
    
    # Dummy State with realistic data
    initial_state = {
        "repo_url": "https://github.com/tiangolo/fastapi",
        "metadata": {"name": "fastapi", "stars": 70000},
        "context": {
            "directory_tree": "fastapi/\n  main.py\n  routing.py\n  dependencies/\n",
            "dependencies": ["pydantic", "starlette", "anyio"],
            "readme_content": "# FastAPI\nFastAPI is a modern, fast (high-performance), web framework for building APIs."
        },
        "similarity_result": {"score": 0, "message": "No plagiarism detected"},
        "deterministic_score_result": {"score": 90, "message": "Excellent project"},
        "security_report": None,
        "architecture_report": None,
        "dx_report": None,
        "final_report": None
    }
    
    print("\nInvoking Graph...")
    result_state = await graph.ainvoke(initial_state)
    
    print("\n--- Execution Complete ---")
    print("\n[Final Report (Gemini)]")
    if "final_report" in result_state:
        print(json.dumps(result_state["final_report"], indent=2))
    else:
        print("No final report generated.")

if __name__ == "__main__":
    asyncio.run(run_test())
