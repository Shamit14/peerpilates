import React, { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { FileUploadProvider } from './contexts/FileUploadContext';
import Auth from './components/Auth';
import AuthSuccess from './components/AuthSuccess';
import AuthError from './components/AuthError';
import Header from './components/Header';
import Sidebar from './components/SideBar';
import ChatWindow from './components/chatWindow';
import InputBar from './components/InputBar';

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
  
  return <AppContent />;
}

/**
 * Main App Content Component (after authentication)
 */
function AppContent() {
  const { user, isLoading, login } = useUser();
  const { 
    messages, 
    isLoading: isChatLoading, 
    createNewConversation, 
    addMessage,
    getCurrentConversation 
  } = useChat();
  const [activeSubject, setActiveSubject] = useState('UPSC');

  // Initialize conversation when user is available and no current conversation
  React.useEffect(() => {
    if (user && !getCurrentConversation()) {
      createNewConversation(activeSubject);
    }
  }, [user, activeSubject]);

  const handleSendMessage = async (text) => {
    // Add user message
    addMessage({ sender: 'user', text });

    try {
      // Extract file content from the message if it exists
      let actualMessage = text;
      let fileContent = null;
      
      // Check if message contains file upload context
      const fileMarker = 'Files uploaded:';
      if (text.includes(fileMarker)) {
        const parts = text.split(fileMarker);
        actualMessage = parts[0].trim();
        
        // Extract file content from the uploaded files section
        if (parts[1]) {
          const fileLines = parts[1].trim().split('\n');
          const fileContents = [];
          
          for (const line of fileLines) {
            const match = line.match(/\[File: (.+?) - (.+?)\]/);
            if (match) {
              fileContents.push(match[2]); // Extract the content part
            }
          }
          
          if (fileContents.length > 0) {
            fileContent = fileContents.join('\n\n');
          }
        }
      }

      // Call the backend API
      const response = await fetch('http://localhost:8000/api/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: actualMessage,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={login} />;
  }

  return (
    <div className="flex flex-col h-screen bg-black font-sans pt-20">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSubject={activeSubject} 
          setActiveSubject={handleSubjectChange}
          onNewConversation={handleNewConversation}
        />
        <div className="flex flex-col flex-1 h-full">
          <main className="flex-1 overflow-y-auto">
            <div className="pt-6 pb-4 text-center">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-orange-500">{activeSubject}</span> Preparation Assistant
              </h1>
              <p className="text-gray-400 mt-2">Ask me anything about syllabus, strategies, or specific topics</p>
            </div>
            <ChatWindow messages={messages} isLoading={isChatLoading} />
          </main>
          <InputBar onSendMessage={handleSendMessage} disabled={isChatLoading} />
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
