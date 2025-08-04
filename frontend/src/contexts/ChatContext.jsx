import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedConversations = localStorage.getItem(`conversations_${user.id}`);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        
        // Load the most recent conversation
        if (parsed.length > 0) {
          const mostRecent = parsed[parsed.length - 1];
          setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages || []);
        }
      }
    }
  }, [user]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const createNewConversation = (subject = 'UPSC') => {
    if (!user) return;

    const newConversation = {
      id: Date.now().toString(),
      title: `New ${subject} Chat`,
      subject: subject,
      messages: [{
        sender: 'ai',
        text: `Hello ${user.name}! I'm your ${subject} preparation assistant. Ask me anything about ${subject} syllabus, strategies, previous year questions, or any topic you'd like to study!`,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
    setMessages(newConversation.messages);

    return newConversation.id;
  };

  const addMessage = (message) => {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    // Update the conversation
    if (currentConversationId) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          
          // Update title if it's the first user message
          let newTitle = conv.title;
          if (message.sender === 'user' && conv.messages.length === 1) {
            newTitle = message.text.length > 50 
              ? message.text.substring(0, 50) + '...' 
              : message.text;
          }

          return {
            ...conv,
            messages: updatedMessages,
            title: newTitle,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      }));
    }
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      // Switch to most recent remaining conversation or create new one
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      if (remaining.length > 0) {
        const mostRecent = remaining[remaining.length - 1];
        setCurrentConversationId(mostRecent.id);
        setMessages(mostRecent.messages);
      } else {
        createNewConversation();
      }
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId);
  };

  const value = {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    setIsLoading,
    createNewConversation,
    addMessage,
    loadConversation,
    deleteConversation,
    getCurrentConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
