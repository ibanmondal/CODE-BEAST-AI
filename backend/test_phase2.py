import asyncio
from app.services.github_collector import GithubMetadataCollector
from app.services.repo_cloner import RepositoryCloner
from app.services.context_builder import ContextBuilder
from app.core.early_exit import EarlyExitEngine, EarlyExitException

async def run_phase2_test():
    test_url = "https://github.com/tiangolo/fastapi"
    print(f"Testing Phase 2 Pipeline on: {test_url}\n")
    
    # 1. GitHub Metadata
    collector = GithubMetadataCollector()
    try:
        print("[1] Fetching Metadata...")
        metadata = await collector.collect_metadata(test_url)
        print(f"Metadata collected: {metadata['name']} - {metadata['stars']} stars, {metadata['commits_count']} commits.")
    except Exception as e:
        print(f"Error fetching metadata: {e}")
        return

    # 2. Early Exit Check
    print("\n[2] Running Early Exit Engine...")
    try:
        EarlyExitEngine.evaluate_metadata(metadata)
        print("Early Exit Engine passed.")
    except EarlyExitException as e:
        print(f"Early Exit Triggered: {e.reason} - {e}")
        return

    # 3. Clone Repository
    print("\n[3] Cloning Repository...")
    cloner = RepositoryCloner(base_dir="./test_repos")
    try:
        repo_path = cloner.clone_repository(test_url)
        print(f"Repository cloned to {repo_path}")
    except Exception as e:
        print(f"Error cloning repository: {e}")
        return

    # 4. Build Context (and FAISS)
    print("\n[4] Building Context and FAISS Index (this might take a moment to download the model)...")
    try:
        builder = ContextBuilder(repo_path)
        context = builder.build_context()
        print(f"Context Built Successfully!")
        print(f"- Tree preview: \\n{context['directory_tree'][:200]}...")
        print(f"- Dependencies detected: {context['dependencies']}")
        print(f"- FAISS index saved at: {context['faiss_index_path']}")
    except Exception as e:
        print(f"Error building context: {e}")
    finally:
        # Cleanup
        print("\n[5] Cleaning up...")
        cloner.cleanup(test_url)
        print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(run_phase2_test())
