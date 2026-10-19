@echo off
title CodeBeast AI Launcher
echo ===================================================
echo 🚀 Starting CodeBeast AI Multi-Agent Platform
echo ===================================================

:: 1. Start Redis Server
echo [1/4] Starting Redis Server on Port 6379...
set "REDIS_EXE=%LOCALAPPDATA%\Microsoft\WinGet\Packages\taizod1024.redis-windows-fork_Microsoft.Winget.Source_8wekyb3d8bbwe\Redis-8.10.2-Windows-x64-msys2\redis-server.exe"
if exist "%REDIS_EXE%" (
    start "CodeBeast - Redis Server" "%REDIS_EXE%"
) else (
    where redis-server >nul 2>&1 && start "CodeBeast - Redis Server" redis-server || (
        docker start codebeast_redis 2>nul || docker run --name codebeast_redis -p 6379:6379 -d redis 2>nul
    )
)

:: 2. Start Backend in a new window
echo [2/4] Starting FastAPI Backend on Port 8000...
start "CodeBeast - FastAPI Backend" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: 3. Start Celery Distributed Worker in a new window
echo [3/4] Starting Celery Distributed Evaluation Worker...
start "CodeBeast - Celery Worker" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && celery -A app.worker.celery_app worker --loglevel=info -P threads -c 4"

:: 4. Start Next.js Frontend in a new window
echo [4/4] Starting Next.js Frontend Dashboard...
start "CodeBeast - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo ✅ All 4 services launched in separate windows!
echo 🌐 Frontend UI:  http://localhost:3000
echo 🔌 Backend API:  http://localhost:8000/docs
echo ⚡ Celery Worker: Running (Threads pool, 4 concurrency)
echo 📊 Live Monitor: http://localhost:3000/live
echo ===================================================
