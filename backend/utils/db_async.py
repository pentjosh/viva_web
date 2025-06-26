from .env import DATABASE_URL;
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession;
from sqlalchemy.orm import declarative_base;
from contextlib import asynccontextmanager;

engine = create_async_engine(DATABASE_URL);
AsyncSessionLocal = async_sessionmaker(bind=engine, auto_commit=False, class_=AsyncSession, expire_on_commit=False);
Base = declarative_base();

@asynccontextmanager
async def get_async_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close();