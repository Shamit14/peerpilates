from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.routes import users, ai_agent, protected, files
from app.auth import routes as auth_routes
from app.models.user import Base
from app.database import engine


app = FastAPI(
    title="AI Agent Backend",
    description="Backend for AI Agent helping with UPSC/GATE/Current Affairs",
    version="1.0.0"
)

# Add session middleware for OAuth state management
app.add_middleware(SessionMiddleware, secret_key="your-secret-key-for-oauth-sessions-change-in-production")

# Allow frontend (e.g., Next.js) to access the API
origins = [
    "http://localhost:3000",  # Next.js default
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite alternative port
    "http://localhost:5175",  # Vite alternative port (current)
    "http://127.0.0.1:5173",  # Vite alternative
    "http://127.0.0.1:5174",  # Vite alternative port
    "http://127.0.0.1:5175",  # Vite alternative port (current)
]

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
