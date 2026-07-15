import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.agents.nodes import testing_agent_node, database_agent_node

async def run_tests():
    print("Testing New Agents (Groq & Gemini Mixture)...\n")
    
    mock_state = {
        "repo_url": "https://github.com/test/repo",
        "context": {
            "directory_tree": "src/\n  tests/\n    test_app.py\n  models/\n    user.py",
            "dependencies": ["pytest", "sqlalchemy", "psycopg2"],
            "readme_content": "This is a test project with Pytest and SQLAlchemy.",
            "faiss_index_path": ""  # No faiss for quick test
        }
    }

    print("--- Running Testing Agent (Groq) ---")
    test_result = await testing_agent_node(mock_state)
    print("\nResult:")
    print(test_result)
    print("\n" + "="*50 + "\n")

    print("--- Running Database Agent (Gemini) ---")
    db_result = await database_agent_node(mock_state)
    print("\nResult:")
    print(db_result)
    print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
