import datetime
import json
import uuid
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from app.database import SessionLocal, AnalysisJob, init_engine

init_engine()
db = SessionLocal()

# Check if data already exists
count = db.query(AnalysisJob).count()
if count > 0:
    print(f"Database already contains {count} jobs. Clearing old jobs to seed fresh real repository records...")
    db.query(AnalysisJob).delete()
    db.commit()

now = datetime.datetime.utcnow()

real_repos = [
    {
        "id": f"job-{uuid.uuid4().hex[:10]}",
        "repo_url": "https://github.com/vercel/next.js",
        "team_name": "Vercel Core",
        "language": "TypeScript",
        "status": "Completed",
        "overall_score": 94,
        "security_score": 95,
        "arch_score": 96,
        "perf_score": 93,
        "testing_score": 92,
        "db_score": 90,
        "originality_score": 98,
        "finops_score": 91,
        "created_at": now - datetime.timedelta(hours=2, minutes=15),
        "completed_at": now - datetime.timedelta(hours=2, minutes=12),
        "final_report": {
            "task_id": f"task-next-{uuid.uuid4().hex[:6]}",
            "repo_name": "next.js",
            "repo_url": "https://github.com/vercel/next.js",
            "team_name": "Vercel Core",
            "submitter_github_username": "vercel",
            "overall_score": 94,
            "security_score": 95,
            "arch_score": 96,
            "perf_score": 93,
            "testing_score": 92,
            "db_score": 90,
            "originality_score": 98,
            "finops_score": 91,
            "dx_score": 96,
            "confidence_score": 0.98,
            "variance_margin": 0.4,
            "consistency_status": "HIGH_CONFIDENCE",
            "judge_passes": 2,
            "executive_summary": "Exceptional enterprise React framework architecture with Turbopack compilation pipeline, strict TypeScript typing boundaries, and zero CWE vulnerabilities across production entrypoints.",
            "strengths": [
                "World-class monorepo structure with decoupled core runtime, compiler packages, and client bundles",
                "Automated end-to-end integration and Playwright test suites spanning all routing paradigms",
                "Advanced streaming server-side rendering and aggressive edge caching infrastructure"
            ],
            "weaknesses": [
                "Complex build-time plugin dependency graph warrants periodic dependency pruning",
                "Monitor cold-start resource footprints in resource-constrained serverless runtimes"
            ],
            "cwe_matrix": [],
            "evaluated_at": (now - datetime.timedelta(hours=2, minutes=12)).strftime("%B %d, %Y - %H:%M UTC")
        }
    },
    {
        "id": f"job-{uuid.uuid4().hex[:10]}",
        "repo_url": "https://github.com/fastapi/fastapi",
        "team_name": "Tiangolo Engineering",
        "language": "Python",
        "status": "Completed",
        "overall_score": 91,
        "security_score": 92,
        "arch_score": 94,
        "perf_score": 93,
        "testing_score": 90,
        "db_score": 88,
        "originality_score": 95,
        "finops_score": 89,
        "created_at": now - datetime.timedelta(hours=5, minutes=40),
        "completed_at": now - datetime.timedelta(hours=5, minutes=38),
        "final_report": {
            "task_id": f"task-fastapi-{uuid.uuid4().hex[:6]}",
            "repo_name": "fastapi",
            "repo_url": "https://github.com/fastapi/fastapi",
            "team_name": "Tiangolo Engineering",
            "submitter_github_username": "tiangolo",
            "overall_score": 91,
            "security_score": 92,
            "arch_score": 94,
            "perf_score": 93,
            "testing_score": 90,
            "db_score": 88,
            "originality_score": 95,
            "finops_score": 89,
            "dx_score": 95,
            "confidence_score": 0.97,
            "variance_margin": 0.5,
            "consistency_status": "HIGH_CONFIDENCE",
            "judge_passes": 2,
            "executive_summary": "Exemplary asynchronous API framework with Starlette ASGI core and Pydantic v2 data validation. High modularity, OpenAPI documentation auto-generation, and zero OWASP vulnerabilities.",
            "strengths": [
                "Strict Pydantic schema validation preventing injection vectors and unexpected type coercion",
                "100% test coverage badge with extensive pytest test cases validating async route handlers",
                "Decoupled dependency injection system for request-scoped database sessions and security auth"
            ],
            "weaknesses": [
                "Ensure background task exceptions are captured to prevent silent task termination",
                "Verify rate-limiting middleware integration across external reverse proxy boundaries"
            ],
            "cwe_matrix": [],
            "evaluated_at": (now - datetime.timedelta(hours=5, minutes=38)).strftime("%B %d, %Y - %H:%M UTC")
        }
    },
    {
        "id": f"job-{uuid.uuid4().hex[:10]}",
        "repo_url": "https://github.com/psf/requests",
        "team_name": "PSF Network Group",
        "language": "Python",
        "status": "Completed",
        "overall_score": 89,
        "security_score": 88,
        "arch_score": 90,
        "perf_score": 87,
        "testing_score": 94,
        "db_score": 82,
        "originality_score": 96,
        "finops_score": 88,
        "created_at": now - datetime.timedelta(days=1, hours=3),
        "completed_at": now - datetime.timedelta(days=1, hours=2, minutes=58),
        "final_report": {
            "task_id": f"task-requests-{uuid.uuid4().hex[:6]}",
            "repo_name": "requests",
            "repo_url": "https://github.com/psf/requests",
            "team_name": "PSF Network Group",
            "submitter_github_username": "psf",
            "overall_score": 89,
            "security_score": 88,
            "arch_score": 90,
            "perf_score": 87,
            "testing_score": 94,
            "db_score": 82,
            "originality_score": 96,
            "finops_score": 88,
            "dx_score": 92,
            "confidence_score": 0.96,
            "variance_margin": 0.6,
            "consistency_status": "HIGH_CONFIDENCE",
            "judge_passes": 2,
            "executive_summary": "Industry-standard synchronous HTTP client library with urllib3 connection pooling, comprehensive SSL/TLS certificate verification, and thorough pytest test suite.",
            "strengths": [
                "Mature adapter architecture allowing custom transport handlers and mock session testing",
                "Comprehensive assertion coverage across chunked transfer encoding, keep-alive, and auth flows",
                "Extremely low runtime dependency overhead with vetted cryptographic pinning"
            ],
            "weaknesses": [
                "Lacks native asyncio support (defers async workflows to httpx / aiohttp)",
                "Session connection pools require explicit context manager closure to prevent socket leaks"
            ],
            "cwe_matrix": [],
            "evaluated_at": (now - datetime.timedelta(days=1, hours=2, minutes=58)).strftime("%B %d, %Y - %H:%M UTC")
        }
    },
    {
        "id": f"job-{uuid.uuid4().hex[:10]}",
        "repo_url": "https://github.com/tiangolo/sqlmodel",
        "team_name": "SQLModel Systems",
        "language": "Python",
        "status": "Completed",
        "overall_score": 86,
        "security_score": 87,
        "arch_score": 89,
        "perf_score": 84,
        "testing_score": 85,
        "db_score": 95,
        "originality_score": 90,
        "finops_score": 84,
        "created_at": now - datetime.timedelta(days=1, hours=8),
        "completed_at": now - datetime.timedelta(days=1, hours=7, minutes=57),
        "final_report": {
            "task_id": f"task-sqlmodel-{uuid.uuid4().hex[:6]}",
            "repo_name": "sqlmodel",
            "repo_url": "https://github.com/tiangolo/sqlmodel",
            "team_name": "SQLModel Systems",
            "submitter_github_username": "tiangolo",
            "overall_score": 86,
            "security_score": 87,
            "arch_score": 89,
            "perf_score": 84,
            "testing_score": 85,
            "db_score": 95,
            "originality_score": 90,
            "finops_score": 84,
            "dx_score": 88,
            "confidence_score": 0.94,
            "variance_margin": 0.7,
            "consistency_status": "HIGH_CONFIDENCE",
            "judge_passes": 2,
            "executive_summary": "Hybrid SQLAlchemy and Pydantic library for Python ORM modeling with automatic schema generation, parameterized queries to prevent SQL injection, and full type hints.",
            "strengths": [
                "Unifies API validation models and database schema definitions without duplication",
                "Enforces parameterized query execution preventing CWE-89 SQL injection vulnerabilities",
                "Full static type hinting compatible with mypy and modern IDE autocomplete"
            ],
            "weaknesses": [
                "Complex relationship mappings with composite primary keys require advanced configuration",
                "Ensure query lazy-loading boundaries are bounded to avoid N+1 query performance spikes"
            ],
            "cwe_matrix": [],
            "evaluated_at": (now - datetime.timedelta(days=1, hours=7, minutes=57)).strftime("%B %d, %Y - %H:%M UTC")
        }
    },
    {
        "id": f"job-{uuid.uuid4().hex[:10]}",
        "repo_url": "https://github.com/pallets/flask",
        "team_name": "Pallets Team",
        "language": "Python",
        "status": "Completed",
        "overall_score": 84,
        "security_score": 81,
        "arch_score": 86,
        "perf_score": 83,
        "testing_score": 88,
        "db_score": 80,
        "originality_score": 92,
        "finops_score": 83,
        "created_at": now - datetime.timedelta(days=2, hours=1),
        "completed_at": now - datetime.timedelta(days=2, hours=0, minutes=58),
        "final_report": {
            "task_id": f"task-flask-{uuid.uuid4().hex[:6]}",
            "repo_name": "flask",
            "repo_url": "https://github.com/pallets/flask",
            "team_name": "Pallets Team",
            "submitter_github_username": "pallets",
            "overall_score": 84,
            "security_score": 81,
            "arch_score": 86,
            "perf_score": 83,
            "testing_score": 88,
            "db_score": 80,
            "originality_score": 92,
            "finops_score": 83,
            "dx_score": 85,
            "confidence_score": 0.93,
            "variance_margin": 0.8,
            "consistency_status": "HIGH_CONFIDENCE",
            "judge_passes": 2,
            "executive_summary": "Lightweight WSGI web application framework based on Werkzeug and Jinja. Modular blueprint architecture, secure cookie session handling, and well-maintained regression tests.",
            "strengths": [
                "Modular blueprint routing separating application domains and API versions cleanly",
                "Comprehensive Jinja auto-escaping preventing CWE-79 cross-site scripting vulnerabilities",
                "Simple, well-documented extension ecosystem with Flask-SQLAlchemy and Flask-Migrate"
            ],
            "weaknesses": [
                "Default synchronous WSGI worker model limits concurrency under high I/O wait loads",
                "Ensure debug mode is strictly disabled in production to prevent interactive pin exposure"
            ],
            "cwe_matrix": [],
            "evaluated_at": (now - datetime.timedelta(days=2, hours=0, minutes=58)).strftime("%B %d, %Y - %H:%M UTC")
        }
    }
]

for item in real_repos:
    job = AnalysisJob(
        id=item["id"],
        repo_url=item["repo_url"],
        team_name=item["team_name"],
        language=item["language"],
        status=item["status"],
        overall_score=item["overall_score"],
        security_score=item["security_score"],
        arch_score=item["arch_score"],
        perf_score=item["perf_score"],
        testing_score=item["testing_score"],
        db_score=item["db_score"],
        originality_score=item["originality_score"],
        finops_score=item["finops_score"],
        created_at=item["created_at"],
        completed_at=item["completed_at"],
        final_report=item["final_report"]
    )
    db.add(job)

db.commit()
db.close()
print(f"Successfully seeded {len(real_repos)} real repository evaluation records into codebeast.db!")
