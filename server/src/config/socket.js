import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

// Track connected users and typing status
const connectedUsers = new Map();
const typingUsers = new Map();

// Initialize Socket.io with the server
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', process.env.CLIENT_URL],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Set the user in the socket object
      socket.user = {
        id: user._id,
        name: user.displayName,
        photo: user.photoURL
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);
    
    // Store user in connected users map
    connectedUsers.set(socket.user.id.toString(), socket);
    
    // Add user to their own room for private notifications
    socket.join(`user_${socket.user.id}`);
    
    // Handle user going online
    socket.broadcast.emit('user_online', {
      userId: socket.user.id,
      isOnline: true
    });
    
    // Handle new message (real-time delivery)
    socket.on('send_message', async (messageData) => {
      try {
        const { recipientId, groupId, messageId, chatType = 'private' } = messageData;
        
        if (chatType === 'private' && recipientId) {
          // Private message to a single recipient
          
          // Track if recipient is online for delivery status
          const isRecipientOnline = connectedUsers.has(recipientId.toString());
          
          // Emit to recipient if they're online
          io.to(`user_${recipientId}`).emit('new_message', {
            ...messageData,
            senderId: socket.user.id
          });
          
          // Mark as delivered if recipient is online
          if (isRecipientOnline && messageId) {
            // Auto-mark as delivered if recipient is online
            const Message = (await import('../models/Message.js')).default;
            await Message.findByIdAndUpdate(messageId, {
              isDelivered: true,
              deliveredAt: new Date()
            });
            
            // Notify sender of delivery
            socket.emit('message_delivered', {
              messageId,
              deliveredTo: recipientId,
              deliveredAt: new Date()
            });
          }
          
          // Clear typing indicator when message is sent
          const typingKey = `${socket.user.id}_${recipientId}`;
          if (typingUsers.has(typingKey)) {
            clearTimeout(typingUsers.get(typingKey));
            typingUsers.delete(typingKey);
            io.to(`user_${recipientId}`).emit('typing_status', { 
              userId: socket.user.id, 
              isTyping: false 
            });
          }
        } 
        else if (chatType === 'group' && groupId) {
          // Group message
          
          // Get group details
          const Group = (await import('../models/Group.js')).default;
          const group = await Group.findById(groupId).populate('members.user', '_id');
          
          if (!group) {
            socket.emit('error', { message: 'Group not found' });
            return;
          }
          
          // Check if user is a member of the group
          if (!group.isMember(socket.user.id)) {
            socket.emit('error', { message: 'You are not a member of this group' });
            return;
          }
          
          // Get list of members to notify (excluding sender)
          const membersToNotify = group.members
            .filter(member => member.user._id.toString() !== socket.user.id)
            .map(member => member.user._id.toString());
          
          // Emit to all group members (using their individual rooms)
          membersToNotify.forEach(memberId => {
            io.to(`user_${memberId}`).emit('new_group_message', {
              ...messageData,
              senderId: socket.user.id,
              senderName: socket.user.name,
              groupId: group._id,
              groupName: group.name
            });
          });
          
          // Track delivery status for online members
          if (messageId) {
            const onlineMembers = membersToNotify.filter(memberId => 
              connectedUsers.has(memberId)
            );
            
            if (onlineMembers.length > 0) {
              // Notify sender of which members received the message
              socket.emit('group_message_delivered', {
                messageId,
                groupId: group._id,
                deliveredTo: onlineMembers,
                deliveredAt: new Date()
              });
            }
          }
        }
      } catch (error) {
        console.error('Error handling message in socket:', error);
        socket.emit('error', { message: 'Error delivering message' });
      }
    });
    
    // Handle message delivery receipt
    socket.on('message_delivered', async ({ messageId, senderId }) => {
      try {
        // Notify sender about delivery
        io.to(`user_${senderId}`).emit('message_delivered', { 
          messageId, 
          deliveredTo: socket.user.id,
          deliveredAt: new Date() 
        });
        
        // Update message in database (optional, can be done via API call too)
        const Message = (await import('../models/Message.js')).default;
        await Message.findByIdAndUpdate(messageId, {
          isDelivered: true,
          deliveredAt: new Date()
        });
      } catch (error) {
        console.error('Error handling message delivery:', error);
      }
    });
    
    // Handle read receipt
    socket.on('message_read', ({ messageId, senderId }) => {
      io.to(`user_${senderId}`).emit('message_read', { 
        messageId, 
        readBy: socket.user.id,
        readAt: new Date() 
      });
    });
    
    // Handle typing indicator
    socket.on('typing', ({ recipientId, isTyping }) => {
      const typingKey = `${socket.user.id}_${recipientId}`;
      
      if (isTyping) {
        // Emit typing status to recipient
        io.to(`user_${recipientId}`).emit('typing_status', { 
          userId: socket.user.id, 
          isTyping: true 
        });
        
        // Clear previous timeout if exists
        if (typingUsers.has(typingKey)) {
          clearTimeout(typingUsers.get(typingKey));
        }
        
        // Set timeout to automatically clear typing status after 3 seconds
        const timeout = setTimeout(() => {
          io.to(`user_${recipientId}`).emit('typing_status', { 
            userId: socket.user.id, 
            isTyping: false 
          });
          typingUsers.delete(typingKey);
        }, 3000);
        
        typingUsers.set(typingKey, timeout);
      } else {
        // Clear typing status immediately
        io.to(`user_${recipientId}`).emit('typing_status', { 
          userId: socket.user.id, 
          isTyping: false 
        });
        
        if (typingUsers.has(typingKey)) {
          clearTimeout(typingUsers.get(typingKey));
          typingUsers.delete(typingKey);
        }
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user.id.toString());
      
      // Notify others this user is offline
      socket.broadcast.emit('user_online', {
        userId: socket.user.id,
        isOnline: false
      });
      
      // Clear any typing indicators from this user
      for (const [key, timeout] of typingUsers.entries()) {
        if (key.startsWith(`${socket.user.id}_`)) {
          clearTimeout(timeout);
          typingUsers.delete(key);
          
          const recipientId = key.split('_')[1];
          io.to(`user_${recipientId}`).emit('typing_status', { 
            userId: socket.user.id, 
            isTyping: false 
          });
        }
      }
    });
    
    // Join a chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.id} joined room: ${roomId}`);
    });
    
    // Leave a chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.id} left room: ${roomId}`);
    });
    
    // Update availability status
    socket.on('update_availability', async (data) => {
      try {
        const { isAvailable, reason, duration } = data;
        
        // Update user in database
        await User.findByIdAndUpdate(
          socket.user.id,
          {
            $set: {
              'hangout.isAvailable': isAvailable,
              'hangout.reason': reason || '',
              'hangout.duration': duration || '',
              'hangout.lastActiveAt': new Date()
            }
          }
        );
        
        // Broadcast to all users
        socket.broadcast.emit('user_availability_update', {
          userId: socket.user.id,
          isAvailable,
          reason,
          duration
        });
        
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    });
  });

  return io;
};

// Utility functions

// Get the io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Check if a user is online
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};

// Get all online users
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};
