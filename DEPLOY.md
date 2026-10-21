# 🚀 Code Beast AI — Production Deployment Guide

Code Beast AI consists of:
1. **Frontend**: Next.js 16 (Turbopack, Tailwind CSS, Lucide Icons, jsPDF & html2canvas)
2. **Backend**: FastAPI REST & WebSocket API (Python 3.11+, LangGraph, LibGit2, Pydantic)
3. **Multi-Agent Worker**: Celery Worker for parallel repository clones and deep AST analysis
4. **Broker & Cache**: Redis (Celery task queue & pub/sub)
5. **Database**: PostgreSQL (or SQLite for development)

---

## 🌟 Choose Your Deployment Architecture

| Platform | Best For | Setup Complexity | Cost Tier |
| :--- | :--- | :--- | :--- |
| **Option A: Render Blueprint (`render.yaml`)** | **Recommended**: 1-Click full-stack deployment (Next.js + FastAPI + Worker + Redis + Postgres) directly linked to your GitHub repo | ⭐ Low (5 minutes) | Free / Starter |
| **Option B: Vercel + Render/Railway** | Ultra-fast Global Edge CDN for Next.js frontend, paired with managed backend | ⭐ Low (5 minutes) | Free / Low |
| **Option C: AWS EC2 / Lightsail (`deploy_aws.sh`)** | Single virtual machine running full Docker Compose stack with Nginx reverse proxy | ⭐⭐ Medium (10 minutes) | ~$5 - $10/mo |
| **Option D: Google Cloud Run** | Scalable, serverless containerized deployment | ⭐⭐ Medium | Pay-per-use |

---

## 🛠️ Prerequisites & Environment Variables

Before deploying, ensure you have the following API keys ready:

| Variable | Description | Where to Get |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | High-speed LLM inference for code evaluation agents | [console.groq.com](https://console.groq.com) |
| `GITHUB_TOKEN` | GitHub Personal Access Token (prevents rate limits on repo cloning) | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `NEXT_PUBLIC_API_URL` | Public URL of your deployed FastAPI backend (e.g., `https://api.yourdomain.com`) | Deployed backend URL |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL of your backend (e.g., `wss://api.yourdomain.com`) | Deployed backend URL |

---

## 🅰️ Option A: 1-Click Deployment via Render.com (Recommended)

The repository already includes a pre-configured [render.yaml](file:///c:/Users/legit/OneDrive/Desktop/PROJECTS_FINAL_RESUME/MAJORPROJECT_EVALUATOR/render.yaml) blueprint.

### Step 1: Connect GitHub to Render
1. Visit [dashboard.render.com](https://dashboard.render.com/) and log in with GitHub.
2. Click **New +** → **Blueprint**.
3. Select your repository: **`ibanmondal/CODE-BEAST-AI`**.

### Step 2: Configure Environment Variables
Render will read `render.yaml` and provision:
- `codebeast-api` (FastAPI Web Service)
- `codebeast-worker` (Celery Multi-Agent Background Worker)
- `codebeast-frontend` (Next.js Dashboard)
- `codebeast-redis` (Redis In-Memory Queue)
- `codebeast-db` (PostgreSQL Database)

In the Render prompt, fill in:
- `GROQ_API_KEY`: Your Groq API key
- `GITHUB_TOKEN`: Your GitHub personal access token

### Step 3: Deploy & Launch
Click **Apply Blueprint**. Render builds and deploys all 5 services automatically.

---

## 🅱️ Option B: Vercel (Frontend) + Render / Railway (Backend)

### 1. Deploy Frontend on Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `ibanmondal/CODE-BEAST-AI`.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Next.js**.
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://codebeast-api.onrender.com`).
6. Click **Deploy**.

### 2. Deploy Backend on Railway or Render
- Root directory: `backend`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add Redis & PostgreSQL plugins with 1 click.

---

## 🅲 Option C: AWS EC2 / Lightsail Deployment

The repository includes an automated setup script [deploy_aws.sh](file:///c:/Users/legit/OneDrive/Desktop/PROJECTS_FINAL_RESUME/MAJORPROJECT_EVALUATOR/deploy_aws.sh).

### Step 1: Launch an Ubuntu Instance
- Launch an EC2 `t3.medium` or Lightsail instance running **Ubuntu 22.04 LTS / 24.04 LTS**.
- Allow inbound ports: `80` (HTTP), `443` (HTTPS), and `22` (SSH).

### Step 2: Run 1-Command Deployment
SSH into your server and execute:
```bash
curl -fsSL https://raw.githubusercontent.com/ibanmondal/CODE-BEAST-AI/main/deploy_aws.sh | bash
```
The script automatically:
1. Installs Docker, Docker Compose, Nginx, and Certbot.
2. Clones the latest `main` branch.
3. Builds and launches the multi-container stack (`docker-compose.prod.yml`).
4. Configures Nginx reverse proxy with WebSocket stream support.

---

## 📋 Verification Checklist After Deployment

- [ ] **Health Endpoint**: `GET https://your-backend-url/health` returns `{"status": "ok"}`
- [ ] **API Documentation**: Open `https://your-backend-url/docs` to test Swagger UI
- [ ] **WebSocket Stream**: Verify live evaluations stream via `/api/v1/ws/`
- [ ] **Frontend**: Test Dashboard, Trophy Hall (`/judges`), and Leaderboard (`/leaderboard`)
- [ ] **Certificate Generator**: Open a certificate on `/judges`, test **Download Official PDF** and **Print Certificate**
