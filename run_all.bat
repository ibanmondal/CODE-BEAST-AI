@echo off
echo ===================================================
echo Starting CodeBeast AI Platform
echo ===================================================

:: 1. Start Redis in Docker (if not already running)
echo Starting Redis...
docker run -p 6379:6379 -d redis 2>nul

:: 2. Start Backend in a new window
echo Starting FastAPI Backend...
start "CodeBeast - FastAPI Backend" cmd /k "cd backend && (if exist venv\Scripts\activate call venv\Scripts\activate) && uvicorn main:app --reload --reload-dir app --reload-exclude worker_repos"

:: 3. Start Celery Worker in a new window
echo Starting Celery Worker...
start "CodeBeast - Celery Worker" cmd /k "cd backend && (if exist venv\Scripts\activate call venv\Scripts\activate) && celery -A app.worker.celery_app worker --loglevel=info -P threads"

:: 4. Start Next.js Frontend in a new window
echo Starting Next.js Frontend...
start "CodeBeast - Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Frontend will be accessible at: http://localhost:3000
echo Backend will be accessible at: http://localhost:8000
echo.
