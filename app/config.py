import os
from dotenv import load_dotenv

# Path to .env file in root project directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Debug print to confirm correct path
print("Loading .env from:", env_path)

# Load environment variables from .env
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME = "AI Agent"
    DATABASE_URL = os.getenv("DATABASE_URL")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Debug print to confirm loaded values (only for development)
print("LOADED DATABASE_URL:", os.getenv("DATABASE_URL"))

settings = Settings()
