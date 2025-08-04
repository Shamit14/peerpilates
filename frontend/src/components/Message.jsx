import React from 'react';

/**
 * Message Component
 * Renders a single chat bubble with enhanced styling for government exam content.
 */
function Message({ sender, text }) {
  const isUser = sender === 'user';
  
  // AI Avatar Icon
  const AIAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
      </svg>
    </div>
  );

  // User Avatar Icon  
  const UserAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
    </div>
  );

  // Format text with basic markdown-like support
  const formatText = (text) => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`${isUser ? 'ml-3' : 'mr-3'} mt-1`}>
          {isUser ? <UserAvatar /> : <AIAvatar />}
        </div>
        
        {/* Message Content */}
        <div className={`rounded-xl px-4 py-3 shadow-lg ${
          isUser 
            ? 'bg-orange-600 text-white' 
            : 'bg-gray-900 text-gray-100 border border-gray-700'
        }`}>
          <div 
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(text) }}
          />
          
          {/* Message timestamp */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-orange-200' : 'text-gray-500'
          }`}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;