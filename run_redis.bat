@echo off
title CodeBeast Redis Server
echo ===================================================
echo ⚡ Starting CodeBeast Redis Server (Port 6379)
echo ===================================================
set "REDIS_EXE=%LOCALAPPDATA%\Microsoft\WinGet\Packages\taizod1024.redis-windows-fork_Microsoft.Winget.Source_8wekyb3d8bbwe\Redis-8.10.2-Windows-x64-msys2\redis-server.exe"
if exist "%REDIS_EXE%" (
    "%REDIS_EXE%"
) else (
    where redis-server >nul 2>&1 && redis-server || (
        docker start codebeast_redis 2>nul || docker run --name codebeast_redis -p 6379:6379 -d redis
    )
)
pause
