import asyncio
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL}")

async def test_connection():
    try:
        # Test with SQLAlchemy async engine
        from sqlalchemy import text
        engine = create_async_engine(DATABASE_URL)
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.fetchone()
            print(f"✅ SQLAlchemy connection successful!")
            print(f"PostgreSQL version: {version[0]}")
        
        await engine.dispose()
        
        # Test direct asyncpg connection
        conn = await asyncpg.connect(DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Direct asyncpg connection successful!")
        print(f"PostgreSQL version: {version}")
        await conn.close()
        
        print("🎉 Database connection test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())