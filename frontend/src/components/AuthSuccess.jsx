import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';

const AuthSuccess = () => {
  const { login } = useUser();
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Parse user data from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        console.log('Raw user param:', userParam);
        const decodedParam = decodeURIComponent(userParam);
        console.log('Decoded user param:', decodedParam);
        
        const userData = JSON.parse(decodedParam);
        console.log('Parsed user data:', userData);
        
        if (userData.is_new_user) {
          setIsNewUser(true);
          setUserName(userData.name);
          setShowWelcome(true);
          // Show welcome message for 3 seconds, then proceed
          setTimeout(() => {
            login(userData);
            window.location.href = '/';
          }, 3000);
        } else {
          // Existing user, proceed immediately
          login(userData);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        console.error('User param was:', userParam);
        window.location.href = `/auth-error?error=${encodeURIComponent('Invalid user data: ' + error.message)}`;
      }
    } else {
      window.location.href = '/auth-error?error=No user data received';
    }
  }, [login]);

  if (showWelcome && isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-700">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to AI Agent!</h2>
              <p className="text-gray-300">
                Hi {userName}! We've created your account using Google Sign-In.
              </p>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Account Created:</strong> Your account has been automatically created with a secure password. 
                You can now access all AI Agent features!
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
              <p className="text-gray-400">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google Sign-In...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
