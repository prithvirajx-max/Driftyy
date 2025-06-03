import React, { useRef } from 'react';
import { FiMapPin, FiCornerUpRight } from 'react-icons/fi';
import MessageStatus from './MessageStatus';
import styles from './ChatMessage.module.css';

interface MessageProps {
  id: string;
  text?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  isOwn: boolean;
  timestamp: number;
  isRead: boolean;
  isDelivered?: boolean;
  onRead?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  replyTo?: {
    id: string;
    text?: string;
    sender?: {
      displayName: string;
    };
  };
}

const ChatMessage: React.FC<MessageProps> = ({
  id,
  text,
  media,
  location,
  isOwn,
  timestamp,
  isRead,
  isDelivered = true,
  onRead,
  onReply,
  replyTo
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Handle reply click
  const handleReplyClick = () => {
    if (onReply) {
      onReply(id);
    }
  };
  
  // Mark message as read when it's rendered if it's not our own message
  React.useEffect(() => {
    if (!isOwn && !isRead && onRead) {
      onRead(id);
    }
  }, [id, isOwn, isRead, onRead]);

  return (
    <div 
      className={`${styles.messageContainer} ${isOwn ? styles.own : styles.other}`}
      ref={messageRef}
    >
      <div className={styles.message}>
        {/* Always visible Reply button */}
        <button 
          className={styles.messageReplyButton}
          onClick={handleReplyClick}
          aria-label="Reply to message"
        >
          <FiCornerUpRight />
          <span>Reply</span>
        </button>
        {/* Display reply content if this message is a reply to another message */}
        {replyTo && (
          <div className={styles.replyContainer}>
            <FiCornerUpRight className={styles.replyIcon} />
            <div className={styles.replyContent}>
              <div className={styles.replySender}>{replyTo.sender?.displayName || 'User'}</div>
              <div className={styles.replyText}>
                {replyTo.text ? (
                  replyTo.text.length > 50 ? `${replyTo.text.substring(0, 50)}...` : replyTo.text
                ) : (
                  'Media message'
                )}
              </div>
            </div>
          </div>
        )}
        {media && (
          <div className={styles.mediaContainer}>
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt="Shared media" 
                className={styles.mediaImage}
              />
            ) : (
              <video 
                src={media.url} 
                controls 
                poster={media.thumbnail} 
                className={styles.mediaVideo}
              />
            )}
          </div>
        )}
        
        {location && location.lat && location.lng && (
          <div 
            className={styles.locationContainer}
            onClick={() => {
              // Detect if it's iOS
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              
              // Create appropriate maps URL based on device
              let mapsUrl;
              if (isIOS) {
                // Apple Maps on iOS
                mapsUrl = `maps://maps.apple.com/?q=${location.name}&ll=${location.lat},${location.lng}`;
              } else {
                // Google Maps for everyone else
                mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
              }
              
              // Try to open the map
              window.open(mapsUrl, '_blank');
            }}
            role="button"
            aria-label="View location on map"
            tabIndex={0}
          >
            <div className={styles.locationContent}>
              <div className={styles.locationHeader}>
                <FiMapPin className={styles.locationIcon} />
                <span>Shared Location</span>
              </div>
              <div className={styles.locationName}>{location.name}</div>
              <div className={styles.locationMap}>
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=250x150&markers=${location.lat},${location.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`} 
                  alt="Location Map" 
                  className={styles.mapImage}
                />
                <div className={styles.openInMapsLabel}>
                  <FiMapPin style={{ marginRight: '4px' }} /> Tap to Open in Maps
                </div>
              </div>
            </div>
          </div>
        )}
        
        {text && <div className={styles.messageText}>{text}</div>}
        
        <MessageStatus 
          isDelivered={isDelivered} 
          isRead={isRead} 
          timestamp={timestamp} 
        />
      </div>
    </div>
  );
};

export default ChatMessage;
