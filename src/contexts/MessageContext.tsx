import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as socketService from '../services/socketService';

interface MessageContextType {
  isConnected: boolean;
  sendMessage: (recipientId: string, message: any) => void;
  markAsRead: (messageId: string, senderId: string) => void;
  setTyping: (recipientId: string, isTyping: boolean) => void;
  onlineUsers: string[];
  typingUsers: Record<string, boolean>;
  newMessages: Record<string, any[]>;
  addMessageHandler: (
    event: string, 
    handler: (data: any) => void
  ) => () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [newMessages, setNewMessages] = useState<Record<string, any[]>>({});

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (!token || !user) return;

    try {
      const socket = socketService.initializeSocket(token);
      
      // Track connection status
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      // Set initial connection status
      setIsConnected(socket.connected);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socketService.disconnectSocket();
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [token, user]);

  // Listen for online users
  useEffect(() => {
    if (!isConnected) return;
    
    const handleUserOnline = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        if (isOnline && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (!isOnline) {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    };
    
    const socket = socketService.getSocket();
    socket?.on('user_online', handleUserOnline);
    
    return () => {
      socket?.off('user_online', handleUserOnline);
    };
  }, [isConnected]);

  // Listen for typing indicators
  useEffect(() => {
    if (!isConnected) return;
    
    const handleTypingStatus = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    };
    
    const socket = socketService.getSocket();
    socket?.on('typing_status', handleTypingStatus);
    
    return () => {
      socket?.off('typing_status', handleTypingStatus);
    };
  }, [isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!isConnected) return;
    
    const handleNewMessage = (message: any) => {
      const senderId = message.senderId;
      
      setNewMessages(prev => {
        const senderMessages = prev[senderId] || [];
        return {
          ...prev,
          [senderId]: [...senderMessages, message]
        };
      });
    };
    
    const socket = socketService.getSocket();
    socket?.on('new_message', handleNewMessage);
    
    return () => {
      socket?.off('new_message', handleNewMessage);
    };
  }, [isConnected]);

  // Send message via socket
  const sendMessage = (recipientId: string, message: any) => {
    socketService.sendMessage(recipientId, message);
  };

  // Mark message as read
  const markAsRead = (messageId: string, senderId: string) => {
    socketService.markMessageAsRead(messageId, senderId);
  };

  // Set typing indicator
  const setTyping = (recipientId: string, isTyping: boolean) => {
    socketService.sendTypingIndicator(recipientId, isTyping);
  };

  // Add custom message handler
  const addMessageHandler = (event: string, handler: (data: any) => void) => {
    const socket = socketService.getSocket();
    if (!socket) return () => {};
    
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  };

  const value = {
    isConnected,
    sendMessage,
    markAsRead,
    setTyping,
    onlineUsers,
    typingUsers,
    newMessages,
    addMessageHandler
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
