import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FiImage, FiVideo, FiMapPin, FiX, FiSend } from 'react-icons/fi';
import { IoHappy, IoLocationSharp } from 'react-icons/io5';
import { BiLoader } from 'react-icons/bi';
import { MdLocationOff } from 'react-icons/md';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSendMessage: (text: string, replyToId?: string) => void;
  onSendMedia: (file: File, replyToId?: string) => void;
  onSendLocation: (location: { lat: number; lng: number; name: string }, replyToId?: string) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo?: {
    id: string;
    text?: string;
    sender: {
      displayName: string;
    };
  };
  onCancelReply?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendMedia,
  onSendLocation,
  onTyping,
  replyingTo,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle message input change with typing indicator
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (value && !isTyping) {
      // Started typing
      setIsTyping(true);
      onTyping(true);
    } else if (!value && isTyping) {
      // Stopped typing
      setIsTyping(false);
      onTyping(false);
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing indicator after 3 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 3000);
  };

  // Handle key press - send on Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSendMessage();
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Send the message, including replyToId if replying
    onSendMessage(message, replyingTo?.id);
    setMessage('');
    
    // Clear reply state if there is one
    if (replyingTo && onCancelReply) {
      onCancelReply();
    }
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle image selection
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle video selection
  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Removed duplicate function - using handleFileChange instead

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onSendMedia(files[0], replyingTo?.id);
      
      // Clear reply state if there is one
      if (replyingTo && onCancelReply) {
        onCancelReply();
      }
      
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Check location permission on component mount and whenever needed
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return Promise.resolve('denied');
    }
    
    if (navigator.permissions) {
      return navigator.permissions.query({name: 'geolocation'})
        .then(permissionStatus => {
          setLocationPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
          
          // Set up listener for permission changes
          permissionStatus.onchange = () => {
            setLocationPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
          };
          
          return permissionStatus.state;
        })
        .catch(() => {
          // If we can't determine permission status, we'll have to try getting location
          setLocationPermission('unknown');
          return 'unknown';
        });
    } else {
      // Browser doesn't support permission API, set to unknown
      setLocationPermission('unknown');
      return Promise.resolve('unknown');
    }
  };
  
  // Run permission check when component mounts
  useEffect(() => {
    checkLocationPermission();
  }, []);
  
  // Handle location sharing with real address lookup
  const handleLocationShare = async () => {
    // Hide previous notice if showing
    setShowLocationNotice(false);
    
    // First, check if geolocation is supported
    if (!navigator.geolocation) {
      setShowLocationNotice(true);
      return;
    }

    // Check if we can access location permissions
    let canAccessLocation = false;
    
    try {
      // Get the latest permission status
      const permissionState = await checkLocationPermission();
      
      // If permission is denied, show notice and return early
      if (permissionState === 'denied' || permissionState === 'prompt') {
        setShowLocationNotice(true);
        return;
      }
      
      // Additional verification - try to get actual location first
      // This is to handle cases where the browser says permission is granted but location is off
      const testPromise = new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true), // We got a position, so location is on
          () => resolve(false), // Error getting position, so location is likely off
          { timeout: 3000, maximumAge: 0 } // Short timeout to check quickly
        );
        
        // Also set a timeout in case the getCurrentPosition is stuck
        setTimeout(() => resolve(false), 3500);
      });
      
      canAccessLocation = await testPromise;
      
      if (!canAccessLocation) {
        setShowLocationNotice(true);
        return;
      }
    } catch (error) {
      console.error('Error checking location access:', error);
      setShowLocationNotice(true);
      return;
    }

    // Only proceed if we're likely to get a location
    // Show loading state
    setIsLocationLoading(true);

    // Set a timeout to ensure we don't wait forever
    const timeoutId = setTimeout(() => {
      if (isLocationLoading) {
        setIsLocationLoading(false);
        setShowLocationNotice(true);
      }
    }, 20000); // 20 second timeout

    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        // Clear the timeout since we got a position
        clearTimeout(timeoutId);
        
        // Extract coordinates
        const { latitude, longitude, accuracy } = position.coords;
        
        // Absolute validation that we have real coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          console.error('Invalid coordinates received');
          setIsLocationLoading(false);
          setShowLocationNotice(true);
          return;
        }
        
        // Validate accuracy - reject if accuracy is too low
        if (accuracy > 5000) {
          console.warn('Location accuracy too low:', accuracy);
          setIsLocationLoading(false);
          setShowLocationNotice(true);
          return;
        }
            
            try {
              // Get the actual address using reverse geocoding
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
              );
              
              if (!response.ok) {
                throw new Error('Geocoding API request failed');
              }
              
              const data = await response.json();
              let locationName = 'Your Current Location'; // Default name
              
              if (data.status === 'OK' && data.results && data.results.length > 0) {
                // Get the formatted address from the first result
                locationName = data.results[0].formatted_address;
              }
              
              // Only send if we have valid coordinates
              onSendLocation({
                lat: latitude,
                lng: longitude,
                name: locationName
              }, replyingTo?.id);
              
              // Clear reply state if there is one
              if (replyingTo && onCancelReply) {
                onCancelReply();
              }
            } catch (error) {
              console.error('Error getting location name:', error);
              
              // Ask user if they still want to share coordinates without address
              const confirmSend = window.confirm(
                'Could not retrieve your location address. Do you still want to share your location coordinates?'
              );
              
              if (confirmSend) {
                onSendLocation({
                  lat: latitude,
                  lng: longitude,
                  name: 'Your Location'
                }, replyingTo?.id);
                
                // Clear reply state if there is one
                if (replyingTo && onCancelReply) {
                  onCancelReply();
                }
              }
            } finally {
              setIsLocationLoading(false);
            }
          },
          // Error callback
          (error) => {
            // Clear the timeout since we got an error
            clearTimeout(timeoutId);
            console.error('Error getting location:', error);
            setIsLocationLoading(false);
            
            // Show location notice with friendly message
            setShowLocationNotice(true);
            
            // Update permission state in case it changed
            checkLocationPermission();
          },
          // Options for better accuracy
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
  };

  return (
    <div className={styles.inputContainer}>
      {/* Reply UI - Show when replying to a message */}
      {replyingTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewContent}>
            <span className={styles.replyingToText}>Replying to </span>
            <span className={styles.replyingToName}>{replyingTo.sender.displayName}</span>
            <p className={styles.replyPreviewText}>
              {replyingTo.text ? (
                replyingTo.text.length > 30 ? `${replyingTo.text.substring(0, 30)}...` : replyingTo.text
              ) : (
                'Media message'
              )}
            </p>
          </div>
          <button 
            className={styles.cancelReplyButton}
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <FiX />
          </button>
        </div>
      )}
      <div className={styles.attachmentOptions}>
        <button 
          className={styles.iconButton}
          onClick={handleImageClick}
          title="Send image"
        >
          <FiImage />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button 
          className={styles.iconButton}
          onClick={handleVideoClick}
          title="Send video"
        >
          <FiVideo />
        </button>
        <input
          type="file"
          ref={videoInputRef}
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button 
          className={`${styles.iconButton} ${isLocationLoading ? styles.loading : ''} ${locationPermission === 'denied' ? styles.locationDisabled : ''}`}
          onClick={handleLocationShare}
          title="Share location"
          disabled={isLocationLoading}
        >
          {isLocationLoading ? 
            <BiLoader className={styles.spinningLoader} /> : 
            locationPermission === 'granted' ? 
              <IoLocationSharp /> : 
              <FiMapPin />
          }
        </button>
        
        {/* Location notification */}
        {showLocationNotice && (
          <div className={styles.locationNotice}>
            <MdLocationOff className={styles.locationOffIcon} />
            <p>Please enable location services to share your location</p>
            <button 
              className={styles.closeNoticeButton}
              onClick={() => setShowLocationNotice(false)}
              aria-label="Close notification"
            >
              <FiX />
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.messageInputWrapper}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          className={styles.messageInput}
        />
        
        <button 
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emoji"
        >
          <IoHappy />
        </button>
        
        {showEmojiPicker && (
          <div className={styles.emojiPickerContainer}>
            <button 
              className={styles.closeEmojiButton}
              onClick={() => setShowEmojiPicker(false)}
            >
              <FiX />
            </button>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      
      <button 
        className={`${styles.sendButton} ${message.trim() ? styles.active : ''}`}
        onClick={handleSendMessage}
        disabled={!message.trim()}
      >
        <FiSend />
      </button>
    </div>
  );
};

export default ChatInput;
