from typing import Dict, Any, List
import re

class ScoringEngine:
    """
    Rigorously and honestly calculates deterministic code quality scores.
    Evaluates test presence, architectural modularity, security posture,
    CI/CD DevOps automation, documentation, linter tooling, and code originality.
    Does NOT hand out inflated 100/100 scores.
    """
    
    def __init__(self):
        # A realistic passing baseline for standard functional code
        self.baseline_score = 74
        
    def calculate_score(self, metadata: Dict[str, Any], context: Dict[str, Any], similarity: Dict[str, Any]) -> Dict[str, Any]:
        print("Running Honest Deterministic Scoring Engine...")
        evidence: List[str] = []
        
        directory_tree = (context.get("directory_tree") or "").lower()
        readme_content = context.get("readme_content") or ""
        dependencies = context.get("dependencies") or []
        commits = metadata.get("commits_count", 0)
        sim_score = similarity.get("similarity_score", 0)
        
        # 1. TEST SUITE & VERIFICATION (Weight: 20%)
        # Check for test directories and test files
        test_indicators = ["test", "spec", "__test__", "tests/", "spec/", ".test.", ".spec.", "pytest", "jest", "unittest", "testing"]
        has_tests = any(ind in directory_tree for ind in test_indicators)
        test_file_count = len(re.findall(r'(?:test|spec)[\w\-]*\.(?:py|js|ts|tsx|jsx|go|rs|java)', directory_tree))
        
        testing_score = 25
        if not has_tests or test_file_count == 0:
            testing_score = 25
            evidence.append("[TESTING DEFICIENCY -18]: No automated test suites or assertion specs detected. Regression risk is critical.")
        elif test_file_count <= 2:
            testing_score = 55
            evidence.append("[TESTING WARNING -8]: Minimal test coverage detected (<= 2 test files). Edge cases and hot paths lack unit assertions.")
        elif test_file_count <= 6:
            testing_score = 75
            evidence.append("[TESTING ACCEPTABLE +3]: Moderate test suite detected with multiple assertion modules.")
        else:
            testing_score = 88
            evidence.append("[TESTING EXCELLENT +8]: Comprehensive test suite with dedicated spec hierarchy.")
            
        # 2. ARCHITECTURAL MODULARITY (Weight: 20%)
        modular_folders = ["src", "app", "lib", "components", "services", "controllers", "models", "routes", "utils", "core", "packages", "api", "internal"]
        detected_modules = [m for m in modular_folders if f"{m}/" in directory_tree or f" {m}\\" in directory_tree]
        
        arch_score = 70
        if len(detected_modules) == 0:
            arch_score = 52
            evidence.append("[ARCHITECTURE PENALTY -12]: Flat/monolithic structure without layered module boundaries.")
        elif len(detected_modules) <= 2:
            arch_score = 74
            evidence.append(f"[ARCHITECTURE MODERATE +2]: Standard layer separation detected ({', '.join(detected_modules)}).")
        else:
            arch_score = 85
            evidence.append(f"[ARCHITECTURE MODULAR +7]: High SOLID modularity across modules ({', '.join(detected_modules[:4])}).")
            
        # 3. SECURITY & SECRET HYGIENE (Weight: 20%)
        security_score = 76
        # Detect accidental secrets or dangerous files in git tree
        has_committed_env = ".env" in directory_tree and ".env.example" not in directory_tree
        has_keys = any(k in directory_tree for k in [".pem", "id_rsa", "credentials.json", "private.key"])
        has_security_md = "security.md" in directory_tree or ".snyk" in directory_tree
        
        if has_committed_env:
            security_score -= 20
            evidence.append("[SECURITY CRITICAL -20]: Plaintext .env file tracked in git tree. Potential secrets exposure.")
        if has_keys:
            security_score -= 25
            evidence.append("[SECURITY CRITICAL -25]: Cryptographic key or credential artifact tracked in repository.")
        if not has_security_md:
            security_score -= 4
            evidence.append("[SECURITY NOTICE -4]: No SECURITY.md disclosure policy or automated SAST config discovered.")
        else:
            security_score += 4
            evidence.append("[SECURITY HYGIENE +4]: Security policy disclosure configured.")
        security_score = max(20, min(95, security_score))

        # 4. DEVOPS & CI/CD AUTOMATION (FinOps / Reliability)
        has_ci = any(c in directory_tree for c in [".github/workflows", ".gitlab-ci", "jenkinsfile", ".circleci"])
        has_docker = any(d in directory_tree for d in ["dockerfile", "docker-compose", "compose.yaml", "containerfile"])
        
        finops_score = 70
        if not has_ci:
            finops_score -= 8
            evidence.append("[CI/CD DEFICIENCY -8]: No automated continuous integration pipelines (.github/workflows) discovered.")
        else:
            finops_score += 8
            evidence.append("[CI/CD AUTOMATION +8]: Automated continuous integration workflow active.")
            
        if not has_docker:
            finops_score -= 5
            evidence.append("[DEVOPS NOTICE -5]: No container specification (Dockerfile/Compose) for deterministic builds.")
        else:
            finops_score += 6
            evidence.append("[DEVOPS READY +6]: Containerized orchestration specification verified.")
        finops_score = max(30, min(92, finops_score))

        # 5. DOCUMENTATION & DEVELOPER EXPERIENCE (DX)
        dx_score = 72
        if "No README found" in readme_content or len(readme_content.strip()) < 80:
            dx_score = 35
            evidence.append("[DOCUMENTATION CRITICAL -15]: Missing or empty README. Project purpose and setup undocumented.")
        elif len(readme_content.strip()) < 300:
            dx_score = 60
            evidence.append("[DOCUMENTATION LIMITED -7]: Sparse README lacking deployment, configuration, or API reference.")
        else:
            dx_score = 82
            evidence.append("[DOCUMENTATION GOOD +5]: Structured README with setup instructions and architectural context.")
            
        # License check
        has_license = any(l in directory_tree for l in ["license", "licence", "copying"])
        if not has_license:
            dx_score -= 5
            evidence.append("[LEGAL NOTICE -5]: Missing open source LICENSE file. Intellectual property terms ambiguous.")
        else:
            dx_score += 3
            
        dx_score = max(25, min(95, dx_score))

        # 6. CODE QUALITY & LINTER TOOLING
        linter_files = ["eslint", "prettier", "tsconfig.json", "biome.json", "ruff.toml", "pyproject.toml", ".flake8", "cargo.toml"]
        has_linter = any(lf in directory_tree for lf in linter_files)
        perf_score = 78
        if not has_linter:
            perf_score -= 6
            evidence.append("[CODE QUALITY -6]: No static linting or formatting enforcement files detected.")
        else:
            perf_score += 4
            evidence.append("[CODE QUALITY +4]: Modern static analysis / type configuration detected.")
        perf_score = max(40, min(92, perf_score))

        # Database score
        db_indicators = ["prisma", "sqlalchemy", "typeorm", "drizzle", "mongoose", "migration", "schema.sql", "alembic", "database"]
        has_db = any(d in directory_tree for d in db_indicators)
        db_score = 80 if has_db else 72

        # 7. COMMIT VELOCITY & SIMILARITY PENALTIES
        if commits < 3:
            evidence.append("[GIT DEFICIENCY -15]: Less than 3 commits detected. Repository appears to be a flat template or single-push dump.")
        elif commits < 8:
            evidence.append("[GIT NOTICE -4]: Limited revision history (< 8 commits).")

        # Originality & Plagiarism Calculation
        if sim_score > 80:
            evidence.append(f"HARD CAP APPLIED: Similarity score is {sim_score}%. High plagiarism risk detected.")
            originality_score = 15
        elif sim_score > 50:
            penalty = 30
            evidence.append(f"Penalty: Similarity score is {sim_score}%. High template overlap.")
            originality_score = max(20, 100 - sim_score)
        else:
            originality_score = max(50, 100 - sim_score)

        # 8. WEIGHTED HONEST COMPOSITE CALCULATION
        # Standard software weights:
        # Architecture: 20%, Testing: 20%, Security: 20%, Performance: 15%, DX: 10%, Originality: 15%
        weighted_score = (
            (arch_score * 0.20) +
            (testing_score * 0.20) +
            (security_score * 0.20) +
            (perf_score * 0.15) +
            (dx_score * 0.10) +
            (originality_score * 0.15)
        )
        
        # Apply commit penalty if applicable
        if commits < 3:
            weighted_score = min(weighted_score, 52)
        elif commits < 8:
            weighted_score -= 4
            
        # Hard cap: if testing is < 30, overall score cannot exceed 72
        if testing_score < 30 and weighted_score > 72:
            weighted_score = 72
            evidence.append("[SCORE CAP]: Total score capped at 72 due to zero automated testing verification.")
            
        final_score = int(round(max(15, min(94, weighted_score))))
        
        return {
            "final_score": final_score,
            "subscores": {
                "security_score": security_score,
                "arch_score": arch_score,
                "perf_score": perf_score,
                "testing_score": testing_score,
                "db_score": db_score,
                "dx_score": dx_score,
                "finops_score": finops_score,
                "originality_score": originality_score
            },
            "evidence": evidence
        }

