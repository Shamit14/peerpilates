from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
from app.routes import users, ai_agent, protected, files
from app.auth import routes as auth_routes
from app.models.user import Base
from app.database import engine
from app.config import settings
import os


app = FastAPI(
    title="PeerPilates API",
    description="Backend for PeerPilates - AI Agent helping with UPSC/GATE/Current Affairs",
    version="1.0.0"
)

# Add session middleware for OAuth state management
app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET_KEY)

# Get frontend URL from environment or use defaults
frontend_url = settings.FRONTEND_URL

# Allow frontend to access the API
origins = [
    "http://localhost:3000",  # Next.js default
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite alternative port
    "http://localhost:5175",  # Vite alternative port
    "http://127.0.0.1:5173",  # Vite alternative
    "http://127.0.0.1:5174",  # Vite alternative port
    "http://127.0.0.1:5175",  # Vite alternative port
    frontend_url,  # Production frontend URL
]

# Filter out empty strings and None values
origins = [origin for origin in origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run this when app starts
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Route registration
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(ai_agent.router, prefix="/api", tags=["AI Agent"])
app.include_router(protected.router, prefix="/api", tags=["Protected"])
app.include_router(files.router, prefix="/api", tags=["Files"])

# Serve frontend static files (for production)
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    # Serve index.html for all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If path starts with api, let it 404 naturally
        if full_path.startswith("api"):
            return FileResponse(status_code=404)
        # Serve index.html for all other routes
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return FileResponse(status_code=404)
