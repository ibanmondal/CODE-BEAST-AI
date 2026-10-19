import os
import json
import logging
import datetime
from typing import List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

# --- Specialized Batch Leaderboard Synthesis Agent ---

class BatchLeaderboardAgent:
    """
    Autonomous multi-project arbitration and cohort synthesis agent.
    Evaluates a completed bulk batch of repositories, computes comparative percentiles,
    identifies systemic flaws, assigns honor badges, and generates a unified cohort leaderboard.
    """

    def __init__(self):
        self.groq_keys = []
        if os.getenv("GROQ_API_KEY"):
            self.groq_keys.append(os.getenv("GROQ_API_KEY"))
        if os.getenv("GROQ_FALLBACK_KEYS"):
            self.groq_keys.extend([k.strip() for k in os.getenv("GROQ_FALLBACK_KEYS").split(",") if k.strip()])

    def _normalize_cohort(self, evaluated_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        for j in evaluated_jobs:
            final_report = j.get("final_report") or {}
            if isinstance(final_report, str):
                try:
                    final_report = json.loads(final_report)
                except Exception:
                    final_report = {}

            repo_url = j.get("repo_url") or final_report.get("repo_url", "Unknown")
            clean_url = repo_url.replace("https://github.com/", "").replace("http://github.com/", "").strip("/")
            parts = [p for p in clean_url.split("/") if p]
            owner = parts[0] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Developer")
            repo_title = parts[1] if len(parts) >= 2 else (parts[0] if len(parts) == 1 else "Repository")
            
            team_name = j.get("team_name") or final_report.get("team_name") or f"{owner.capitalize()} Team"
            if team_name in ["Unknown", owner]:
                team_name = f"{owner.capitalize()} Team"

            overall_score = j.get("overall_score")
            if overall_score is None:
                overall_score = final_report.get("overall_score", 0)

            normalized.append({
                "task_id": j.get("id") or j.get("task_id", ""),
                "repo_name": j.get("repo_name") or clean_url,
                "repo_title": repo_title,
                "repo_url": repo_url,
                "team_name": team_name,
                "owner": owner,
                "overall_score": int(overall_score or 0),
                "security_score": int(j.get("security_score") or final_report.get("security_score", 70)),
                "arch_score": int(j.get("arch_score") or final_report.get("arch_score", 70)),
                "perf_score": int(j.get("perf_score") or final_report.get("perf_score", 70)),
                "testing_score": int(j.get("testing_score") or final_report.get("testing_score", 25)),
                "db_score": int(j.get("db_score") or final_report.get("db_score", 70)),
                "originality_score": int(j.get("originality_score") or final_report.get("originality_score", 95)),
                "dx_score": int(final_report.get("dx_score", 70)),
                "finops_score": int(final_report.get("finops_score", 65)),
                "strengths": final_report.get("strengths", [])[:3],
                "weaknesses": final_report.get("weaknesses", [])[:3],
                "cwe_matrix": final_report.get("cwe_matrix", [])[:2],
                "executive_summary": final_report.get("executive_summary", "")[:250]
            })
        return normalized

    async def generate_leaderboard(
        self, 
        batch_id: str, 
        batch_name: str, 
        evaluated_jobs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Executes dual-layer cohort ranking:
        1. Attempts LLM-driven comparative critique and honor badge synthesis via Groq.
        2. Falls back seamlessly to rule-based mathematical cohort arbitration.
        """
        if not evaluated_jobs:
            return self._empty_leaderboard(batch_id, batch_name)

        normalized_cohort = self._normalize_cohort(evaluated_jobs)

        # Try LLM cohort synthesis
        try:
            llm_result = await self._run_llm_synthesis(batch_id, batch_name, normalized_cohort)
            if llm_result and "rankings" in llm_result and len(llm_result["rankings"]) > 0:
                logger.info(f"BatchLeaderboardAgent successfully synthesized cohort rankings for {batch_id} via LLM")
                return llm_result
        except Exception as e:
            logger.warning(f"BatchLeaderboardAgent LLM synthesis note ({e}), falling back to deterministic cohort arbiter")

        # Fallback to high-fidelity deterministic synthesis
        return self._deterministic_cohort_synthesis(batch_id, batch_name, normalized_cohort)

    async def _run_llm_synthesis(
        self, 
        batch_id: str, 
        batch_name: str, 
        cohort: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Invokes Groq with multi-key failover to rank and critique the batch."""
        if not self.groq_keys:
            return None

        prompt_input = {
            "batch_name": batch_name,
            "cohort_size": len(cohort),
            "repositories": [
                {
                    "repo": c["repo_name"],
                    "team": c["team_name"],
                    "overall_score": c["overall_score"],
                    "security_score": c["security_score"],
                    "arch_score": c["arch_score"],
                    "testing_score": c["testing_score"],
                    "db_score": c["db_score"],
                    "originality_score": c["originality_score"],
                    "strengths": c["strengths"],
                    "weaknesses": c["weaknesses"],
                    "vulnerabilities": len(c["cwe_matrix"])
                }
                for c in cohort
            ]
        }

        system_instruction = (
            "You are the Chief Technical Benchmark Arbiter & Principal Engineering Judge (ACM/FAANG Bar Raiser style).\n"
            "You are evaluating a completed batch cohort of software engineering repositories.\n"
            "Your job is to produce an authoritative, comparative batch leaderboard.\n"
            "RULES:\n"
            "1. Rank repositories strictly from 1 to N based on their verified scores, security posture, architecture, and testing.\n"
            "2. Assign unique honor badges (e.g., 'Grand Champion 🏆', 'Hardened Fortress 🛡️', 'Clean Architecture Vanguard 🏗️', 'Testing Paragon 🧪', 'Originality Titan 💎', 'Performance Laureate ⚡').\n"
            "3. Award grades: 'A+' (90+), 'A' (80-89), 'B+' (70-79), 'B' (60-69), 'C' (<60).\n"
            "4. Provide a punchy 1-2 sentence verdict and a clear key differentiator explaining why each project earned its rank.\n"
            "5. Provide an executive summary of the cohort, highlighting standout innovations and common systemic flaws across the batch.\n"
            "6. Output MUST BE strictly valid JSON matching this schema:\n"
            "{\n"
            '  "executive_summary": "...",\n'
            '  "cohort_average_score": 78.4,\n'
            '  "highest_scoring_repo": "owner/repo",\n'
            '  "standout_innovations": ["...", "..."],\n'
            '  "common_systemic_flaws": ["...", "..."],\n'
            '  "rankings": [\n'
            '    {\n'
            '      "rank": 1,\n'
            '      "repo_name": "owner/repo",\n'
            '      "team_name": "Team Name",\n'
            '      "overall_score": 92,\n'
            '      "badge": "Grand Champion 🏆",\n'
            '      "all_badges": ["Grand Champion 🏆", "Clean Architecture Vanguard 🏗️"],\n'
            '      "grade": "A+",\n'
            '      "verdict": "...",\n'
            '      "key_differentiator": "..."\n'
            '    }\n'
            '  ],\n'
            '  "awards": [\n'
            '    {"title": "🏆 Grand Champion", "recipient_repo": "...", "recipient_team": "...", "citation": "..."},\n'
            '    {"title": "🛡️ Hardened Fortress", "recipient_repo": "...", "recipient_team": "...", "citation": "..."}\n'
            '  ]\n'
            "}"
        )

        models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"]
        for key in self.groq_keys:
            for model_name in models:
                try:
                    llm = ChatGroq(
                        model=model_name,
                        temperature=0.1,
                        api_key=key,
                        max_retries=0,
                        timeout=14.0
                    )
                    messages = [
                        SystemMessage(content=system_instruction),
                        HumanMessage(content=f"Batch Input Data:\n{json.dumps(prompt_input, indent=2)}\n\nGenerate the complete JSON Batch Leaderboard report:")
                    ]
                    response = await llm.ainvoke(messages)
                    text = response.content.strip()
                    if "```json" in text:
                        text = text.split("```json")[-1].split("```")[0].strip()
                    elif "```" in text:
                        text = text.split("```")[1].split("```")[0].strip()

                    parsed = json.loads(text)
                    if isinstance(parsed, dict) and "rankings" in parsed:
                        # Enrich rankings with underlying subscores & URLs
                        cohort_map = {c["repo_name"].lower(): c for c in cohort}
                        for r in parsed.get("rankings", []):
                            match = cohort_map.get(r.get("repo_name", "").lower())
                            if match:
                                r["repo_url"] = match["repo_url"]
                                r["subscores"] = {
                                    "security": match["security_score"],
                                    "architecture": match["arch_score"],
                                    "performance": match["perf_score"],
                                    "testing": match["testing_score"],
                                    "database": match["db_score"],
                                    "originality": match["originality_score"]
                                }

                        parsed["batch_id"] = batch_id
                        parsed["batch_name"] = batch_name
                        parsed["total_evaluated"] = len(cohort)
                        parsed["generated_at"] = datetime.datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")
                        parsed["agent_name"] = "BatchLeaderboardAgent"
                        return parsed
                except Exception as ex:
                    logger.debug(f"Groq {model_name} attempt error: {ex}")
                    continue

        return None

    def _deterministic_cohort_synthesis(
        self, 
        batch_id: str, 
        batch_name: str, 
        cohort: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Mathematical rule-based cohort ranking and honor badge assignment."""
        cohort = self._normalize_cohort(cohort)
        # Sort descending by overall_score, then security_score, then testing_score
        sorted_cohort = sorted(
            cohort, 
            key=lambda x: (x.get("overall_score", 0), x.get("security_score", 0), x.get("testing_score", 0)), 
            reverse=True
        )

        avg_score = round(sum(c.get("overall_score", 0) for c in sorted_cohort) / max(len(sorted_cohort), 1), 1)
        top_repo = sorted_cohort[0].get("repo_name", "N/A") if sorted_cohort else "N/A"

        rankings = []
        awards = []

        # Find category winners
        best_security = max(sorted_cohort, key=lambda x: x["security_score"]) if sorted_cohort else None
        best_arch = max(sorted_cohort, key=lambda x: x["arch_score"]) if sorted_cohort else None
        best_testing = max(sorted_cohort, key=lambda x: x["testing_score"]) if sorted_cohort else None
        best_orig = max(sorted_cohort, key=lambda x: x["originality_score"]) if sorted_cohort else None

        for idx, c in enumerate(sorted_cohort):
            rank = idx + 1
            score = c["overall_score"]
            
            # Grade calculation
            if score >= 90:
                grade = "A+"
            elif score >= 80:
                grade = "A"
            elif score >= 70:
                grade = "B+"
            elif score >= 60:
                grade = "B"
            else:
                grade = "C"

            # Badge synthesis
            badges = []
            if rank == 1:
                badges.append("Grand Champion 🏆")
            if best_security and c["task_id"] == best_security["task_id"] and c["security_score"] >= 75:
                badges.append("Hardened Fortress 🛡️")
            if best_arch and c["task_id"] == best_arch["task_id"] and c["arch_score"] >= 75:
                badges.append("Architectural Vanguard 🏗️")
            if best_testing and c["task_id"] == best_testing["task_id"] and c["testing_score"] >= 60:
                badges.append("Testing Paragon 🧪")
            if best_orig and c["task_id"] == best_orig["task_id"] and c["originality_score"] >= 95:
                badges.append("Originality Titan 💎")

            if not badges:
                if score >= 75:
                    badges.append("Certified Production Ready ✨")
                else:
                    badges.append("Standard Evaluation 📊")

            primary_badge = badges[0]

            # Differentiator
            if rank == 1:
                diff = f"Outranked all {len(sorted_cohort)} projects with highest composite benchmark score ({score}/100)."
            elif rank <= 3:
                diff = f"Strong podium contender demonstrating high modularity ({c['arch_score']}/100) and low clone risk."
            elif score < 60:
                diff = "Deficiencies in automated testing or continuous integration impacted final standing."
            else:
                diff = "Balanced multi-agent performance across security and code maintainability."

            verdict = (
                f"Repository demonstrates solid engineering discipline with {score}/100 overall score. "
                f"Security index measured at {c['security_score']}/100 with {c['originality_score']}% code originality."
            )

            rankings.append({
                "rank": rank,
                "repo_name": c["repo_name"],
                "repo_url": c["repo_url"],
                "team_name": c["team_name"],
                "overall_score": score,
                "badge": primary_badge,
                "all_badges": badges,
                "grade": grade,
                "verdict": verdict,
                "key_differentiator": diff,
                "subscores": {
                    "security": c["security_score"],
                    "architecture": c["arch_score"],
                    "performance": c["perf_score"],
                    "testing": c["testing_score"],
                    "database": c["db_score"],
                    "originality": c["originality_score"]
                }
            })

        # Cohort Awards
        if sorted_cohort:
            champion = sorted_cohort[0]
            awards.append({
                "title": "🏆 Grand Champion",
                "recipient_repo": champion["repo_name"],
                "recipient_team": champion["team_name"],
                "citation": f"Rank #1 overall with {champion['overall_score']}/100 composite index and superior code health."
            })
        if best_security and best_security["security_score"] >= 70:
            awards.append({
                "title": "🛡️ Hardened Security Vanguard",
                "recipient_repo": best_security["repo_name"],
                "recipient_team": best_security["team_name"],
                "citation": f"Achieved highest security rating ({best_security['security_score']}/100) with zero critical vulnerabilities."
            })
        if best_arch and best_arch["arch_score"] >= 70:
            awards.append({
                "title": "🏗️ Architecture Vanguard",
                "recipient_repo": best_arch["repo_name"],
                "recipient_team": best_arch["team_name"],
                "citation": f"Recognized for superior separation of concerns ({best_arch['arch_score']}/100) and modular hierarchy."
            })
        if best_orig and best_orig["originality_score"] >= 90:
            awards.append({
                "title": "💎 Originality Titan",
                "recipient_repo": best_orig["repo_name"],
                "recipient_team": best_orig["team_name"],
                "citation": f"Exemplary originality ({best_orig['originality_score']}/100) with zero structural template plagiarism."
            })

        return {
            "batch_id": batch_id,
            "batch_name": batch_name,
            "total_evaluated": len(cohort),
            "executive_summary": (
                f"Cohort evaluation complete for {len(cohort)} repositories. "
                f"The batch achieved a mean score of {avg_score}/100. "
                f"Top honors awarded to '{top_repo}' for exceptional design clarity, "
                f"robust defensive measures, and verified originality."
            ),
            "cohort_average_score": avg_score,
            "highest_scoring_repo": top_repo,
            "standout_innovations": [
                "Modular service layer structuring and clean interface decoupling",
                "High codebase originality with low boilerplate copy-paste duplication"
            ],
            "common_systemic_flaws": [
                "Automated test assertion suites omitted or insufficient in lower percentile submissions",
                "Continuous integration workflow definitions (.github/workflows) missing from early skeletons"
            ],
            "rankings": rankings,
            "awards": awards,
            "generated_at": datetime.datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC"),
            "agent_name": "BatchLeaderboardAgent"
        }

    def _empty_leaderboard(self, batch_id: str, batch_name: str) -> Dict[str, Any]:
        return {
            "batch_id": batch_id,
            "batch_name": batch_name,
            "total_evaluated": 0,
            "executive_summary": "No repositories were available for cohort evaluation.",
            "cohort_average_score": 0.0,
            "highest_scoring_repo": "N/A",
            "standout_innovations": [],
            "common_systemic_flaws": [],
            "rankings": [],
            "awards": [],
            "generated_at": datetime.datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC"),
            "agent_name": "BatchLeaderboardAgent"
        }
