import React, { useState } from 'react';

const Message = ({ message, isOwnMessage, onReaction }) => {
  const [showReactions, setShowReactions] = useState(false);
  
  const handleReaction = (reaction) => {
    onReaction(message.id, reaction);
    setShowReactions(false);
  };
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 message-transition ${
          isOwnMessage 
            ? 'bg-green-700 text-white' 
            : 'bg-gray-700 text-gray-200'
        }`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {!isOwnMessage && (
          <div className="font-semibold text-green-400 text-sm">
            {message.username}
          </div>
        )}
        
        <div className="text-sm mt-1">{message.message}</div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-400">
            {message.timestamp}
          </div>
          
          {message.reaction && (
            <div className="text-sm">
              {message.reaction}
            </div>
          )}
        </div>
        
        {showReactions && (
          <div className="absolute -top-8 left-0 bg-gray-800 rounded-full p-1 shadow-lg flex space-x-1">
            {['👍', '❤️', '🚀', '👎', '😂'].map((emoji) => (
              <button
                key={emoji}
                className="w-6 h-6 rounded-full hover:bg-gray-700 flex items-center justify-center"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
