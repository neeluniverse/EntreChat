const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load data from JSON files
let startupIdeas = [];
let motivationalQuotes = [];
let validPasskeys = [];

async function loadData() {
  try {
    startupIdeas = JSON.parse(await fs.readFile('./data/ideas.json', 'utf8'));
    motivationalQuotes = JSON.parse(await fs.readFile('./data/quotes.json', 'utf8'));
    const passkeysData = JSON.parse(await fs.readFile('./data/passkeys.json', 'utf8'));
    validPasskeys = passkeysData.passkeys;
    console.log('Data loaded successfully');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Authentication middleware for socket connections
function authenticate(socket, next) {
  const passkey = socket.handshake.auth.passkey;
  if (validPasskeys.includes(passkey)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
}

io.use(authenticate);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle chat messages
  socket.on('chat message', (data) => {
    // Check for commands
    if (data.message.startsWith('/')) {
      handleCommand(socket, data.message);
    } else {
      // Broadcast regular message to all clients
      io.emit('chat message', {
        id: Date.now(),
        username: data.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {
      username: data.username,
      isTyping: data.isTyping
    });
  });
  
  // Handle reactions
  socket.on('message reaction', (data) => {
    io.emit('message reaction', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('user left', { username: socket.username });
  });
});

// Command handling
function handleCommand(socket, command) {
  const commandParts = command.split(' ');
  const mainCommand = commandParts[0].toLowerCase();
  
  switch(mainCommand) {
    case '/idea':
      const randomIdea = startupIdeas[Math.floor(Math.random() * startupIdeas.length)];
      socket.emit('chat message', {
        id: Date.now(),
        username: 'System',
        message: `💡 Startup Idea: ${randomIdea}`,
        timestamp: new Date().toLocaleTimeString()
      });
      break;
      
    case '/focus':
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      socket.emit('chat message', {
        id: Date.now(),
        username: 'System',
        message: `✨ Motivational Quote: ${randomQuote}`,
        timestamp: new Date().toLocaleTimeString()
      });
      break;
      
    case '/timer':
      const duration = commandParts[1] || 25; // Default to 25 minutes
      if (isNaN(duration) || duration <= 0) {
        socket.emit('chat message', {
          id: Date.now(),
          username: 'System',
          message: '⚠️ Please provide a valid duration in minutes for the timer (e.g., /timer 25)',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const minutes = parseInt(duration);
        socket.emit('timer start', { minutes });
        
        // Notify all users about the timer
        io.emit('chat message', {
          id: Date.now(),
          username: 'System',
          message: `⏰ ${socket.username} started a Pomodoro timer for ${minutes} minutes`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      break;
      
    default:
      socket.emit('chat message', {
        id: Date.now(),
        username: 'System',
        message: '❌ Unknown command. Available commands: /idea, /focus, /timer [minutes]',
        timestamp: new Date().toLocaleTimeString()
      });
  }
}

// Load data and start server
loadData().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
