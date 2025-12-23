import React, { useRef, useEffect } from 'react';
import Message from './Message';
import SuggestionCard from './SuggestionCard';

function ChatWindow({ messages, onSendMessage }) {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
      { title: "Math", content: "Math_EquationGraph_Question.png", icon: "📊" },
      { title: "Psychology", content: "Psychology_Basics.png", icon: "🧠" },
      { title: "English", content: "Choose the correct form of the verb to complete the sentence", icon: "🔤" },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-5">
      {messages.length === 1 ? (
        <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {suggestions.map((s, i) => <SuggestionCard key={i} {...s} onSelect={onSendMessage} />)}
            </div>
            
            <div className="mt-8 bg-gray-100 rounded-lg p-4 border border-gray-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-200 rounded-lg p-2">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-black font-medium">Click this question!</h3>
                  <p className="text-gray-600 text-sm mt-1">I'll show you the study strategy and solution for this problem!</p>
                </div>
                <button className="ml-auto text-gray-500 hover:text-black">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
        </div>
      ) : (
        messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

export default ChatWindow;