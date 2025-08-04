import React from 'react';

function SuggestionCard({ title, content, icon, onSelect }) {
    return (
        <button 
            onClick={() => onSelect(content)}
            className="bg-gray-900 p-4 rounded-xl text-left hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700 hover:border-orange-500 group"
        >
            <div className="flex items-center mb-3">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{icon}</span>
                <h3 className="font-semibold text-white text-lg">{title}</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
            <div className="mt-3 text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to ask this question →
            </div>
        </button>
    );
}

export default SuggestionCard;