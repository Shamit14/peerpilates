# PeerPilates — AI-Powered Government Exam Preparation Platform

> A comprehensive AI-powered web platform for Indian government competitive exam preparation, featuring an intelligent chat assistant, file upload & analysis, mock test generation, and study tools — built with FastAPI, React, PostgreSQL, and Google Gemini AI.

---

## 🌐 Live Demo

| Service   | URL                                                            |
|-----------|----------------------------------------------------------------|
| Frontend  | [peerpilates-frontend.onrender.com](https://peerpilates-frontend.onrender.com) |
| Backend   | [peerpilates-api.onrender.com](https://peerpilates-api.onrender.com)           |
| API Docs  | [peerpilates-api.onrender.com/docs](https://peerpilates-api.onrender.com/docs) |

---

## 🚀 Key Features

### 🤖 AI Chat Assistant
- **Google Gemini 2.5 Flash** integration for intelligent, context-aware responses
- Specialized for Indian government exams: **UPSC, GATE, SSC, Banking, Railways**
- Structured responses with headings, bullet points, and follow-up questions
- Intelligent fallback engine with pre-built knowledge base when AI is unavailable

### 📄 File Upload & Analysis
- **Multi-format support**: PDF, TXT, DOCX, DOC, images, and source code files
- **Three-tier PDF extraction**: pdfplumber → PyMuPDF → PyPDF2 (table extraction included)
- Drag-and-drop interface with visual feedback
- Uploaded content is integrated into AI context for document-aware Q&A

### 📝 Mock Test Generator
- AI-generated MCQ papers with configurable parameters
- **Exam types**: GATE, UPSC, SSC, Banking, Railways
- **Difficulty levels**: Easy, Medium, Hard
- Configurable question count and duration
- Optional answer key with detailed explanations
- Fallback question bank for offline generation

### 🔐 Authentication
- **Google OAuth 2.0** — one-click social login
- **Email/Password** — traditional registration with strong password validation
- Secure session management via Starlette middleware
- Passwords hashed with bcrypt

### 🎨 Modern UI/UX
- ChatGPT-like dark-themed interface
- Responsive design (desktop + mobile)
- Real-time chat with persistent history
- Sidebar with conversation management

---

## 🏗️ Architecture Overview

```
┌─────────────┐     HTTP/REST      ┌──────────────┐     asyncpg      ┌────────────┐
│   React 19  │ ◄────────────────► │   FastAPI    │ ◄──────────────► │ PostgreSQL │
│   (Vite 7)  │                    │  (Uvicorn)   │                  │ (Render)   │
└─────────────┘                    └──────┬───────┘                  └────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                         ┌────┴─────┐           ┌─────┴──────┐
                         │ Gemini   │           │ Google     │
                         │ 2.5 Flash│           │ OAuth 2.0  │
                         └──────────┘           └────────────┘
```

### Backend Structure
```
app/
├── main.py              # FastAPI entry point, middleware, routing
├── config.py            # Environment variable management
├── database.py          # Async SQLAlchemy engine + connection pool
├── auth/
│   ├── oauth.py         # Google OAuth client (Authlib)
│   └── routes.py        # OAuth login, callback, status
├── models/
│   └── user.py          # SQLAlchemy User model
├── routes/
│   ├── users.py         # Signup & login endpoints
│   ├── ai_agent.py      # AI chat + Gemini integration
│   ├── files.py         # File upload & processing
│   ├── mock_test.py     # Mock test generation
│   └── protected.py     # Protected route examples
├── schemas/
│   └── user.py          # Pydantic request/response schemas
└── services/
    └── agent.py         # AI service business logic
```

### Frontend Structure
```
frontend/src/
├── App.jsx              # Root component, routing, layout
├── main.jsx             # React entry point
├── components/
│   ├── Header.jsx       # Navigation header
│   ├── SideBar.jsx      # Chat history sidebar
│   ├── chatWindow.jsx   # Chat message container
│   ├── InputBar.jsx     # Message input + file upload
│   ├── Message.jsx      # Formatted message renderer
│   ├── Auth.jsx         # Login/signup forms
│   ├── AuthSuccess.jsx  # OAuth callback handler
│   ├── AuthError.jsx    # OAuth error display
│   ├── MockTest.jsx     # Mock test configuration & display
│   ├── StudyTools.jsx   # Study utilities
│   ├── ExamSelection.jsx# Exam category picker
│   └── SuggestionCard.jsx# Quick-start suggestions
├── contexts/
│   ├── UserContext.jsx      # Auth state management
│   ├── ChatContext.jsx      # Chat state management
│   └── FileUploadContext.jsx# File upload state
├── config/              # Frontend configuration
├── utils/               # Utility functions
└── assets/              # Static assets
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3                    |
| **Backend**  | Python 3.11, FastAPI, Uvicorn                        |
| **Database** | PostgreSQL (async via SQLAlchemy 2.0 + asyncpg)      |
| **AI**       | Google Gemini 2.5 Flash (google-generativeai)        |
| **Auth**     | bcrypt, Authlib (Google OAuth), Starlette Sessions   |
| **PDF**      | pdfplumber, PyMuPDF, PyPDF2                          |
| **Deploy**   | Render (render.yaml Infrastructure-as-Code)          |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL 12+
- Git

### 1. Clone & Setup Backend

```bash
git clone https://github.com/Shamit14/Ai-Agent.git
cd Ai-Agent

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/peerpilates_db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET_KEY=your-random-secret-key
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

### 4. Run the Application

```bash
# Terminal 1 — Backend
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

| Service  | URL                        |
|----------|----------------------------|
| Backend  | http://localhost:8000       |
| API Docs | http://localhost:8000/docs  |
| Frontend | http://localhost:5173       |

---

## 🔧 External Service Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:8000/api/auth/google/callback`
5. Copy Client ID & Secret to `.env`

### Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to `.env` as `GEMINI_API_KEY`

### PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `CREATE DATABASE peerpilates_db;`
3. Update `DATABASE_URL` in `.env`
4. Tables are created automatically on first startup

---

## 📚 API Reference

### Authentication
| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/signup`                    | Register new user        |
| POST   | `/api/login`                     | Login with credentials   |
| GET    | `/api/auth/google/login`         | Start Google OAuth flow  |
| GET    | `/api/auth/google/callback`      | OAuth callback handler   |
| GET    | `/api/auth/google/status`        | Check OAuth config       |

### AI Agent
| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/ai-agent/chat`             | Send message to AI       |
| GET    | `/api/ai-agent/status`           | AI service health check  |
| POST   | `/api/ai-agent/test`             | Test Gemini connectivity |

### Files
| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/files/upload`              | Upload & process files   |
| GET    | `/api/files/{file_id}`           | Get file info            |
| DELETE | `/api/files/{file_id}`           | Delete uploaded file     |
| GET    | `/api/files/supported-types`     | List supported formats   |

### Mock Tests
| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/mock-test/generate`        | Generate mock test paper |
| GET    | `/api/mock-test/subjects/{exam}` | Get subjects for exam    |

---

## 🚀 Deployment (Render)

### Automatic (Recommended)
1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo — Render reads `render.yaml` automatically
4. Set environment variables in the Render dashboard

### Manual
See the detailed [deployment guide](#deployment-details) below.

<details>
<summary><b>📖 Deployment Details</b></summary>

#### 1. PostgreSQL Database
- Render Dashboard → New → PostgreSQL
- Name: `peerpilates-db`, Plan: Free, Region: Oregon

#### 2. Backend Web Service
- New → Web Service → Connect repo
- Runtime: Python 3, Root: (empty)
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set env vars: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`, `BACKEND_URL`

#### 3. Frontend Static Site
- New → Static Site → Connect repo
- Root: `frontend`, Build: `npm install && npm run build`, Publish: `dist`
- Set env var: `VITE_API_URL`
- Add rewrite rule: `/*` → `/index.html`

#### 4. Update Google OAuth
Add production redirect URI:
`https://peerpilates-api.onrender.com/api/auth/google/callback`

</details>

---

## 🔒 Security

| Area                  | Implementation                                     |
|-----------------------|----------------------------------------------------|
| Password Storage      | bcrypt hashing with random salt                    |
| OAuth Tokens          | Server-side session management                     |
| API Keys              | Environment variables (never in source code)       |
| Input Validation      | Pydantic schemas with type constraints             |
| SQL Injection         | SQLAlchemy ORM parameterized queries               |
| CORS                  | Whitelisted origins only                           |
| File Upload           | Extension validation + size truncation             |

---

## 🧪 Testing

```bash
# Backend tests
pytest test_api.py
pytest test_db_connection.py
pytest test_gemini_api.py

# Frontend lint
cd frontend && npm run lint
```

---

## 🗺️ Roadmap

- [ ] 📱 Mobile app (React Native)
- [ ] 🎙️ Voice input/output
- [ ] 📊 Analytics dashboard
- [ ] 👥 Collaborative study rooms
- [ ] 🏆 Progress tracking & leaderboards
- [ ] 🌍 Multi-language support
- [ ] ⚡ Response caching (Redis)
- [ ] 🔄 CDN integration

---

## 📄 Documentation

| Document | Description                                           |
|----------|-------------------------------------------------------|
| [SRS.md](./SRS.md)   | Software Requirements Specification          |
| [SDD.md](./SDD.md)   | Software Design Document                     |
| [TEAM_SETUP.md](./TEAM_SETUP.md) | Team collaboration setup guide   |
| [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) | OAuth configuration guide |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

**Code Standards**: PEP 8 (Python) · ESLint (JavaScript) · Conventional Commits

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

| Role                  | Technologies                              |
|-----------------------|-------------------------------------------|
| Backend Development   | FastAPI, PostgreSQL, AI Integration       |
| Frontend Development  | React 19, Vite, Tailwind CSS              |
| AI/ML Engineering     | Gemini API, NLP, Content Processing       |
| DevOps                | Render, CI/CD, Infrastructure-as-Code     |

---

<p align="center"><b>Made with ❤️ for Government Exam Aspirants</b></p>
