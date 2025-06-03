import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Initialize the socket connection with auth token
export const initializeSocket = (token: string): Socket => {
  if (socket) {
    return socket;
  }

  if (!token) {
    throw new Error('No authentication token available');
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  socket = io(API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

// Get the socket instance
export const getSocket = (): Socket | null => {
  return socket;
};

// Disconnect the socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Check if socket is connected
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// Send a message
export const sendMessage = (recipientId: string, messageData: any): void => {
  socket?.emit('send_message', { recipientId, ...messageData });
};

// Mark message as read
export const markMessageAsRead = (messageId: string, senderId: string): void => {
  socket?.emit('message_read', { messageId, senderId });
};

// Send typing indicator
export const sendTypingIndicator = (recipientId: string, isTyping: boolean): void => {
  socket?.emit('typing', { recipientId, isTyping });
};

// Helper function to create a room ID from two user IDs (sorted to ensure consistency)
export const createChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

// Join a chat room
export const joinChatRoom = (roomId: string): void => {
  socket?.emit('join_room', roomId);
};

// Leave a chat room
export const leaveChatRoom = (roomId: string): void => {
  socket?.emit('leave_room', roomId);
};
