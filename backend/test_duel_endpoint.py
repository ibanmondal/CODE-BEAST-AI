import asyncio
from app.api.endpoints.duel import compare_repositories, DuelRequest

async def test_duel():
    req = DuelRequest(
        repo_a="https://github.com/torvalds/linux",
        repo_b="https://github.com/pallets/flask"
    )
    res = await compare_repositories(req)
    print("Duel Result:")
    print("Team A:", res.team_a["repo"], "Score:", res.team_a["overall"])
    print("Team B:", res.team_b["repo"], "Score:", res.team_b["overall"])
    print("Winner:", res.verdict.winner_name, "| Margin:", res.verdict.win_margin)
    print("Decisive Factors:", res.verdict.decisive_factors)
    print("Cross Similarity:", res.cross_similarity.overlap_score, "%")
    print("Radar Data length:", len(res.radar_data))
    print("SUCCESS: Duel Engine is fully functional!")

if __name__ == "__main__":
    asyncio.run(test_duel())
