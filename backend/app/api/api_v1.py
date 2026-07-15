from fastapi import APIRouter
from app.api.endpoints import analysis, evaluate, stats

api_router = APIRouter()
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(evaluate.router, prefix="/evaluate", tags=["evaluate"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
