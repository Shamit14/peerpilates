# AI Agent - Government Exam Preparation Platform

A comprehensive AI-powered platform for Indian government competitive exam preparation, featuring intelligent chat assistance, file upload capabilities, and specialized knowledge for UPSC, GATE, SSC, Banking, and Railways exams.

## 🚀 Features

### AI-Powered Chat Assistant
- **Gemini AI Integration**: Advanced AI responses powered by Google Gemini 1.5 Flash
- **Government Exam Expertise**: Specialized knowledge for Indian competitive exams
- **Multi-Subject Support**: UPSC, GATE, SSC, Banking, Railways, Current Affairs
- **Intelligent Fallback**: Comprehensive pre-built responses when AI is unavailable

### File Processing & Analysis
- **PDF Text Extraction**: Upload PDFs and get AI analysis of content
- **Multiple File Types**: Support for PDF, TXT, DOC, DOCX, and images
- **Drag & Drop Interface**: Easy file upload with visual feedback
- **Content Integration**: AI considers uploaded content when answering questions

### Authentication & User Management
- **Google OAuth**: Secure login with Google accounts
- **Email/Password**: Traditional authentication option
- **Session Management**: Persistent user sessions
- **User Profiles**: Personalized experience for each user

### Modern UI/UX
- **ChatGPT-like Interface**: Familiar chat experience
- **Dark Theme**: Modern, eye-friendly design
- **Responsive Design**: Works on desktop and mobile
- **Real-time Chat**: Instant messaging experience
- **Chat History**: Persistent conversation management

## 🏗️ Architecture

### Backend (FastAPI)
```
app/
├── main.py              # FastAPI application entry point
├── config.py            # Environment configuration
├── database.py          # Database connection and models
├── auth/                # Authentication logic
│   ├── oauth.py         # Google OAuth implementation
│   └── routes.py        # Auth endpoints
├── models/              # Database models
│   └── user.py          # User model
├── routes/              # API endpoints
│   ├── ai_agent.py      # AI chat endpoints
│   ├── files.py         # File upload/processing
│   ├── users.py         # User management
│   └── protected.py     # Protected routes
├── schemas/             # Pydantic schemas
│   └── user.py          # User schemas
└── services/            # Business logic
    └── agent.py         # AI service logic
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   ├── components/      # UI components
│   │   ├── Header.jsx   # Navigation header
│   │   ├── SideBar.jsx  # Chat sidebar
│   │   ├── ChatWindow.jsx # Main chat interface
│   │   ├── InputBar.jsx # Message input with file upload
│   │   └── Message.jsx  # Chat message component
│   └── contexts/        # React contexts
│       ├── ChatContext.jsx     # Chat state management
│       └── FileUploadContext.jsx # File upload state
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/database_name

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini AI (Get from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Backend URL
BACKEND_URL=http://localhost:8000
```

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Ai-Agent.git
cd Ai-Agent
```

2. **Create virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up database**
```bash
# Create PostgreSQL database
# Update DATABASE_URL in .env file
```

5. **Run the backend**
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env` as `GEMINI_API_KEY`

### Database Setup
1. Install PostgreSQL
2. Create a database
3. Update `DATABASE_URL` in `.env`
4. Tables will be created automatically on first run

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/auth/google/login` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/google/status` - Check auth status

### AI Agent Endpoints
- `POST /api/ai-agent/chat` - Send message to AI
- `GET /api/ai-agent/status` - Check AI service status
- `POST /api/ai-agent/test` - Test Gemini API

### File Management
- `POST /api/files/upload` - Upload files
- `GET /api/files/{file_id}` - Get file info
- `DELETE /api/files/{file_id}` - Delete file

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and commit: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

### Code Standards
- **Backend**: Follow PEP 8 for Python code
- **Frontend**: Use ESLint and Prettier for JavaScript/React
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

### Testing
```bash
# Backend tests
pytest

# Frontend tests
cd frontend && npm test
```

## 📦 Deployment

### Backend Deployment
- Use Docker for containerized deployment
- Set environment variables in production
- Use PostgreSQL for production database
- Configure CORS for frontend domain

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `dist` folder to your hosting service.

## 🔒 Security

- All API keys are stored in environment variables
- OAuth tokens are securely managed
- File uploads are validated and sanitized
- SQL injection protection via SQLAlchemy
- CORS configured for security

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Gemini API Errors**
   - Verify API key is correct
   - Check API quotas and limits
   - Ensure internet connection

3. **OAuth Issues**
   - Check redirect URIs in Google Console
   - Verify client ID and secret
   - Clear browser cookies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: FastAPI, PostgreSQL, AI Integration
- **Frontend Development**: React, Vite, Tailwind CSS
- **DevOps**: Docker, CI/CD, Deployment
- **AI/ML**: Gemini API, NLP, Content Processing

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Voice input/output
- [ ] Advanced analytics dashboard
- [ ] Collaborative study rooms
- [ ] Mock test integration
- [ ] Progress tracking
- [ ] Multiple language support

### Performance Improvements
- [ ] Response caching
- [ ] Database optimization
- [ ] CDN integration
- [ ] Lazy loading

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

---

**Made with ❤️ for Government Exam Aspirants**
