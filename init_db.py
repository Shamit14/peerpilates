import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.user import Base
from app.config import settings

async def init_db():
    """Initialize database tables"""
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=True)
        
        print("Creating database tables...")
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created successfully!")
        
        # Check if tables were created
        async with engine.begin() as conn:
            result = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            ))
            tables = result.fetchall()
            print(f"📋 Created tables: {[table[0] for table in tables]}")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    from sqlalchemy import text
    asyncio.run(init_db())