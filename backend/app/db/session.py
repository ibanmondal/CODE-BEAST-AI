from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

engine = None
SessionLocal = None

try:
    # Only initialize if using PostgreSQL / async driver
    if not str(settings.SQLALCHEMY_DATABASE_URI).startswith("sqlite"):
        engine = create_async_engine(
            settings.SQLALCHEMY_DATABASE_URI,
            echo=False,
            future=True
        )
        SessionLocal = async_sessionmaker(
            engine, expire_on_commit=False
        )
except Exception:
    engine = None
    SessionLocal = None

async def get_db():
    if SessionLocal:
        async with SessionLocal() as session:
            yield session
    else:
        yield None

