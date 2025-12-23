// API Configuration for PeerPilates Frontend
// Uses environment variable in production, falls back to localhost for development

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_URL;

// Helper function to build API endpoints
export const api = {
  baseUrl: API_URL,
  auth: {
    status: `${API_URL}/api/auth/google/status`,
    googleLogin: (allowSignup = true) => `${API_URL}/api/auth/google/login?allow_signup=${allowSignup}`,
    login: `${API_URL}/api/login`,
    signup: `${API_URL}/api/signup`,
  },
  chat: `${API_URL}/api/ai-agent/chat`,
  files: {
    upload: `${API_URL}/api/files/upload`,
  },
};
