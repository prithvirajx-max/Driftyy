const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Connected users map: userId -> socket
const connectedUsers = new Map();
// Typing status map: userId_recipientId -> timeout
const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: Token missing'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) return next(new Error('Authentication error: User not found'));
      
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Store user connection
    connectedUsers.set(socket.user._id.toString(), socket);
    
    // Broadcast user online status
    io.emit('user_status', { userId: socket.user._id, status: 'online' });
    
    // Join personal room for direct messages
    socket.join(socket.user._id.toString());
    
    // Handle new message
    socket.on('send_message', (messageData) => {
      const recipientId = messageData.recipientId;
      const senderId = socket.user._id.toString();
      
      // Store message in DB handled by the REST API
      // Here we just emit the real-time notification
      
      // Send to recipient if online
      if (connectedUsers.has(recipientId)) {
        socket.to(recipientId).emit('new_message', {
          ...messageData,
          senderId
        });
      }
      
      // Clear typing indicator when message is sent
      const typingKey = `${senderId}_${recipientId}`;
      if (typingUsers.has(typingKey)) {
        clearTimeout(typingUsers.get(typingKey));
        typingUsers.delete(typingKey);
        socket.to(recipientId).emit('typing_status', { userId: senderId, isTyping: false });
      }
    });
    
    // Handle read receipts
    socket.on('message_read', ({ messageId, senderId }) => {
      if (connectedUsers.has(senderId)) {
        socket.to(senderId).emit('message_read', { messageId, readBy: socket.user._id });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', ({ recipientId, isTyping }) => {
      const senderId = socket.user._id.toString();
      const typingKey = `${senderId}_${recipientId}`;
      
      if (isTyping) {
        // Set typing status
        socket.to(recipientId).emit('typing_status', { userId: senderId, isTyping: true });
        
        // Clear previous timeout if exists
        if (typingUsers.has(typingKey)) {
          clearTimeout(typingUsers.get(typingKey));
        }
        
        // Set timeout to automatically clear typing status after 3 seconds
        const timeout = setTimeout(() => {
          socket.to(recipientId).emit('typing_status', { userId: senderId, isTyping: false });
          typingUsers.delete(typingKey);
        }, 3000);
        
        typingUsers.set(typingKey, timeout);
      } else {
        // Clear typing status
        socket.to(recipientId).emit('typing_status', { userId: senderId, isTyping: false });
        
        if (typingUsers.has(typingKey)) {
          clearTimeout(typingUsers.get(typingKey));
          typingUsers.delete(typingKey);
        }
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.user._id.toString());
      
      // Broadcast user offline status
      io.emit('user_status', { userId: socket.user._id, status: 'offline' });
      
      // Clear any typing indicators
      for (const [key, timeout] of typingUsers.entries()) {
        if (key.startsWith(`${socket.user._id}_`)) {
          clearTimeout(timeout);
          typingUsers.delete(key);
          
          const recipientId = key.split('_')[1];
          socket.to(recipientId).emit('typing_status', { 
            userId: socket.user._id.toString(), 
            isTyping: false 
          });
        }
      }
    });
  });

  return io;
};

// Utility functions
const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};

const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

module.exports = {
  initializeSocket,
  isUserOnline,
  getOnlineUsers
};
