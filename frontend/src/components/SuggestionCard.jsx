import React from 'react';

function SuggestionCard({ title, content, icon, onSelect }) {
    return (
        <button 
            onClick={() => onSelect(`I have a question about ${title}: ${content}`)}
            className="bg-gray-100 p-4 rounded-lg text-left hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300"
        >
            <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{icon}</span>
                <h3 className="font-semibold text-black">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">{content}</p>
        </button>
    );
}

export default SuggestionCard;