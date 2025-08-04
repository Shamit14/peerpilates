import React, { useRef, useEffect } from 'react';
import Message from './Message';
import SuggestionCard from './SuggestionCard';
import { useChat } from '../contexts/ChatContext';

function ChatWindow({ messages, isLoading }) {
  const endOfMessagesRef = useRef(null);
  const { addMessage, getCurrentConversation } = useChat();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentConversation = getCurrentConversation();
  const currentSubject = currentConversation?.subject || 'UPSC';

  // Government exam specific suggestions based on current subject
  const getSubjectSuggestions = (subject) => {
    const suggestions = {
      'UPSC': [
        { 
          title: "UPSC Syllabus", 
          content: "What are the key topics I should focus on for UPSC Prelims and Mains?", 
          icon: "📚" 
        },
        { 
          title: "Current Affairs", 
          content: "How should I prepare current affairs for UPSC? Which sources are best?", 
          icon: "📰" 
        },
        { 
          title: "Study Strategy", 
          content: "What's an effective 12-month study plan for UPSC preparation?", 
          icon: "⏰" 
        },
      ],
      'GATE': [
        { 
          title: "GATE Preparation", 
          content: "What's the best strategy to score above 700 in GATE?", 
          icon: "⚙️" 
        },
        { 
          title: "Mock Tests", 
          content: "How many mock tests should I take and when to start?", 
          icon: "📝" 
        },
        { 
          title: "Previous Years", 
          content: "How to effectively solve GATE previous year questions?", 
          icon: "📊" 
        },
      ],
      'SSC': [
        { 
          title: "SSC CGL", 
          content: "What's the complete preparation strategy for SSC CGL?", 
          icon: "📋" 
        },
        { 
          title: "Quantitative Aptitude", 
          content: "How to improve speed and accuracy in Quant for SSC?", 
          icon: "🔢" 
        },
        { 
          title: "English", 
          content: "What are the important English topics for SSC exams?", 
          icon: "🔤" 
        },
      ],
      'Banking': [
        { 
          title: "Bank PO", 
          content: "What's the difference between Bank PO and Bank Clerk preparation?", 
          icon: "🏦" 
        },
        { 
          title: "Banking Awareness", 
          content: "How to prepare Banking Awareness for bank exams?", 
          icon: "💳" 
        },
        { 
          title: "Reasoning", 
          content: "What are the important reasoning topics for banking exams?", 
          icon: "🧠" 
        },
      ],
      'Railways': [
        { 
          title: "RRB NTPC", 
          content: "What's the complete syllabus and strategy for RRB NTPC?", 
          icon: "🚂" 
        },
        { 
          title: "Technical Posts", 
          content: "How to prepare for technical posts in Indian Railways?", 
          icon: "🔧" 
        },
        { 
          title: "General Science", 
          content: "Important General Science topics for Railway exams?", 
          icon: "🧪" 
        },
      ],
      'Current Affairs': [
        { 
          title: "Monthly Updates", 
          content: "What are the important current affairs from last month?", 
          icon: "📅" 
        },
        { 
          title: "Government Schemes", 
          content: "What are the latest government schemes I should know?", 
          icon: "🏛️" 
        },
        { 
          title: "International Affairs", 
          content: "Important international events for competitive exams?", 
          icon: "🌍" 
        },
      ],
    };
    
    return suggestions[subject] || suggestions['UPSC'];
  };

  const handleSuggestionClick = (content) => {
    addMessage({ sender: 'user', text: content });
  };

  const suggestions = getSubjectSuggestions(currentSubject);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6">
      {messages.length === 1 && messages[0].sender === 'ai' ? (
        <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-xl text-gray-300 mb-4">
                Ready to ace your <span className="text-orange-500 font-semibold">{currentSubject}</span> exam?
              </h2>
              <p className="text-gray-400">
                I can help you with syllabus guidance, study strategies, current affairs, and practice questions.
              </p>
            </div>
            
            {/* Subject-specific suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {suggestions.map((s, i) => 
                  <SuggestionCard 
                    key={i} 
                    {...s} 
                    onSelect={handleSuggestionClick}
                  />
                )}
            </div>
            
            {/* Pro Tip Card */}
            <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded-xl p-6 border border-orange-500/30">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-orange-600 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold text-lg">💡 Pro Tip for {currentSubject}</h3>
                  <p className="text-gray-300 mt-2 leading-relaxed">
                    {currentSubject === 'UPSC' && "Start with NCERT books for building strong fundamentals, then move to advanced books. Practice answer writing daily and stay updated with current affairs."}
                    {currentSubject === 'GATE' && "Focus on conceptual clarity over rote learning. Solve previous year questions topic-wise and take regular mock tests to improve time management."}
                    {currentSubject === 'SSC' && "Speed and accuracy are key. Practice time-bound tests regularly and focus on shortcuts for quantitative aptitude."}
                    {currentSubject === 'Banking' && "Banking awareness and current affairs are crucial. Practice sectional tests and focus on your weak areas."}
                    {currentSubject === 'Railways' && "General awareness and reasoning carry significant weight. Make comprehensive notes for quick revision."}
                    {currentSubject === 'Current Affairs' && "Read newspaper daily, make monthly compilations, and connect current events with static topics."}
                  </p>
                  <p className="text-orange-400 text-sm mt-3">
                    Ask me specific questions to get personalized guidance! →
                  </p>
                </div>
              </div>
            </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <Message key={index} sender={msg.sender} text={msg.text} />
          ))}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-3 text-gray-400 max-w-4xl mx-auto">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <span>Analyzing your question...</span>
        </div>
      )}
      
      <div ref={endOfMessagesRef} />
    </div>
  );
}

export default ChatWindow;