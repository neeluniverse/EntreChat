import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [passkey, setPasskey] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !passkey.trim()) {
      setError('Please enter both username and passkey');
      return;
    }
    
    // In a real application, we would verify with the server
    // For now, we'll assume authentication happens when connecting to socket
    onLogin(username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-400">
          Entrepreneur Chat
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Private network for entrepreneurs and team members
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="passkey" className="block text-gray-300 mb-2">
              Passkey
            </label>
            <input
              type="password"
              id="passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your passkey"
            />
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-900 text-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Enter Chat
          </button>
        </form>
        
        <p className="text-gray-500 text-sm mt-6 text-center">
          You need an invitation passkey to access this chat
        </p>
      </div>
    </div>
  );
};

export default Login;
