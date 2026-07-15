from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=True,
    future=True
)

SessionLocal = async_sessionmaker(
    engine, expire_on_commit=False
)

async def get_db():
    async with SessionLocal() as session:
        yield session
