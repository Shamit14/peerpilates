# Copilot Instructions for AI Agent Codebase

## Overview
This project is a full-stack AI agent platform with a Python backend (FastAPI) and a React/Vite frontend. It integrates OAuth, Gemini API, and a database, with clear separation of concerns and modular design.

## Architecture
- **Backend (`app/`)**: Python FastAPI app
  - `main.py`: FastAPI entrypoint, includes routers from `routes/`
  - `config.py`: Loads environment variables using `dotenv`, provides global `settings` object
  - `database.py`: Database connection setup (likely SQLAlchemy)
  - `auth/`: OAuth logic and authentication routes
  - `models/`: Database models (e.g., `user.py`)
  - `routes/`: API endpoints (e.g., `ai_agent.py`, `users.py`, `protected.py`)
  - `schemas/`: Pydantic schemas for request/response validation
  - `services/`: Business logic (e.g., `agent.py`)
- **Frontend (`frontend/`)**: React app with Vite
  - `src/components/`: Chat UI, sidebar, header, etc.
  - Tailwind CSS for styling

## Key Patterns & Conventions
- **Environment Variables**: Managed via `.env` in project root, loaded in `config.py`. Always use `settings` for config access.
- **Routing**: Backend routes are grouped by feature in `app/routes/`. Import and include routers in `main.py`.
- **Authentication**: OAuth logic in `auth/oauth.py`, routes in `auth/routes.py`. Use dependency injection for protected endpoints.
- **Models & Schemas**: Database models in `models/`, Pydantic schemas in `schemas/`. Keep business logic out of models/schemas.
- **Frontend**: Use functional React components. State management is local (no Redux/MobX). Styling via Tailwind classes.

## Developer Workflows
- **Backend**
  - Run: `uvicorn app.main:app --reload`
  - Environment: Ensure `.env` is present with required keys (`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GEMINI_API_KEY`)
  - Debug: Check `config.py` for printouts of loaded env vars
- **Frontend**
  - Run: `npm install && npm run dev` in `frontend/`
  - Build: `npm run build`
  - Tailwind: Config in `tailwind.config.js`, PostCSS in `postcss.config.js`

## Integration Points
- **OAuth**: Google OAuth via env vars, logic in `auth/`
- **Gemini API**: Key in `.env`, accessed via `settings.GEMINI_API_KEY`
- **Database**: URL in `.env`, connection in `database.py`
- **API Communication**: Frontend calls backend endpoints (see `routes/`)

## Examples
- Access config: `from app.config import settings`
- Add new route: Create file in `routes/`, import and include in `main.py`
- Add new model: Define in `models/`, create schema in `schemas/`

## References
- Backend: `app/main.py`, `app/config.py`, `app/routes/`, `app/auth/`
- Frontend: `frontend/src/components/`, `frontend/App.jsx`

---
_If any section is unclear or missing, please provide feedback for improvement._
