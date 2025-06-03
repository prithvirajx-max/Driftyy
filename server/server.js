import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import connectDB from './src/config/database.js';
import './src/config/passport.js';
import authRoutes from './src/routes/authRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import hangoutRoutes from './src/routes/hangoutRoutes.js';
import groupRoutes from './src/routes/groupRoutes.js';
import { initializeSocket } from './src/config/socket.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001; // Use 3001 to avoid conflicts

// Initialize Socket.io
initializeSocket(server);

// Connect to MongoDB (async)
(async () => {
  const dbConnected = await connectDB();
  console.log(`Server starting with database connected: ${dbConnected}`);
})();

// Middleware
// More permissive CORS during development
app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL], // Explicitly allow frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: `Dating App API running on port ${PORT}`,
    endpoints: [
      '/api/auth/google', 
      '/api/auth/facebook', 
      '/api/auth/me', 
      '/api/auth/users',
      '/api/profile',
      '/api/messages'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hangouts', hangoutRoutes);
app.use('/api/groups', groupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server with error handling
const startServer = (port) => {
  // Ensure port is a number and is within valid range (1-65535)
  port = parseInt(port, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`❌ Invalid port number: ${port}. Using default port 3001`);
    port = 3001;
  }
  
  return server.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`✅ OAuth callback URLs:`);
    console.log(`  Google: http://localhost:${port}/api/auth/google/callback`);
    console.log(`  Facebook: http://localhost:${port}/api/auth/facebook/callback`);
    console.log(`✅ API Endpoints:`);
    console.log(`  Messages: http://localhost:${port}/api/messages`);
    console.log(`  Notifications: http://localhost:${port}/api/notifications`);
    console.log(`  Hangouts: http://localhost:${port}/api/hangouts`);
    console.log(`✅ WebSocket server running on same port`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      // Try alternate port (PORT + 1), but don't increment beyond 9999
      const alternatePort = port < 9999 ? port + 1 : 3001;
      console.log(`Trying alternate port ${alternatePort}...`);
      startServer(alternatePort);
    } else {
      console.error('❌ Server failed:', err.message);
    }
  });
};

// Start the server
startServer(PORT);
