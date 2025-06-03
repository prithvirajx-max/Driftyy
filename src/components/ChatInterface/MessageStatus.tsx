import React from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import styles from './MessageStatus.module.css';

interface MessageStatusProps {
  isDelivered: boolean;
  isRead: boolean;
  timestamp: number;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ isDelivered, isRead, timestamp }) => {
  // Format time to show in HH:MM format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.statusContainer}>
      <span className={styles.time}>{formatTime(timestamp)}</span>
      {isRead ? (
        <FiCheckCircle className={`${styles.icon} ${styles.read}`} />
      ) : isDelivered ? (
        <FiCheck className={styles.icon} />
      ) : null}
    </div>
  );
};

export default MessageStatus;
