from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()

@router.get("/protected/dashboard")
async def get_dashboard_data(db: AsyncSession = Depends(get_db)):
    """Get protected dashboard data for authenticated users."""
    return {
        "message": "Welcome to your dashboard!",
        "data": {
            "recent_chats": [],
            "study_progress": 0,
            "recommendations": []
        }
    }

@router.get("/protected/profile")
async def get_user_profile(db: AsyncSession = Depends(get_db)):
    """Get user profile information."""
    return {
        "message": "User profile endpoint",
        "profile": {
            "name": "User",
            "email": "user@example.com",
            "preferences": {}
        }
    }