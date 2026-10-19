# 🚀 CodeBeast AI - Production Deployment Guide

This guide covers three proven deployment strategies for deploying CodeBeast AI in production:
1. **Option 1 (Recommended / Zero-Cost Cloud):** Vercel (Frontend) + Render.com (Backend API + Celery Worker + Redis + PostgreSQL).
2. **Option 2 (Single-Server VPS):** Docker Compose on any Linux Server (DigitalOcean, AWS EC2, GCP, Hetzner) with Nginx & Let's Encrypt SSL.
3. **Option 3 (Railway.app):** Unified containerized deployment with one dashboard.

---

## 🏛 Architecture Overview

CodeBeast AI is built on a high-throughput, decoupled microservices architecture:

| Component | Technology | Recommended Host | Production Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (React 19, Tailwind v4, Three.js shaders) | **Vercel** or Docker | Edge UI, Real-time Visualizations, Cohort Leaderboard |
| **Backend API** | FastAPI, Uvicorn, Python 3.11 | **Render** or Docker | REST API, WebSocket Broadcaster, OpenAPI Docs |
| **Async Worker** | Celery, LangGraph Multi-Agent Graph | **Render Worker** or Docker | Repo Cloner, TreeSitter AST Parser, ConsJudge LLM Engine |
| **Message Broker** | Redis 7 | **Render Redis** / **Upstash** | Celery Task Queue & Pub/Sub Event Bus |
| **Database** | PostgreSQL 15 (SQLite fallback) | **Render Postgres** / **Supabase** | Historical Job Storage & Batch Cohort Reports |

---

## ⚡ Option 1: 1-Click Cloud Deployment (Vercel + Render)

This strategy separates edge UI rendering (Vercel) from async AI compute (Render), maximizing performance while remaining within free tiers.

### Step 1: Deploy Backend, Worker & Database on Render
1. Sign up or log in to [Render.com](https://render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository: `ibanmondal/CODE-BEAST-AI`.
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - `codebeast-api` (FastAPI Web Service)
   - `codebeast-worker` (Celery Background Worker)
   - `codebeast-redis` (In-Memory Broker)
   - `codebeast-db` (Managed PostgreSQL Database)
5. Fill in the required environment variables in the Render Blueprint UI:
   - `GROQ_API_KEY`: Your Groq Cloud API Key ([console.groq.com](https://console.groq.com/keys))
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token ([github.com/settings/tokens](https://github.com/settings/tokens))
6. Click **Apply**. Render will automatically provision all services and output your backend URL:
   ```
   https://codebeast-api.onrender.com
   ```

### Step 2: Deploy Frontend on Vercel
1. Sign up or log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** and import `ibanmondal/CODE-BEAST-AI`.
3. In project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** Click `Edit` and select `frontend`
4. Expand **Environment Variables** and add:
   ```env
   NEXT_PUBLIC_API_URL = https://codebeast-api.onrender.com
   NEXT_PUBLIC_WS_URL  = wss://codebeast-api.onrender.com
   ```
5. Click **Deploy**. Vercel will build the frontend and provide your production URL:
   ```
   https://codebeast.vercel.app
   ```

---

## 🐳 Option 2: Self-Hosted VPS Deployment (Docker Compose)

Deploy everything on a single Ubuntu/Debian cloud VM (AWS EC2, DigitalOcean Droplet, Hetzner, GCP).

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+ installed:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ```

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/ibanmondal/CODE-BEAST-AI.git
cd CODE-BEAST-AI

# Create production environment file
cp .env.example .env
nano .env
```
Ensure `.env` contains your actual API keys:
```env
GROQ_API_KEY=gsk_your_actual_key
GITHUB_TOKEN=ghp_your_actual_token
POSTGRES_PASSWORD=your_secure_db_password
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

### Step 2: Build and Launch Containers
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify service status:
```bash
docker compose -f docker-compose.prod.yml ps
```

### Step 3: Configure Nginx Reverse Proxy with SSL (Certbot)
Create `/etc/nginx/sites-available/codebeast`:
```nginx
server {
    server_name your-domain.com;

    # Frontend UI
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Real-Time Telemetry
    location /api/v1/ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Interactive API Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

Enable site and install free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/codebeast /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🚂 Option 3: Railway.app Deployment

1. Create a new project in [Railway.app](https://railway.app).
2. Provision **PostgreSQL** and **Redis** from the Railway template marketplace.
3. Add a service from GitHub repo pointing to `backend/Dockerfile` with start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add a second service from the same repo for the Celery Worker:
   ```bash
   celery -A app.worker worker --loglevel=info
   ```
5. Add a third service for `frontend/Dockerfile`.
6. Attach Railway's generated PostgreSQL and Redis environment variables to both backend services.

---

## 🔍 Post-Deployment Verification Checklist

Once deployed, verify platform health:

1. **API Health Probe:**
   ```bash
   curl https://your-backend-domain.com/health
   # Expected response: {"status":"ok","service":"CodeBeast Backend API","port":8000}
   ```
2. **WebSocket Live Telemetry:**
   Open `https://your-frontend-domain.com/live` and verify the green status badge displays:
   `Connected (Live Stream)`
3. **Execute Test Evaluation:**
   Submit `https://github.com/pallets/flask` on the `/analysis` page or `/upload` page to confirm the full multi-agent pipeline completes in under 30 seconds.
