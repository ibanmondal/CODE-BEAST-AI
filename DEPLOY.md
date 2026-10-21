# 🦁 CodeBeast AI — System Architecture & Production Deployment Specification

> **Document Type:** Production Architecture, Dependency Audit & Full Deployment Guide  
> **Repository:** [https://github.com/ibanmondal/CODE-BEAST-AI](https://github.com/ibanmondal/CODE-BEAST-AI)  
> **Status:** Production-Ready (Verified CI/CD, Next.js 16 Production Build Passed, Celery Worker Package Verified)  
> **Target Audience:** Engineering Evaluators, DevOps Reviewers, System Architects, Deployment Engineers

---

## 1. Project Overview & What Is in This System

**CodeBeast AI** is an enterprise-grade, autonomous multi-agent repository evaluation, code quality audit, and plagiarism detection platform. It performs deep static analysis, Abstract Syntax Tree (AST) grammar parsing, and LLM-driven consensus evaluations on open-source and private repositories without executing untrusted arbitrary code.

### 🌟 Key Functional Capabilities
1. **Zero-Sandbox Static Inspection:** Clones repositories in shallow, isolated transient workspaces, extracts Tree-Sitter AST syntax trees, inspects file trees, and purges code immediately after inspection.
2. **8 Specialized Evaluation Agents:**
   - 🛡️ **Security & CWE Agent:** Evaluates code against Common Weakness Enumeration (CWE) top 25 standards, hardcoded secrets, injection vectors, and privilege leaks (based on ACM FSE '25 research).
   - 🏗️ **Architecture & Modularity Agent:** Audits SOLID principles, separation of concerns, coupling metrics, and structural cohesion.
   - ⚡ **Performance & Hot Paths Agent:** Detects $O(n^2)$ bottlenecks, unindexed lookups, memory allocation leaks, and unoptimized I/O.
   - 🧪 **Testing & CI Hygiene Agent:** Analyzes unit test assertion density, mocking discipline, boundary conditions, and test flakiness risk.
   - 🗄️ **Database & Schema Agent:** Evaluates migration versioning, SQL injection exposure, connection pooling hygiene, and ORM query efficiency.
   - 🔍 **Originality & Plagiarism Agent:** Uses CodeBERT dense embeddings and local FAISS vector indexing to detect verbatim clones, renamed token duplication, and structural plagiarism.
   - 🛠️ **Developer Experience (DX) Agent:** Analyzes build scripts, linter configurations, documentation clarity, and setup ergonomics.
   - ☁️ **FinOps & Cloud Sizing Agent:** Audits cloud infra waste, container bloat, uncompressed assets, and serverless timeout risks.
3. **ConsJudge Dual-Pass Consensus Engine:** Multi-agent voting system with variance checks and tie-breaker synthesis to prevent LLM hallucinations.
4. **Autonomous AI Batch Cohort Leaderboard:** Evaluates student/team repository cohorts in chunks of 5 with autonomous batch summarization and podium badges (🥇 Gold, 🥈 Silver, 🥉 Bronze).
5. **Head-to-Head Repository Duel:** Interactive radar comparison comparing two repositories across 8 capability vectors with judge verdicts.
6. **Real-time Live Telemetry:** Redis Pub/Sub and WebSocket streaming broadcasting agent steps to client browsers in under 50ms.
7. **Interactive Judge Copilot:** In-dashboard streaming AI assistant answering questions about vulnerability findings with citation context.

---

## 2. Technical Stack Breakdown

| Layer | Technologies Used | Key Packages & Libraries |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** | `tailwindcss` v4, `three` / `@react-three/fiber` (3D shaders), `recharts`, `lucide-react`, `clsx`, `tailwind-merge` |
| **Backend API** | **FastAPI**, **Uvicorn**, **Python 3.11** | `fastapi`, `uvicorn[standard]`, `pydantic` v2, `sqlalchemy` v2, `httpx`, `asyncpg`, `psycopg2-binary` |
| **Distributed Task Queue** | **Celery 5.4**, **Redis 7** | `celery`, `redis`, ThreadPoolExecutor worker concurrency |
| **AI / Multi-Agent Engine** | **LangGraph**, **LangChain**, **Groq Cloud / NaraRouter** | `langgraph`, `langchain-groq`, `langchain`, `tree-sitter`, `sentence-transformers`, `faiss-cpu`, `torch` |
| **Database** | **PostgreSQL 15+** (with automatic SQLite fallback) | SQLAlchemy ORM, automatic schema migration for batch evaluations |
| **Reverse Proxy & Edge** | **Nginx**, **Let's Encrypt (Certbot)** | HTTP/2, WebSocket Upgrade Proxying (`/api/v1/ws/`), Gzip compression |

---

## 3. What Is Needed for Deployment (Prerequisites & Requirements)

### 3.1 Hardware & Compute Requirements

| Component | Minimum (Free Tier / Small Scale) | Recommended Production |
| :--- | :--- | :--- |
| **CPU** | 1–2 vCPUs | 2–4 vCPUs |
| **RAM** | **1 GB** (Requires 4 GB Swap enabled) or **2 GB** | **4 GB to 8 GB** (e.g. AWS `t3.medium` / `t3.large`, Lightsail $20/mo) |
| **Disk Space** | 20 GB SSD (gp3) | 30–50 GB NVMe SSD |
| **Network** | Outbound access to GitHub API & Groq API | Static Public IP with Ports `80` (HTTP), `443` (HTTPS), `22` (SSH) open |

### 3.2 External API Keys & Credentials
Before launching, you must obtain:
1. **`GROQ_API_KEY` (Required):** High-speed LLM inference provider (500+ tokens/sec).
   - Sign up and obtain a free API key at [console.groq.com/keys](https://console.groq.com/keys).
2. **`GITHUB_TOKEN` (Required):** GitHub Personal Access Token to prevent API rate limits (60 req/hr $\rightarrow$ 5,000 req/hr).
   - Generate at [github.com/settings/tokens](https://github.com/settings/tokens) with public repo read permissions.
3. **`DATABASE_URL` (Required for Postgres, optional if using SQLite):**
   - Format: `postgresql://username:password@host:5432/database_name`
   - Automatically supports Supabase, Neon, AWS RDS, Render, and Railway.
4. **`REDIS_URL` (Required):**
   - Format: `redis://host:6379/0` (or `rediss://...` for SSL-secured Redis like Upstash).

### 3.3 Network Ports to Open in Firewall / Security Groups

| Port | Protocol | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **80** | TCP (HTTP) | `0.0.0.0/0` (Anywhere) | Web dashboard and public API redirect |
| **443** | TCP (HTTPS) | `0.0.0.0/0` (Anywhere) | SSL/TLS secure traffic & WebSocket connections |
| **22** | TCP (SSH) | Your IP / `0.0.0.0/0` | Server terminal management (EC2 / VPS) |
| *8000* | TCP (HTTP) | *Internal / Docker Only* | FastAPI backend (exposed only if reverse proxy is bypassed) |
| *3000* | TCP (HTTP) | *Internal / Docker Only* | Next.js frontend (exposed only if reverse proxy is bypassed) |
| *6379* | TCP | *Internal / Docker Only* | Redis message broker |
| *5432* | TCP | *Internal / Docker Only* | PostgreSQL database |

---

## 4. Complete Deployment Options & Walkthroughs

### 🎯 Option A: AWS EC2 / Lightsail (Using Your AWS Balance / Free Tier)

Deploying on AWS utilizes your AWS credits. A `t3.medium` or Lightsail instance provides dedicated resources for all services.

#### Step 1: Launch an Ubuntu Server on AWS
1. Open the [AWS Management Console](https://console.aws.amazon.com).
2. Navigate to **EC2** (or **Amazon Lightsail**).
3. Click **Launch Instance**:
   - **OS:** Ubuntu Server 24.04 LTS (64-bit x86).
   - **Instance Type:**
     - **Free-Tier 12-Month Plan:** `t2.micro` or `t3.micro` (Free eligible).
     - **Best Performance ($20–$30/mo):** `t3.medium` (2 vCPUs, 4 GB RAM) or Lightsail 4 GB Plan.
   - **Storage:** 30 GiB gp3 (Free tier eligible).
   - **Key Pair:** Create/select your key pair (e.g. `codebeast-key.pem`).
   - **Firewall (Security Group):** Check **Allow SSH**, **Allow HTTP (80)**, and **Allow HTTPS (443)**.
4. Click **Launch Instance**.

#### Step 2: Connect & Run 1-Click AWS Deployment Script
Connect to your instance via SSH or AWS **EC2 Instance Connect** in your browser, then run:

```bash
# If running on a 1 GB RAM instance (t2.micro / t3.micro), create 4 GB swap first:
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

# Run the 1-click automated setup script:
curl -fsSL https://raw.githubusercontent.com/ibanmondal/CODE-BEAST-AI/main/deploy_aws.sh | bash
```

#### Step 3: Populate API Keys
```bash
cd ~/CODE-BEAST-AI
nano .env
```
Set your actual keys:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GITHUB_TOKEN=ghp_your_github_token_here
```
Save (`Ctrl + O`, `Enter`) and exit (`Ctrl + X`).

#### Step 4: Restart Containers
```bash
sudo docker compose -f docker-compose.prod.yml up -d --build
```
Your platform is immediately available at `http://YOUR_AWS_PUBLIC_IP`.

---

### 🌐 Option B: 100% Free-Tier Cloud Deployment (Vercel + Render + Supabase)

Zero Linux server management. Decouples the frontend to Vercel's global CDN while running backend workers on Render.

#### 1. Database & Cache (Free):
- **Database:** Create a free PostgreSQL instance on [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech). Copy the `postgresql://...` connection string.
- **Redis Queue:** Create a free Redis instance on [Upstash](https://upstash.com) (10,000 commands/day free). Copy the `redis://...` URL.

#### 2. Backend & Celery Worker on Render.com:
1. Log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository `ibanmondal/CODE-BEAST-AI`.
4. Render automatically reads [`render.yaml`](./render.yaml).
5. Input your `GROQ_API_KEY` and `GITHUB_TOKEN`.
6. Click **Apply**. Render will deploy:
   - `codebeast-api`: `https://codebeast-api.onrender.com`
   - `codebeast-worker`: Celery Background Worker
7. Copy your assigned API URL (`https://codebeast-api.onrender.com`).

#### 3. Frontend on Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**, select `ibanmondal/CODE-BEAST-AI`.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL = https://codebeast-api.onrender.com
   NEXT_PUBLIC_WS_URL  = wss://codebeast-api.onrender.com
   ```
5. Click **Deploy**. Vercel will complete the build and assign your domain (`https://codebeast.vercel.app`).

---

### 🐳 Option C: Self-Hosted Docker Compose on Any VPS / Bare-Metal

On any server (DigitalOcean, Linode, Hetzner, GCP Compute Engine, On-Premise Linux):

```bash
# 1. Clone the repository
git clone https://github.com/ibanmondal/CODE-BEAST-AI.git
cd CODE-BEAST-AI

# 2. Configure environment
cp .env.example .env
nano .env

# 3. Launch with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build

# 4. Verify running services
docker compose -f docker-compose.prod.yml ps
```

---

## 5. Directory Structure & Deployment Manifest Reference

```text
MAJORPROJECT_EVALUATOR/
├── .env.example                # Canonical production environment documentation
├── DEPLOY.md                   # This comprehensive architecture & deployment specification
├── DEPLOYMENT_GUIDE.md         # Step-by-step deployment playbook
├── deploy_aws.sh               # 1-click automated AWS EC2/Lightsail bootstrap script
├── docker-compose.prod.yml     # Hardened multi-container production stack (API, Worker, Redis, DB, UI)
├── docker-compose.yml          # Local developer container stack
├── render.yaml                 # 1-click cloud blueprint for Render.com
│
├── backend/
│   ├── Dockerfile              # Multi-stage Python 3.11 Debian container with Git & Libpq
│   ├── requirements.txt        # Production Python dependencies (FastAPI, Celery, LangGraph)
│   ├── main.py                 # FastAPI application root, CORS configuration, healthcheck routes
│   └── app/
│       ├── database.py         # SQLAlchemy engine with postgres:// fallback and connection pooling
│       ├── worker/             # Celery distributed task package
│       │   ├── __init__.py     # Core asynchronous evaluation task definitions
│       │   └── celery_app.py   # Celery application instance export
│       ├── api/endpoints/      # REST & WebSocket routers (evaluate, stats, chat, duel, matrix, ws)
│       ├── agents/             # LangGraph state machine & multi-agent nodes
│       └── services/           # GitHub collector, repo cloner, TreeSitter AST builder, FAISS engine
│
└── frontend/
    ├── Dockerfile              # Production multi-stage Node 20 Next.js container
    ├── vercel.json             # Vercel edge deployment manifest
    ├── next.config.ts          # Turbopack config with automated /api/v1/ backend proxy rewrites
    ├── package.json            # Next.js 16, React 19, Tailwind v4
    └── src/
        ├── lib/api.ts          # Centralized dynamic API & WebSocket resolution helper
        ├── app/                # Next.js App Router (17 verified static & dynamic routes)
        └── components/         # 3D shaders, radar charts, plagiarism matrix, podium badges
```

---

## 6. Post-Deployment Verification & Testing Checklist

After completing deployment, perform these verification tests:

| Check | Command / Action | Expected Result |
| :--- | :--- | :--- |
| **API Health** | `curl -f http://YOUR_DOMAIN/health` | `{"status":"ok","service":"CodeBeast Backend API","port":8000}` |
| **OpenAPI Docs** | Open browser to `http://YOUR_DOMAIN/docs` | Interactive Swagger UI listing all endpoints |
| **WebSocket Connection** | Open browser to `http://YOUR_DOMAIN/live` | Status badge displays: `Connected (Live Stream)` |
| **Single Evaluation Test** | Submit `https://github.com/pallets/flask` on `/analysis` | Full 8-agent evaluation completes in under 30s |
| **Batch Evaluation Test** | Upload CSV with 3 repositories on `/upload` | Cohort batch evaluation synthesizes AI leaderboard |
| **Duel Comparison** | Select 2 repositories on `/duel` | Radar chart renders comparison metrics with verdict |
| **Database Persistence** | Refresh `/leaderboard` and `/rankings` | Completed evaluation scores persist across reloads |

---

## 7. Troubleshooting & FAQ for Code Reviewers

#### Q: How does the backend prevent "Event loop is closed" errors during repeated Celery tasks?
**A:** In [`backend/app/worker/__init__.py`](file:///c:/Users/legit/OneDrive/Desktop/PROJECTS_FINAL_RESUME/MAJORPROJECT_EVALUATOR/backend/app/worker/__init__.py), synchronous Celery worker threads execute the async LangGraph workflow inside dedicated, isolated event loops using `asyncio.new_event_loop()` running within a dedicated daemon thread. This prevents HTTPX/AnyIO client connection caching from colliding across sequential evaluations.

#### Q: How does the system handle different database connection string protocols?
**A:** SQLAlchemy 2.0 strictly requires `postgresql://`, whereas cloud providers (Render, Supabase, Railway) frequently export `postgres://`. In [`backend/app/database.py`](file:///c:/Users/legit/OneDrive/Desktop/PROJECTS_FINAL_RESUME/MAJORPROJECT_EVALUATOR/backend/app/database.py), connection strings are dynamically normalized, and if PostgreSQL is temporarily unreachable, the system automatically falls back to local SQLite (`codebeast.db`) without crashing.

#### Q: Why are hardcoded ports avoided on the frontend?
**A:** [`frontend/src/lib/api.ts`](file:///c:/Users/legit/OneDrive/Desktop/PROJECTS_FINAL_RESUME/MAJORPROJECT_EVALUATOR/frontend/src/lib/api.ts) detects the running environment:
1. In cloud deployments (Vercel/Render), it reads `NEXT_PUBLIC_API_URL` or routes through Next.js rewrites.
2. In local network/LAN testing, it adapts to the client host.
3. In production, WebSocket connections automatically upgrade to `wss://` when served over HTTPS.
