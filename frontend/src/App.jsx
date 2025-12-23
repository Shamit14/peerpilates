import React, { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { FileUploadProvider } from './contexts/FileUploadContext';
import Auth from './components/Auth';
import AuthSuccess from './components/AuthSuccess';
import AuthError from './components/AuthError';
import ExamSelection from './components/ExamSelection';
import Header from './components/header';
import Sidebar from './components/SideBar';
import ChatWindow from './components/chatWindow';
import InputBar from './components/InputBar';
import StudyTools from './components/StudyTools';

/**
 * Simple router component to handle different paths
 */
function SimpleRouter() {
  const path = window.location.pathname;
  
  if (path === '/auth-success') {
    return <AuthSuccess />;
  }
  
  if (path === '/auth-error') {
    return <AuthError />;
  }
  
  if (path === '/study-tools') {
    return <StudyToolsPage />;
  }
  
  return <AppContent />;
}

/**
 * Study Tools Page Component
 */
function StudyToolsPage() {
  const { user, isLoading, logout } = useUser();
  const [selectedExam, setSelectedExam] = useState(() => {
    const savedExam = localStorage.getItem('selectedExam');
    return savedExam ? JSON.parse(savedExam) : null;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  if (!selectedExam) {
    window.location.href = '/';
    return null;
  }

  const handleBack = () => {
    window.location.href = '/';
  };

  return <StudyTools onBack={handleBack} selectedExam={selectedExam} />;
}

/**
 * Main App Content Component (after authentication)
 */
function AppContent() {
  const { user, isLoading, login, logout } = useUser();
  const { 
    messages, 
    isLoading: isChatLoading, 
    createNewConversation, 
    addMessage,
    getCurrentConversation 
  } = useChat();
  const [activeSubject, setActiveSubject] = useState('UPSC');
  const [selectedExam, setSelectedExam] = useState(null);

  // Check for saved exam selection
  React.useEffect(() => {
    const savedExam = localStorage.getItem('selectedExam');
    if (savedExam) {
      const exam = JSON.parse(savedExam);
      setSelectedExam(exam);
      setActiveSubject(exam.name.toUpperCase());
    }
  }, []);

  // Initialize conversation when user is available and no current conversation
  React.useEffect(() => {
    if (user && !getCurrentConversation()) {
      createNewConversation(activeSubject);
    }
  }, [user, activeSubject]);

  const handleSendMessage = async (messageData) => {
    // Handle both string and object inputs
    const text = typeof messageData === 'string' ? messageData : messageData.message;
    const fileContent = typeof messageData === 'object' ? messageData.fileContent : null;
    
    // Add user message
    addMessage({ sender: 'user', text });

    try {

      // Call the backend API
      const response = await fetch('http://localhost:8000/api/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          subject: activeSubject,
          user_id: user?.id,
          file_content: fileContent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage({ 
          sender: 'ai', 
          text: data.response,
          source: data.source || 'ai'
        });
      } else {
        throw new Error('AI service unavailable');
      }
    } catch (error) {
      // Enhanced fallback responses for government exam preparation
      const examResponses = {
        'UPSC': `For UPSC preparation regarding "${text}": This requires understanding the comprehensive syllabus structure. Focus on NCERT textbooks for basics, current affairs from reliable sources, and practice previous year questions. Would you like specific guidance on any particular subject like History, Geography, Polity, or Current Affairs?`,
        'GATE': `For GATE preparation on "${text}": This is a technical topic that requires strong fundamentals. I recommend starting with standard textbooks, solving previous year questions, and taking regular mock tests. Which engineering branch are you preparing for? I can provide subject-specific guidance.`,
        'Current Affairs': `Regarding current affairs on "${text}": This is an important topic for competitive exams. I suggest following reliable news sources, making monthly compilations, and connecting current events with static topics. Would you like me to explain how this relates to your exam syllabus?`,
        'General Knowledge': `About "${text}": This falls under general knowledge which is crucial for most government exams. I recommend systematic study of facts, figures, and connecting information across different domains. Shall I provide more specific information on this topic?`
      };
      
      const aiResponse = examResponses[activeSubject] || `Regarding your ${activeSubject} question about "${text}": I'd be happy to help you with this topic. Please note that I'm currently in demo mode, but I can provide comprehensive guidance on exam strategies, syllabus coverage, and study materials.`;
      addMessage({ sender: 'ai', text: aiResponse });
    }
  };

  const handleNewConversation = () => {
    createNewConversation(activeSubject);
  };

  const handleSubjectChange = (newSubject) => {
    setActiveSubject(newSubject);
    // Create new conversation when subject changes
    createNewConversation(newSubject);
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setActiveSubject(exam.name.toUpperCase());
    localStorage.setItem('selectedExam', JSON.stringify(exam));
    createNewConversation(exam.name.toUpperCase());
  };

  const handleBackToExamSelection = () => {
    setSelectedExam(null);
    localStorage.removeItem('selectedExam');
  };

  const handleLogout = () => {
    setSelectedExam(null);
    localStorage.removeItem('selectedExam');
    logout();
  };

  const handleGenerateStudyPlan = () => {
    const examName = selectedExam?.name || 'GATE';
    const currentDate = new Date();
    
    // Calculate time until exam for personalized planning
    const examSchedules = {
      'GATE': new Date(currentDate.getFullYear() + (currentDate.getMonth() > 1 ? 1 : 0), 1, 3),
      'UPSC': new Date(currentDate.getFullYear() + (currentDate.getMonth() > 5 ? 1 : 0), 5, 16),
      'SSC': new Date(currentDate.getFullYear() + (currentDate.getMonth() > 10 ? 1 : 0), 10, 15)
    };
    
    const examDate = examSchedules[examName.toUpperCase()];
    const daysRemaining = Math.ceil((examDate - currentDate) / (1000 * 3600 * 24));
    
    const studyPlanPrompt = `📋 **Generate Comprehensive Study Plan for ${examName}**

**Current Status:**
- Days until exam: ${daysRemaining > 0 ? daysRemaining : 'Next cycle'}
- Preparation phase: ${daysRemaining > 180 ? 'Long-term' : daysRemaining > 90 ? 'Medium-term' : 'Short-term'}

**Please create a detailed study plan including:**

1. **📚 Subject-wise Breakdown**
   - Core subjects and weightage
   - Topic prioritization based on exam pattern
   - Difficulty level assessment

2. **⏱️ Time Allocation**
   - Daily study schedule
   - Weekly targets
   - Monthly milestones

3. **📖 Resource Recommendations**
   - Best books for each subject
   - Online resources and courses
   - Previous year question papers

4. **🎯 Strategy & Tips**
   - Preparation methodology
   - Revision techniques
   - Mock test schedule
   - Time management during exam

5. **📊 Progress Tracking**
   - Weekly assessment methods
   - Performance indicators
   - Adjustment strategies

Make it personalized for ${daysRemaining > 0 ? daysRemaining + ' days' : 'next exam cycle'} preparation timeline.`;
    
    handleSendMessage(studyPlanPrompt);
  };

  const handleTimeRemaining = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Define typical exam schedules
    const examSchedules = {
      'GATE': {
        dates: [
          new Date(currentYear, 1, 3),  // February 3rd
          new Date(currentYear, 1, 4),  // February 4th
          new Date(currentYear, 1, 10), // February 10th
          new Date(currentYear, 1, 11)  // February 11th
        ],
        nextYear: new Date(currentYear + 1, 1, 3)
      },
      'UPSC': {
        dates: [
          new Date(currentYear, 5, 16), // June 16th (Prelims)
          new Date(currentYear, 8, 15)  // September 15th (Mains)
        ],
        nextYear: new Date(currentYear + 1, 5, 16)
      },
      'SSC': {
        dates: [
          new Date(currentYear, 10, 15), // November 15th
          new Date(currentYear, 11, 15)  // December 15th
        ],
        nextYear: new Date(currentYear + 1, 10, 15)
      }
    };

    const examName = selectedExam?.name?.toUpperCase() || 'GATE';
    const schedule = examSchedules[examName] || examSchedules['GATE'];
    
    // Find the next upcoming exam date
    let nextExamDate = null;
    for (const date of schedule.dates) {
      if (date > currentDate) {
        nextExamDate = date;
        break;
      }
    }
    
    // If no upcoming date this year, use next year's date
    if (!nextExamDate) {
      nextExamDate = schedule.nextYear;
    }
    
    const timeDiff = nextExamDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let timeMessage;
    if (daysRemaining > 0) {
      const months = Math.floor(daysRemaining / 30);
      const days = daysRemaining % 30;
      const weeks = Math.floor(daysRemaining / 7);
      
      let timeDisplay = '';
      if (months > 0) {
        timeDisplay = `${months} months and ${days} days`;
      } else if (weeks > 0) {
        timeDisplay = `${weeks} weeks and ${daysRemaining % 7} days`;
      } else {
        timeDisplay = `${daysRemaining} days`;
      }
      
      timeMessage = `⏰ **${selectedExam?.name} Exam Countdown**\n\n` +
                   `📅 **Time Remaining**: ${timeDisplay}\n` +
                   `📍 **Next Exam Date**: ${nextExamDate.toDateString()}\n\n` +
                   `**Daily Study Recommendations:**\n` +
                   `• Study Hours: ${daysRemaining > 60 ? '4-6 hours' : daysRemaining > 30 ? '6-8 hours' : '8-10 hours'}\n` +
                   `• Revision Time: ${daysRemaining > 60 ? '1 hour' : daysRemaining > 30 ? '2 hours' : '3-4 hours'}\n` +
                   `• Mock Tests: ${daysRemaining > 60 ? '1 per week' : daysRemaining > 30 ? '2 per week' : 'Daily'}\n\n` +
                   `**Phase**: ${daysRemaining > 120 ? 'Foundation Building' : daysRemaining > 60 ? 'Intensive Preparation' : daysRemaining > 30 ? 'Final Revision' : 'Last Minute Prep'}\n\n` +
                   `Would you like a detailed study schedule for the remaining time?`;
    } else {
      timeMessage = `The ${selectedExam?.name} exam cycle has ended. The next exam is scheduled for ${nextExamDate.toDateString()}. Let me help you prepare for the next cycle with a comprehensive study plan.`;
    }
    
    handleSendMessage(timeMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={login} />;
  }

  if (!selectedExam) {
    return <ExamSelection onExamSelect={handleExamSelect} user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header 
        selectedExam={selectedExam} 
        onBackToExamSelection={handleBackToExamSelection}
      />
      <div className="flex flex-1 overflow-hidden mt-16">
        <div className="w-80 bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Ask Questions</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your {selectedExam?.name}-related question:
              </label>
            </div>
            
            {/* Exam Info Card */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">📅 Exam Information</h3>
              <div className="text-sm text-blue-800">
                <p className="mb-1">
                  <strong>{selectedExam?.name} {new Date().getFullYear()}</strong>
                </p>
                <p className="text-blue-600">
                  {selectedExam?.name === 'GATE' && 'Feb 3, 4, 10, 11'}
                  {selectedExam?.name === 'UPSC' && 'June 16 (Prelims)'}
                  {selectedExam?.name === 'SSC' && 'Nov-Dec Period'}
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">💡 Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ask specific subject questions</li>
                <li>• Upload study materials for analysis</li>
                <li>• Get personalized study plans</li>
                <li>• Check time management strategies</li>
              </ul>
            </div>

            {/* Study Tools Button */}
            <div className="mt-4">
              <button
                onClick={() => window.location.href = '/study-tools'}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>📚</span>
                <span>Open Study Tools</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Study Plan & Time Tracker</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 h-full bg-white">
          <main className="flex-1 overflow-y-auto p-6">
            <ChatWindow messages={messages} isLoading={isChatLoading} />
          </main>
          <div className="border-t border-gray-200 p-4">
            <InputBar onSendMessage={handleSendMessage} disabled={isChatLoading} />
          </div>
        </div>
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Study Tools</h3>
            <div className="space-y-4">
              {/* Link to Study Tools Page */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-black mb-2">📚 Full Study Tools</h4>
                <p className="text-sm text-gray-600 mb-3">Access comprehensive study planning and time tracking features.</p>
                <button 
                  onClick={() => window.location.href = '/study-tools'}
                  className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Open Study Tools →
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
              </div>
              <div>
                <button 
                  onClick={handleGenerateStudyPlan}
                  disabled={isChatLoading}
                  className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  📋 Quick Study Plan
                </button>
              </div>
              <div>
                <button 
                  onClick={handleTimeRemaining}
                  disabled={isChatLoading}
                  className="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  ⏰ Time Remaining
                </button>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <button 
                  onClick={() => handleSendMessage(`Explain the ${selectedExam?.name} exam pattern and syllabus structure`)}
                  disabled={isChatLoading}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-2"
                >
                  📚 Exam Pattern
                </button>
                <button 
                  onClick={() => handleSendMessage(`Provide preparation tips and strategies for ${selectedExam?.name} exam`)}
                  disabled={isChatLoading}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  💡 Preparation Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Root App Component with Authentication, Chat, and File Upload Providers
 */
export default function App() {
  return (
    <UserProvider>
      <FileUploadProvider>
        <ChatProvider>
          <SimpleRouter />
        </ChatProvider>
      </FileUploadProvider>
    </UserProvider>
  );
}
