import asyncio
import os
import shutil
from app.services.github_collector import GithubMetadataCollector
from app.services.repo_cloner import RepositoryCloner
from app.services.context_builder import ContextBuilder
from app.services.similarity_engine import SimilarityEngine
from app.services.scoring_engine import ScoringEngine

async def run_phase3_test():
    test_url = "https://github.com/tiangolo/fastapi"
    print(f"Testing Phase 3 Pipeline on: {test_url}\n")
    
    cloner = RepositoryCloner(base_dir="./test_repos")
    repo_path = ""
    try:
        # 1. Ingestion
        print("[1] Fetching Metadata...")
        collector = GithubMetadataCollector()
        metadata = await collector.collect_metadata(test_url)
        
        print("\n[2] Cloning Repository...")
        repo_path = cloner.clone_repository(test_url)
        
        print("\n[3] Building Context...")
        builder = ContextBuilder(repo_path)
        context = builder.build_context()
        
        # 2. Analysis
        print("\n[4] Running Similarity Engine (CodeBERT)...")
        # Ensure we have mock templates to compare against
        sim_engine = SimilarityEngine()
        sim_engine.seed_mock_template_db()
        similarity = sim_engine.analyze_repository(repo_path)
        print(f"Similarity Score: {similarity['similarity_score']}%")
        for ev in similarity['evidence']:
            print(f" - {ev}")
            
        print("\n[5] Running Deterministic Scoring Engine...")
        scoring_engine = ScoringEngine()
        score_result = scoring_engine.calculate_score(metadata, context, similarity)
        print(f"Final Deterministic Score: {score_result['final_score']}")
        for ev in score_result['evidence']:
            print(f" - {ev}")

    except Exception as e:
        print(f"Error in pipeline: {e}")
    finally:
        print("\n[6] Cleaning up...")
        if repo_path:
            cloner.cleanup(test_url)
        # Cleanup mock DB created during test
        if os.path.exists("./mock_templates_db"):
            shutil.rmtree("./mock_templates_db")
        print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(run_phase3_test())
