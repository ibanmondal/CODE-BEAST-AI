@echo off
title CodeBeast AI Launcher
echo ===================================================
echo 🚀 Starting CodeBeast AI Multi-Agent Platform
echo ===================================================

:: 1. Start Redis in Docker (if docker is running)
echo [1/4] Checking Redis container...
docker start codebeast_redis 2>nul || docker run --name codebeast_redis -p 6379:6379 -d redis 2>nul
echo Purging old tasks from Redis queue...
docker exec codebeast_redis redis-cli FLUSHALL 2>nul

:: 2. Start Backend in a new window
echo [2/4] Starting FastAPI Backend on Port 8000...
start "CodeBeast - FastAPI Backend" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app --reload-exclude worker_repos"

:: 3. Start Celery Worker in a new window
echo [3/4] Starting Celery Multi-Agent Worker...
start "CodeBeast - Celery Worker" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && celery -A app.worker.celery_app worker --loglevel=info -P threads -c 4"


:: 4. Start Next.js Frontend in a new window
echo [4/4] Starting Next.js Frontend Dashboard...
start "CodeBeast - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo ✅ All 3 services launched in separate windows!
echo 🌐 Frontend UI:  http://localhost:3000
echo 🔌 Backend API:  http://localhost:8000/docs
echo ===================================================

