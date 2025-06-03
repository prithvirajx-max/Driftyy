import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import styles from './NotificationDropdown.module.css';
import landingStyles from '../../pages/LandingExperience.module.css';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();
  const { token } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  // Handle hangout request response (accept or decline)
  const handleHangoutResponse = async (notificationId: string, requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await axios.put(
        `/api/hangouts/${requestId}/${status === 'accepted' ? 'accept' : 'reject'}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Mark notification as read
      markAsRead(notificationId);
      
      // Refresh notifications
      fetchNotifications();

      // Show success message
      alert(`Hangout request ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
      
      // If accepted, navigate to hangout page
      if (status === 'accepted') {
        navigate('/hangout');
      }
    } catch (error) {
      console.error(`Error ${status} hangout request:`, error);
      alert(`Failed to ${status === 'accepted' ? 'accept' : 'decline'} hangout request`);
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Mark notifications as read when opening dropdown
    if (!isOpen && unreadCount > 0) {
      notifications.forEach(notification => {
        if (!notification.read) {
          markAsRead(notification._id);
        }
      });
    }
  };

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      <button 
        className={landingStyles.notificationIcon} 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <svg 
          stroke="currentColor" 
          fill="currentColor" 
          strokeWidth="0" 
          viewBox="0 0 448 512" 
          height="24" 
          width="24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z"></path>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
          </div>
          
          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className={styles.avatar}>
                    <img 
                      src={notification.sender?.photo || '/default-avatar.png'} 
                      alt={notification.sender?.name || 'User'} 
                    />
                  </div>
                  
                  <div className={styles.content}>
                    <div className={styles.message}>
                      <span className={styles.username}>{notification.sender?.name || 'User'}</span>
                      {notification.type === 'hangout_request' && (
                        <span> sent you a hangout request</span>
                      )}
                      {notification.type === 'hangout_accepted' && (
                        <span> accepted your hangout request</span>
                      )}
                      {notification.type === 'hangout_rejected' && (
                        <span> declined your hangout request</span>
                      )}
                      {notification.type === 'message' && (
                        <span> sent you a message</span>
                      )}
                      {notification.data?.message && (
                        <p className={styles.messagePreview}>{notification.data.message}</p>
                      )}
                    </div>
                    
                    <div className={styles.timeInfo}>
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                    
                    {/* Actions for hangout requests */}
                    {notification.type === 'hangout_request' && notification.data?.requestId && (
                      <div className={styles.actions}>
                        <button 
                          className={`${styles.actionButton} ${styles.acceptButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHangoutResponse(notification._id, notification.data.requestId, 'accepted');
                          }}
                        >
                          Accept
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.declineButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHangoutResponse(notification._id, notification.data.requestId, 'rejected');
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
