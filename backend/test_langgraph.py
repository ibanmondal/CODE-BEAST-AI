import asyncio
import json
from app.agents.graph import create_orchestrator_graph

async def run_langgraph_test():
    print("Testing Phase 4: LangGraph Orchestrator with Ollama")
    
    # Compile the graph
    graph = create_orchestrator_graph()
    
    # Mock some basic context so we don't have to run Phase 2/3 for this test
    # BUT we are using the REAL LLM agents with this context
    initial_state = {
        "repo_url": "https://github.com/mock/repo",
        "metadata": {},
        "context": {
            "directory_tree": "src/\n    main.py\n    utils.py\n    auth.py\nREADME.md\nrequirements.txt",
            "readme_content": "# Mock Repo\nThis is a mock repository for testing.",
            "dependencies": ["Python (requirements.txt)"]
        },
        "similarity_result": {},
        "deterministic_score_result": {}
    }
    
    print("\nInvoking Graph. This will trigger Ollama models (qwen2.5-coder and deepseek-coder) in parallel...")
    print("Ensure Ollama is running and the models are pulled!")
    
    try:
        # We use ainvoke to run the async graph
        final_state = await graph.ainvoke(initial_state)
        
        print("\n--- Execution Complete ---")
        print("\n[Security Report]")
        print(json.dumps(final_state.get('security_report'), indent=2))
        
        print("\n[Architecture Report]")
        print(json.dumps(final_state.get('architecture_report'), indent=2))
        
        print("\n[DX Report]")
        print(json.dumps(final_state.get('dx_report'), indent=2))
        
    except Exception as e:
        print(f"\nGraph execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_langgraph_test())
