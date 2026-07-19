from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Use settings.DATABASE_URL loaded from config.py
DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in environment variables")

# Convert postgresql:// to postgresql+asyncpg:// if needed (for Render compatibility)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,          # Keep 5 connections ready
    max_overflow=10,      # Allow up to 10 extra connections under load
    pool_recycle=300,     # Recycle connections every 5 min (Render can drop idle ones)
    pool_pre_ping=True,   # Test connections before using them (avoids stale connection errors)
    pool_timeout=30,      # Wait up to 30s for a connection from the pool
)

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        yield session
