import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// Define notification type
export interface Notification {
  _id: string;
  type: 'hangout_request' | 'hangout_accepted' | 'hangout_rejected' | 'message' | 'system';
  sender: {
    _id: string;
    name: string;
    photo: string;
  };
  recipient: string;
  read: boolean;
  data: any;
  createdAt: string;
}

// Define the notification context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  socket: Socket | null;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create a provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setError(`Socket connection error: ${err.message}`);
      });

      newSocket.on('new_notification', (notification: Notification) => {
        // Add the new notification to the list and update unread count
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound if available
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(err => console.error('Failed to play notification sound:', err));
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, token]);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update the notification in the state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.put('/api/notifications/read-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update all notifications to read
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Remove the notification from the state
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  // Fetch notifications on initial load and when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Reset state when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Value to be provided by the context
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
