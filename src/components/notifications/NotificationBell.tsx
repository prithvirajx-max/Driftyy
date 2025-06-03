import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format the notification message based on type
  const formatNotificationMessage = (notification: any) => {
    const { type, sender, data } = notification;
    
    switch (type) {
      case 'hangout_request':
        return `${sender.name} wants to hang out with you`;
      case 'hangout_accepted':
        return `${sender.name} accepted your hangout request`;
      case 'hangout_rejected':
        return `${sender.name} declined your hangout request`;
      case 'message':
        return `${sender.name} sent you a message: ${data.preview || ''}`;
      case 'system':
        return data.message || 'System notification';
      default:
        return 'New notification';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'hangout_request':
        navigate(`/hangout?requestId=${notification.data.requestId}`);
        break;
      case 'hangout_accepted':
      case 'hangout_rejected':
        navigate(`/hangout`);
        break;
      case 'message':
        navigate(`/chat/${notification.sender._id}`);
        break;
      default:
        // Default action or do nothing
        break;
    }

    // Close the dropdown
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container" ref={notificationRef}>
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button className="mark-all-read" onClick={() => markAllAsRead()}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-sender-photo">
                    <img 
                      src={notification.sender.photo || '/default-avatar.png'} 
                      alt={notification.sender.name} 
                    />
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">
                      {formatNotificationMessage(notification)}
                    </div>
                    <div className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <button 
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
