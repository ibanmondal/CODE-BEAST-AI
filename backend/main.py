from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.endpoints import evaluate, stats, ws
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize resources (DB connections, etc.)
    print("CodeBeast API is starting up...")
    yield
    # Shutdown: Clean up resources
    print("CodeBeast API is shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for CodeBeast Repository Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. Configure properly for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["evaluate"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(ws.router, prefix="/api/v1/ws", tags=["websocket"])

@app.get("/")
async def root():
    return {"message": "Welcome to CodeBeast API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
