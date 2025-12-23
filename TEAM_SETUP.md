# 🚀 Team Setup Guide - AI Agent Project

Welcome to the AI Agent for Government Exam Preparation project! This guide will help you get up and running quickly.

## 📋 Quick Start Checklist

- [ ] Clone the repository
- [ ] Set up environment variables
- [ ] Install dependencies
- [ ] Configure database
- [ ] Get API keys
- [ ] Run the application

## 🔗 Repository Link

**GitHub Repository**: https://github.com/Shamit14/Ai-Agent

```bash
git clone https://github.com/Shamit14/Ai-Agent.git
cd Ai-Agent
```

## ⚡ Quick Setup (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your own values (see API Keys section below)
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload
```

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔑 Required API Keys

### Google OAuth Setup (5 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### Gemini AI API Key (2 minutes)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy to `.env` as `GEMINI_API_KEY`

### Database Setup
**Option 1: PostgreSQL (Recommended)**
```bash
# Install PostgreSQL
# Create database: aiagent_db
# Update DATABASE_URL in .env
```

**Option 2: SQLite (Quick Testing)**
```bash
# Change in .env:
DATABASE_URL=sqlite:///./aiagent.db
```

## 📝 Environment Variables Template

Your `.env` file should look like this:
```env
# Database
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/aiagent_db

# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret

# Gemini AI
GEMINI_API_KEY=your_actual_gemini_key

# Backend URL
BACKEND_URL=http://localhost:8000
```

## 🧪 Test Your Setup

### Backend Test
```bash
curl http://localhost:8000/api/ai-agent/status
```

### Frontend Test
Open http://localhost:5173 and try:
1. Sign up with email
2. Login with Google
3. Send a test message
4. Upload a PDF file

## 🛠️ Development Workflow

### Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Code Standards
- **Backend**: Follow PEP 8, use type hints
- **Frontend**: Use ESLint, functional components
- **Commits**: Use conventional commit messages

## 🎯 Project Features You'll Be Working With

### AI Chat System
- **Gemini 1.5 Flash Integration**: Located in `app/routes/ai_agent.py`
- **Government Exam Specialization**: UPSC, GATE, SSC, Banking, Railways
- **File Processing**: PDF, TXT, DOC, DOCX support

### Authentication
- **Google OAuth**: `app/auth/oauth.py`
- **Session Management**: Secure user sessions
- **Protected Routes**: Role-based access

### Frontend Components
- **Chat Interface**: `frontend/src/components/ChatWindow.jsx`
- **File Upload**: `frontend/src/components/InputBar.jsx`
- **Modern UI**: Tailwind CSS with dark theme

## 📚 Useful Commands

```bash
# Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
npm run dev
npm run build
npm run preview

# Database
alembic revision --autogenerate -m "message"
alembic upgrade head

# Testing
pytest  # Backend tests
npm test  # Frontend tests
```

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 8000
npx kill-port 8000

# Kill process on port 5173
npx kill-port 5173
```

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

### OAuth Errors
- Check redirect URI matches exactly
- Verify client ID and secret
- Clear browser cookies

### Gemini API Issues
- Check API key is valid
- Verify internet connection
- Check API quotas

## 💬 Getting Help

1. **Check the logs**: Backend terminal shows detailed error messages
2. **Read the docs**: `/docs` endpoint for API documentation
3. **Ask the team**: Create an issue on GitHub
4. **Debug mode**: Set `DEBUG=True` in backend for detailed errors

## 🎉 You're Ready!

Once you complete this setup, you'll have:
- ✅ Full-stack AI application running locally
- ✅ Google OAuth authentication working
- ✅ Gemini AI responding to government exam queries
- ✅ File upload and PDF processing
- ✅ Modern chat interface like ChatGPT

**Happy coding! 🚀**

---

**Need help?** Contact the team or create an issue in the repository.

**Project Lead**: Shamit14  
**Repository**: https://github.com/Shamit14/Ai-Agent
