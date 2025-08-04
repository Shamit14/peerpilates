import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

// Icons
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
    </svg>
);

const HomeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
);

const HistoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
);

const ChatIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
    </svg>
);

function Sidebar({ activeSubject, setActiveSubject, onNewConversation }) {
    const [showHistory, setShowHistory] = useState(false);
    const { conversations, currentConversationId, loadConversation, deleteConversation } = useChat();
    
    const subjects = [
        { name: 'UPSC', icon: '🏛️', description: 'Civil Services Exam' },
        { name: 'GATE', icon: '⚙️', description: 'Engineering Entrance' },
        { name: 'SSC', icon: '📋', description: 'Staff Selection Commission' },
        { name: 'Banking', icon: '🏦', description: 'Bank PO/Clerk' },
        { name: 'Railways', icon: '🚂', description: 'Railway Recruitment' },
        { name: 'Current Affairs', icon: '📰', description: 'Latest Updates' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return 'Today';
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleDeleteConversation = (e, conversationId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            deleteConversation(conversationId);
        }
    };

    return (
        <div className="w-64 bg-black h-full flex flex-col border-r border-gray-800 pt-4">
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <div className="text-white font-bold text-xl flex items-center space-x-2">
                    <BookIcon />
                    <span>ExamPrep AI</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Your Gov Exam Assistant</p>
            </div>
            
            {/* New Chat Button */}
            <div className="p-4">
                <button 
                    onClick={onNewConversation}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors"
                >
                    <PlusIcon />
                    <span>New Chat</span>
                </button>
            </div>
            
            {/* Navigation Toggle */}
            <div className="px-4 pb-2">
                <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setShowHistory(false)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm transition-colors ${
                            !showHistory
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <HomeIcon />
                        <span>Subjects</span>
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm transition-colors ${
                            showHistory
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <HistoryIcon />
                        <span>History</span>
                    </button>
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {!showHistory ? (
                    /* Subject Selection */
                    <div className="p-4">
                        <h3 className="text-gray-400 text-sm font-medium mb-3">Choose Your Exam</h3>
                        <div className="space-y-2">
                            {subjects.map((subject) => (
                                <button
                                    key={subject.name}
                                    onClick={() => setActiveSubject(subject.name)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 border ${
                                        activeSubject === subject.name
                                            ? 'bg-orange-600 text-white border-orange-500'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{subject.icon}</span>
                                        <div>
                                            <div className="font-medium">{subject.name}</div>
                                            <div className="text-xs text-gray-400">{subject.description}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat History */
                    <div className="p-4">
                        <h3 className="text-gray-400 text-sm font-medium mb-3">Recent Chats</h3>
                        <div className="space-y-2">
                            {conversations.length === 0 ? (
                                <div className="text-gray-500 text-sm text-center py-8">
                                    No conversations yet.<br/>
                                    Start a new chat to begin!
                                </div>
                            ) : (
                                conversations
                                    .slice()
                                    .reverse()
                                    .map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => loadConversation(conversation.id)}
                                            className={`group cursor-pointer p-3 rounded-lg transition-colors border ${
                                                currentConversationId === conversation.id
                                                    ? 'bg-orange-600 text-white border-orange-500'
                                                    : 'text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <ChatIcon />
                                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                                            {conversation.subject}
                                                        </span>
                                                    </div>
                                                    <div className="font-medium text-sm truncate">
                                                        {conversation.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {formatDate(conversation.updatedAt)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity p-1"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                <div className="text-center space-y-2">
                    <div className="font-medium text-gray-400">Govt Exam Prep Made Easy</div>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="hover:text-gray-300">Help</a>
                        <a href="#" className="hover:text-gray-300">About</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;