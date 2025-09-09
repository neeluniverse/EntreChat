import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import Timer from './Timer';

const ChatRoom = ({ username }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Connect to socket server
  useEffect(() => {
    // In production, this would be your deployed backend URL
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
      auth: {
        passkey: localStorage.getItem('passkey') || 'default_passkey'
      }
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => newSocket.close();
  }, [username]);

  // Set up socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for chat messages
      socket.on('chat message', (data) => {
        setMessages(prev => [...prev, data]);
        
        // Show notification if message is from another user
        if (data.username !== username) {
          setNotification({
            username: data.username,
            message: data.message
          });
          
          // Auto hide notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        }
      });
      
      // Listen for typing indicators
      socket.on('typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(user => user !== data.username));
        }
      });
      
      // Listen for reactions
      socket.on('message reaction', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, reaction: data.reaction } 
            : msg
        ));
      });
      
      // Listen for timer events
      socket.on('timer start', () => {
        setIsTimerActive(true);
      });
    }
  }, [socket, username]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && socket) {
      socket.emit('chat message', {
        username,
        message: newMessage.trim()
      });
      
      // Stop typing indicator
      socket.emit('typing', { username, isTyping: false });
      
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      if (newMessage) {
        socket.emit('typing', { username, isTyping: true });
        
        // Set timeout to stop typing indicator after a delay
        setTimeout(() => {
          socket.emit('typing', { username, isTyping: false });
        }, 1000);
      } else {
        socket.emit('typing', { username, isTyping: false });
      }
    }
  };

  const handleReaction = (messageId, reaction) => {
    if (socket) {
      socket.emit('message reaction', {
        messageId,
        reaction
      });
    }
  };

  const formatTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers.slice(-1)} are typing...`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-400">Entrepreneur Chat</h1>
        <div className="flex items-center space-x-4">
          {isTimerActive && <Timer onComplete={() => setIsTimerActive(false)} />}
          <span className="text-gray-300">Welcome, {username}</span>
        </div>
      </header>
      
      {/* Notification */}
      {notification && (
        <div className="notification fixed top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm z-50">
          <p className="font-semibold text-green-400">{notification.username}</p>
          <p className="text-gray-200 truncate">{notification.message}</p>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-2">Try commands: /idea, /focus, /timer [minutes]</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              isOwnMessage={msg.username === username}
              onReaction={handleReaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-gray-400 text-sm italic">
          {formatTypingText()}
        </div>
      )}
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Type your message or use /commands"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
