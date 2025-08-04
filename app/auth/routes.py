from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.auth.oauth import oauth
from app.database import get_db
from app.models.user import User
from app.config import settings
import urllib.parse
import secrets
import string
import json
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

def generate_secure_password(length=12):
    """Generate a secure password with at least one uppercase, one number, and one special character"""
    # Ensure we have at least one of each required character type
    password_chars = [
        secrets.choice(string.ascii_uppercase),  # At least one uppercase
        secrets.choice(string.digits),           # At least one number
        secrets.choice("!@#$%^&*"),             # At least one special character
    ]
    
    # Fill the rest with random characters
    all_chars = string.ascii_letters + string.digits + "!@#$%^&*"
    for _ in range(length - 3):
        password_chars.append(secrets.choice(all_chars))
    
    # Shuffle the password characters
    secrets.SystemRandom().shuffle(password_chars)
    return ''.join(password_chars)

@router.get("/google/login")
async def login_with_google(request: Request, allow_signup: bool = False):
    """Initiate Google OAuth login flow"""
    if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "your_google_oauth_client_id_here":
        raise HTTPException(status_code=500, detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file")
    
    # Store the allow_signup preference in the session
    request.session['allow_signup'] = allow_signup
    
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Get the access token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info using the access token
        resp = await oauth.google.get('https://www.googleapis.com/oauth2/v2/userinfo', token=token)
        user_info = resp.json()

        # Check if user exists
        result = await db.execute(select(User).where(User.email == user_info["email"]))
        user = result.scalar_one_or_none()
        
        # Get the allow_signup preference from session
        allow_signup = request.session.get('allow_signup', False)
        
        is_new_user = False
        if not user:
            if not allow_signup:
                # User doesn't exist and signup not allowed - redirect with error
                error_message = urllib.parse.quote(f"No account found for {user_info['email']}. Please create an account first or use Google Sign-In from the signup page.")
                frontend_url = f"http://localhost:5173/auth-error?error={error_message}"
                return RedirectResponse(url=frontend_url)
            
            is_new_user = True
            # Generate a secure password for Google OAuth users
            secure_password = generate_secure_password()
            hashed_password = pwd_context.hash(secure_password)
            
            # Create new user from Google info
            user = User(
                name=user_info.get("name", "Unknown User"), 
                email=user_info["email"], 
                password=hashed_password  # Secure hashed password for OAuth users
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Create user data for frontend
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_new_user": is_new_user
        }

        # Properly encode user data as JSON for URL
        user_json = urllib.parse.quote(json.dumps(user_data))
        
        # Redirect to frontend with user data
        frontend_url = f"http://localhost:5173/auth-success?user={user_json}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        # Redirect to frontend with error
        error_message = urllib.parse.quote(str(e))
        frontend_url = f"http://localhost:5173/auth-error?error={error_message}"
        return RedirectResponse(url=frontend_url)

@router.get("/google/status")
async def google_auth_status():
    """Check if Google OAuth is properly configured"""
    return {
        "configured": bool(
            settings.GOOGLE_CLIENT_ID and 
            settings.GOOGLE_CLIENT_ID != "your_google_oauth_client_id_here" and
            settings.GOOGLE_CLIENT_SECRET and 
            settings.GOOGLE_CLIENT_SECRET != "your_google_oauth_client_secret_here"
        ),
        "client_id_set": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID != "your_google_oauth_client_id_here"),
        "client_secret_set": bool(settings.GOOGLE_CLIENT_SECRET and settings.GOOGLE_CLIENT_SECRET != "your_google_oauth_client_secret_here")
    }
