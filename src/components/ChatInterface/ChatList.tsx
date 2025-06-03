import React from 'react';
import { format } from 'date-fns';
import TypingIndicator from './TypingIndicator';
import styles from './ChatList.module.css';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  isTyping?: boolean;
  lastMessage?: {
    text?: string;
    media?: {
      type: 'image' | 'video';
    };
    location?: boolean;
    timestamp: number;
    isRead: boolean;
  };
}

interface ChatListProps {
  friends: Friend[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  friends,
  activeChatId,
  onSelectChat,
  searchQuery,
  onSearchChange
}) => {
  // Format the last message preview text
  const getLastMessagePreview = (friend: Friend) => {
    if (!friend.lastMessage) return '';
    
    if (friend.isTyping) {
      return <TypingIndicator />;
    }
    
    if (friend.lastMessage.text) {
      return friend.lastMessage.text;
    }
    
    if (friend.lastMessage.media) {
      return friend.lastMessage.media.type === 'image' ? 'Sent an image' : 'Sent a video';
    }
    
    if (friend.lastMessage.location) {
      return 'Shared a location';
    }
    
    return '';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'h:mm a');
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(messageDate, 'EEE');
    }
    
    // Otherwise show date
    return format(messageDate, 'MM/dd/yy');
  };

  return (
    <div className={styles.chatList}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.friendsList}>
        {friends.map(friend => (
          <div
            key={friend.id}
            className={`${styles.friendItem} ${activeChatId === friend.id ? styles.active : ''}`}
            onClick={() => onSelectChat(friend.id)}
          >
            <div className={styles.avatarContainer}>
              <img src={friend.avatar} alt={friend.name} className={styles.avatar} />
              {friend.isOnline && <div className={styles.onlineIndicator} />}
            </div>
            
            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <h3 className={styles.friendName}>{friend.name}</h3>
                {friend.lastMessage && (
                  <span className={styles.timestamp}>
                    {formatTimestamp(friend.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              <div className={styles.lastMessage}>
                {friend.isTyping ? (
                  <TypingIndicator />
                ) : (
                  <p className={styles.messagePreview}>
                    {getLastMessagePreview(friend)}
                  </p>
                )}
                
                {friend.lastMessage && !friend.lastMessage.isRead && !friend.isTyping && (
                  <div className={styles.unreadIndicator} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
