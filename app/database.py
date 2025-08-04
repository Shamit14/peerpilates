from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Use settings.DATABASE_URL loaded from config.py
DATABASE_URL = settings.DATABASE_URL

print("LOADED DATABASE_URL:", DATABASE_URL)

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

engine = create_async_engine(DATABASE_URL, echo=True)

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        yield session
