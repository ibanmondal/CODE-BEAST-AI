# ==============================================================================
# CodeBeast AI - Unified Multi-Agent Platform Runner
# Grounded in Research: ConsJudge (2025), ASTNN/CodeBERT, AutoReview (FSE 2025)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🚀 Starting CodeBeast AI Multi-Agent Platform      " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check Docker / Redis
Write-Host "[1/4] Checking Redis..." -ForegroundColor Green
$redisRunning = (docker ps -q -f "publish=6379" 2>$null)
if (-not $redisRunning) {
    Write-Host "  -> Launching Redis container on port 6379..." -ForegroundColor Gray
    docker run --name codebeast_redis -p 6379:6379 -d redis 2>$null
    Start-Sleep -Seconds 1
    $redisRunning = (docker ps -q -f "publish=6379" 2>$null)
} else {
    Write-Host "  -> Redis already active." -ForegroundColor Gray
}
Write-Host "  -> Purging old tasks from Redis queue..." -ForegroundColor Gray
if ($redisRunning) {
    docker exec $redisRunning redis-cli FLUSHALL 2>$null
}

# Start FastAPI Backend
Write-Host "[2/4] Starting FastAPI Backend (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 }; Write-Host '--- Starting FastAPI Backend ---' -ForegroundColor Cyan; uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app --reload-exclude worker_repos"


# Start Celery Worker
Write-Host "[3/4] Starting Multi-Agent Celery Worker..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 }; Write-Host '--- Starting Celery Worker (LangGraph Multi-Agent Orchestrator) ---' -ForegroundColor Magenta; celery -A app.worker.celery_app worker --loglevel=info -P threads -c 4"

# Start Next.js Frontend
Write-Host "[4/4] Starting Next.js Frontend Dashboard (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '--- Starting Next.js Frontend ---' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ✅ All 3 Services Successfully Launched in Separate Windows!" -ForegroundColor Green
Write-Host " 🌐 Frontend UI:  http://localhost:3000" -ForegroundColor White
Write-Host " 🔌 Backend API:  http://localhost:8000/docs" -ForegroundColor White
Write-Host " 📊 Live Monitor: http://localhost:3000/live" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
