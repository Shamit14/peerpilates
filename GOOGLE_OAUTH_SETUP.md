# Google OAuth Setup Guide

## 🔧 Setting up Google OAuth for your AI Agent

To enable Google authentication in your application, follow these steps:

### 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "People API" for profile information

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8000/api/auth/google/callback`
     - `http://127.0.0.1:8000/api/auth/google/callback`

4. **Copy Your Credentials**
   - Copy the "Client ID" and "Client Secret"

### 2. Update Your .env File

Replace the placeholders in your `.env` file:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
```

### 3. Restart Your Application

After updating the `.env` file:

1. **Stop the backend** (Ctrl+C in the terminal)
2. **Restart the backend**:
   ```bash
   C:/aiagent/venv/Scripts/python.exe -m uvicorn app.main:app --reload
   ```
3. **Refresh your frontend** at http://localhost:5174

### 4. Test Google Authentication

1. Go to your application's login page
2. Click "Sign in with Google" (should now be enabled)
3. Complete the Google OAuth flow
4. You should be redirected back to your application

### 🔍 Troubleshooting

**Google Button Disabled?**
- Check that both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart your backend server after updating `.env`

**Redirect URI Mismatch?**
- Ensure your Google OAuth redirect URIs match exactly:
  - `http://localhost:8000/api/auth/google/callback`

**Still Not Working?**
- Check browser console for errors
- Verify Google Cloud project has the correct APIs enabled
- Check that your Google OAuth credentials are for a "Web application" type

### ✅ Verification

You can check if Google OAuth is configured by visiting:
`http://localhost:8000/api/auth/google/status`

This should return `{"configured": true}` when properly set up.
