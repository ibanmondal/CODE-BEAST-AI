import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.base import Base
from app.models.repository import Repository # Import models so they are registered

async def init_db():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)
    async with engine.begin() as conn:
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created.")

if __name__ == "__main__":
    asyncio.run(init_db())
