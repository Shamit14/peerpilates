import React from 'react';
import { useUser } from '../contexts/UserContext';

function Header({ selectedExam, onBackToExamSelection }) {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  const getExamIcon = (examName) => {
    const icons = {
      'GATE': '🏛️',
      'UPSC': '📚', 
      'SSC': '🏢'
    };
    return icons[examName?.toUpperCase()] || '📖';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {onBackToExamSelection && (
              <button
                onClick={onBackToExamSelection}
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Exam Selection</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getExamIcon(selectedExam?.name)}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedExam?.name || 'GATE'} Preparation
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedExam?.title || 'Graduate Aptitude Test in Engineering - AI-Powered Study Assistant'}
                </p>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;