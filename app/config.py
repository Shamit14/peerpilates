import os
from dotenv import load_dotenv

# Path to .env file in root project directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Load environment variables from .env (for local development)
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME = "PeerPilates"
    
    # Database URL - handle Render's postgres:// vs postgresql+asyncpg://
    _db_url = os.getenv("DATABASE_URL", "")
    if _db_url.startswith("postgres://"):
        DATABASE_URL = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif _db_url.startswith("postgresql://"):
        DATABASE_URL = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        DATABASE_URL = _db_url
    
    # URLs
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Session
    SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "your-secret-key-for-oauth-sessions-change-in-production")

settings = Settings()
