import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useFileUpload } from '../contexts/FileUploadContext';

const SendIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
);

const AttachIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
    </svg>
);

const MicIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
    </svg>
);

const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

function InputBar({ onSendMessage, disabled = false }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { getCurrentConversation } = useChat();
  const { uploadedFiles, isUploading, uploadFile, removeFile } = useFileUpload();

  const currentConversation = getCurrentConversation();
  const currentSubject = currentConversation?.subject || 'UPSC';

  useEffect(() => {
      const el = textareaRef.current;
      if (el) {
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
      }
  }, [text]);

  const handleSend = (e) => {
      if (e) e.preventDefault();
      if (text.trim() && !disabled) {
          let messageText = text.trim();
          
          // Include file context if files are uploaded
          if (uploadedFiles.length > 0) {
              const fileContext = uploadedFiles.map(file => 
                  `[File: ${file.name} - ${file.content}]`
              ).join('\n');
              messageText = `${messageText}\n\nFiles uploaded:\n${fileContext}`;
          }
          
          onSendMessage(messageText);
          setText('');
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const handleFileUpload = async (e) => {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
          try {
              await uploadFile(file);
          } catch (error) {
              console.error('File upload failed:', error);
              // You could show a toast notification here
          }
      }
      
      // Clear the file input
      e.target.value = '';
  };

  const handleDragOver = (e) => {
      e.preventDefault();
  };

  const handleDrop = async (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      
      for (const file of files) {
          try {
              await uploadFile(file);
          } catch (error) {
              console.error('File drop failed:', error);
          }
      }
  };

  // Quick prompt suggestions based on current subject
  const quickPrompts = {
    'UPSC': [
      "Explain the syllabus for",
      "What's the best strategy for", 
      "Previous year questions on",
      "Current affairs related to"
    ],
    'GATE': [
      "Solve this problem:",
      "Explain the concept of",
      "Best books for",
      "Mock test strategy for"
    ],
    'SSC': [
      "Quick tricks for",
      "Practice questions on",
      "Time management for",
      "Important formulas for"
    ],
    'Banking': [
      "Banking awareness on",
      "Reasoning question:",
      "Quantitative aptitude:",
      "Current banking news:"
    ],
    'Railways': [
      "Railway exam pattern for",
      "General awareness on",
      "Technical question:",
      "Previous year analysis:"
    ],
    'Current Affairs': [
      "Latest updates on",
      "Government scheme:",
      "International news:",
      "Economic survey points:"
    ]
  };

  const currentPrompts = quickPrompts[currentSubject] || quickPrompts['UPSC'];
  const placeholder = disabled 
    ? "AI is analyzing your question..." 
    : `Ask me about ${currentSubject} syllabus, strategies, current affairs, or any specific topic...`;

  return (
    <div className="border-t border-gray-800 bg-black">
      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <AttachIcon />
              <span className="text-gray-400 text-sm">Uploaded Files:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700"
                >
                  <span className="text-lg">{file.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-b border-gray-800/50">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto overflow-x-auto">
          <div className="flex items-center space-x-1 text-gray-400 text-sm whitespace-nowrap">
            <BookIcon />
            <span>Quick prompts:</span>
          </div>
          {currentPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setText(prompt + " ")}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Area */}
      <div 
        className="p-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <form onSubmit={handleSend} className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-700 focus-within:border-orange-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isUploading 
                  ? "Uploading files..." 
                  : disabled 
                    ? "AI is analyzing your question..." 
                    : `Ask me about ${currentSubject} syllabus, strategies, or upload notes/PDFs...`
              }
              className="w-full bg-transparent border-none resize-none px-4 py-3 text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 min-h-[48px] max-h-[120px] rounded-2xl"
              disabled={disabled || isUploading}
              rows="1"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-3 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Upload files"
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              ) : (
                <AttachIcon />
              )}
            </button>
            
            <button
              type="button"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-3 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Voice input"
              disabled={disabled}
            >
              <MicIcon />
            </button>
            
            <button
              type="submit"
              disabled={!text.trim() || disabled || isUploading}
              className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </form>
        
        {/* Footer Info */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            AI can make mistakes. Please verify important information for your {currentSubject} preparation.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Drag & drop files or click attach button to upload notes, PDFs, or images
          </p>
        </div>
      </div>
    </div>
  );
}

export default InputBar;