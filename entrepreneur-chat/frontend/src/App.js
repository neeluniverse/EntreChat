import React, { useState } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  return (
    <div className="App min-h-screen bg-gray-900 text-white">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom username={username} />
      )}
    </div>
  );
}

export default App;
