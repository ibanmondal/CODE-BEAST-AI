"""
CodeBeast AI - Celery Application Export Module
Allows both `celery -A app.worker.celery_app worker` and `celery -A app.worker worker`
to locate the Celery application instance seamlessly in production and development.
"""
from app.worker import celery_app

__all__ = ["celery_app"]
