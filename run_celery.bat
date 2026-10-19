@echo off
title CodeBeast Celery Worker
echo ===================================================
echo ⚡ Starting CodeBeast Celery Distributed Worker
echo ===================================================
cd /d %~dp0backend
if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat
celery -A app.worker.celery_app worker --loglevel=info -P threads -c 4
pause
