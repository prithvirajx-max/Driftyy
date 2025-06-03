import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiImage, FiVideo, FiMapPin, FiX, FiCheck, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { IoHappy, IoLocationSharp } from 'react-icons/io5';
import styles from './Messages.module.css';
import fullScreenStyles from './Messages.fullscreen.module.css';

// Mock data - Would be replaced with actual API calls
const mockFriends = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    isOnline: true,
    lastSeen: 'Just now'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    isOnline: false,
    lastSeen: '2 hours ago'
  },
  {
    id: '3',
    name: 'Mike Chen',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    isOnline: true,
    lastSeen: 'Online'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    isOnline: false,
    lastSeen: '1 day ago'
  },
  {
    id: '5',
    name: 'David Park',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    isOnline: false,
    lastSeen: '3 days ago'
  },
  {
    id: '6',
    name: 'Lisa Wong',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    isOnline: true,
    lastSeen: 'Online'
  }
];

// Mock chat data structure
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
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
  timestamp: number;
  isRead: boolean;
}

interface ChatThread {
  friendId: string;
  messages: Message[];
}

const mockChatThreads: Record<string, ChatThread> = {
  '1': {
    friendId: '1',
    messages: [
      {
        id: '101',
        senderId: '1',
        receiverId: 'me',
        text: 'Hey, how are you doing?',
        timestamp: Date.now() - 86400000, // 1 day ago
        isRead: true
      },
      {
        id: '102',
        senderId: 'me',
        receiverId: '1',
        text: "I'm good! Just checking out this new app.",
        timestamp: Date.now() - 86350000,
        isRead: true
      },
      {
        id: '103',
        senderId: '1',
        receiverId: 'me',
        text: 'It looks really cool. Want to meet up later?',
        timestamp: Date.now() - 86300000,
        isRead: true
      },
      {
        id: '104',
        senderId: 'me',
        receiverId: '1',
        text: 'Sure, how about coffee at 5?',
        timestamp: Date.now() - 3600000, // 1 hour ago
        isRead: true
      }
    ]
  },
  '2': {
    friendId: '2',
    messages: [
      {
        id: '201',
        senderId: '2',
        receiverId: 'me',
        text: 'Check out this place I found!',
        timestamp: Date.now() - 172800000, // 2 days ago
        isRead: true
      },
      {
        id: '202',
        senderId: '2',
        receiverId: 'me',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          name: 'Central Park'
        },
        timestamp: Date.now() - 172700000,
        isRead: true
      },
      {
        id: '203',
        senderId: 'me',
        receiverId: '2',
        text: "That looks amazing! I'll have to visit soon.",
        timestamp: Date.now() - 86400000, // 1 day ago
        isRead: true
      }
    ]
  },
  '3': {
    friendId: '3',
    messages: [
      {
        id: '301',
        senderId: '3',
        receiverId: 'me',
        text: 'Hey, did you see my video?',
        timestamp: Date.now() - 7200000, // 2 hours ago
        isRead: false
      },
      {
        id: '302',
        senderId: '3',
        receiverId: 'me',
        media: {
          type: 'video',
          url: 'https://example.com/sample-video.mp4',
          thumbnail: 'https://example.com/sample-thumbnail.jpg'
        },
        timestamp: Date.now() - 7100000,
        isRead: false
      }
    ]
  },
  '4': {
    friendId: '4',
    messages: [
      {
        id: '401',
        senderId: 'me',
        receiverId: '4',
        text: "Hi Emily, how's your day going?",
        timestamp: Date.now() - 259200000, // 3 days ago
        isRead: true
      },
      {
        id: '402',
        senderId: '4',
        receiverId: 'me',
        text: 'Pretty good, thanks! How about yours?',
        timestamp: Date.now() - 172800000, // 2 days ago
        isRead: true
      }
    ]
  }
};

// Utility function to compress images
const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
  // In a real app, this would use a library like browser-image-compression
  // For now, we'll simulate compression
  console.log(`Compressing image to max size of ${maxSizeMB}MB`);
  return file; // Return original file as a placeholder
};

// Utility function to compress videos
const compressVideo = async (file: File, maxSizeMB: number): Promise<File> => {
  // In a real app, this would use a library or service for video compression
  // For now, we'll simulate compression
  console.log(`Compressing video to max size of ${maxSizeMB}MB`);
  return file; // Return original file as a placeholder
};

const Messages: React.FC = () => {
  // Get auth and message context
  const { user } = useAuth();
  const { 
    sendMessage: sendSocketMessage, 
    markAsRead, 
    setTyping, 
    onlineUsers, 
    typingUsers,
    newMessages,
    addMessageHandler
  } = useMessage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState<boolean>(false);
  const [currentMediaType, setCurrentMediaType] = useState<'image' | 'video'>('image');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Track if user is typing - debounce to avoid excessive socket events
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>(mockChatThreads);
  const [filteredFriends, setFilteredFriends] = useState(mockFriends);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fullScreenChatRef = useRef<HTMLDivElement>(null);

  
  // Cache for optimistic UI updates and offline functionality
  const messageCache = useRef<Record<string, Message[]>>({
    // Initialize with existing messages
    ...Object.fromEntries(
      Object.entries(mockChatThreads).map(([id, thread]) => [
        id, 
        [...thread.messages]
      ])
    )
  });

  // Handle real-time message events
  useEffect(() => {
    if (!user) return;
    
    // Handler for new messages
    const handleNewMessage = useCallback((messageData: any) => {
      const { senderId, messageId, text, media, location, timestamp } = messageData;
      
      // Add message to thread
      setChatThreads(prev => {
        // If thread exists, add message to it
        if (prev[senderId]) {
          const updatedThread = { ...prev[senderId] };
          updatedThread.messages = [
            ...updatedThread.messages,
            {
              id: messageId,
              senderId,
              recipientId: user.id,
              text,
              media,
              location,
              timestamp,
              isRead: false
            }
          ];
          return { ...prev, [senderId]: updatedThread };
        }
        
        // If thread doesn't exist (first message from this user)
        // Create a new thread with this friend
        const newFriend = mockFriends.find(f => f.id === senderId);
        if (!newFriend) return prev; // Friend not found
        
        return {
          ...prev,
          [senderId]: {
            friendId: senderId,
            messages: [
              {
                id: messageId,
                senderId,
                recipientId: user.id,
                text,
                media,
                location,
                timestamp,
                isRead: false
              }
            ]
          }
        };
      });
      
      // Mark message as read if currently viewing this chat
      if (activeChatId === senderId) {
        markAsRead(messageId, senderId);
      }
    }, [activeChatId, user]);
    
    // Handler for read receipts
    const handleMessageRead = useCallback(({ messageId, readBy }: { messageId: string; readBy: string }) => {
      setChatThreads(prev => {
        // Find which thread contains this message
        for (const [threadId, thread] of Object.entries(prev)) {
          const updatedMessages = thread.messages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
          
          // If we found and updated the message
          if (updatedMessages.some(msg => msg.id === messageId && msg.isRead)) {
            return {
              ...prev,
              [threadId]: {
                ...thread,
                messages: updatedMessages
              }
            };
          }
        }
        return prev;
      });
    }, []);
    
    // Register message handlers
    const unsubscribeNewMessage = addMessageHandler('new_message', handleNewMessage);
    const unsubscribeMessageRead = addMessageHandler('message_read', handleMessageRead);
    
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageRead();
    };
  }, [user, activeChatId, addMessageHandler]);
  
  // Handle typing indicators
  useEffect(() => {
    // Update friend list to show typing indicators
    setFilteredFriends(prev => 
      prev.map(friend => ({
        ...friend,
        isTyping: typingUsers[friend.id] || false
      }))
    );
  }, [typingUsers]);

  // Filter friends based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFriends(mockFriends.map(friend => ({
        ...friend,
        isTyping: typingUsers[friend.id] || false,
        isOnline: onlineUsers.includes(friend.id)
      })));
      return;
    }
    
    const filtered = mockFriends.filter(friend => 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(friend => ({
      ...friend,
      isTyping: typingUsers[friend.id] || false,
      isOnline: onlineUsers.includes(friend.id)
    }));
    
    setFilteredFriends(filtered);
  }, [searchQuery, typingUsers, onlineUsers]);

  // Scroll to bottom of messages when active chat changes or new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chatThreads]);

  // Open media gallery for selection
  const openMediaGallery = (type: 'image' | 'video') => {
    setCurrentMediaType(type);
    setIsMediaPreviewVisible(true);
    
    // Trigger the appropriate file input based on media type
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  // Handle image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check file size and compress if needed
      const maxSizeMB = 1; // 1MB max
      const fileSizeMB = file.size / (1024 * 1024);
      
      let processedFile = file;
      if (fileSizeMB > maxSizeMB) {
        processedFile = await compressImage(file, maxSizeMB);
      }
      
      setSelectedMedia(processedFile);
      setIsMediaPreviewVisible(false);
    } catch (error) {
      console.error('Error processing image:', error);
      // Show error toast or message
    }
  };

  // Handle video selection
  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check file size and compress if needed
      const maxSizeMB = 8; // 8MB max
      const fileSizeMB = file.size / (1024 * 1024);
      
      let processedFile = file;
      if (fileSizeMB > maxSizeMB) {
        processedFile = await compressVideo(file, maxSizeMB);
      }
      
      setSelectedMedia(processedFile);
      setIsMediaPreviewVisible(false);
    } catch (error) {
      console.error('Error processing video:', error);
      // Show error toast or message
    }
  };

  // Mock function to simulate location selection
  const handleLocationSelect = () => {
    // In a real app, this would open a map or use geolocation
    setSelectedLocation({
      lat: 40.7128,
      lng: -74.0060,
      name: 'Current Location'
    });
  };

  // Clear selected media or location
  const clearSelection = () => {
    setSelectedMedia(null);
    setSelectedLocation(null);
    setIsMediaPreviewVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Add emoji to message
  const addEmoji = (emoji: { emoji: string }) => {
    setMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  // Send message with real-time delivery
  const sendMessage = () => {
    if (!activeChatId) return;
    if (!message && !selectedMedia && !selectedLocation) return;

    const messageId = uuidv4();
    const currentTime = Date.now();
    
    // Create message object
    const newMessage: Message = {
      id: messageId,
      senderId: 'me',
      receiverId: activeChatId,
      timestamp: currentTime,
      isRead: false
    };

    if (message) {
      newMessage.text = message;
    }

    if (selectedMedia) {
      // In a real app, you would upload the file and get a URL
      newMessage.media = {
        type: selectedMedia.type.includes('image') ? 'image' : 'video',
        url: URL.createObjectURL(selectedMedia),
        thumbnail: selectedMedia.type.includes('video') ? 'https://example.com/video-thumbnail.jpg' : undefined
      };
    }

    if (selectedLocation) {
      newMessage.location = selectedLocation;
    }

    // Update locally with optimistic UI
    setChatThreads(prev => {
      const thread = prev[activeChatId] || { friendId: activeChatId, messages: [] };
      return {
        ...prev,
        [activeChatId]: {
          ...thread,
          messages: [...thread.messages, newMessage]
        }
      };
    });

    // Update cache
    messageCache.current[activeChatId] = [
      ...(messageCache.current[activeChatId] || []),
      newMessage
    ];

    // Send via WebSocket for real-time delivery
    sendSocketMessage(activeChatId, {
      messageId,
      text: message || '',
      media: newMessage.media,
      location: newMessage.location,
      timestamp: currentTime
    });
    
    // Stop typing indicator when message is sent
    if (isTyping) {
      setIsTyping(false);
      setTyping(activeChatId, false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    // Clear inputs
    setMessage('');
    clearSelection();
  };

  // Get active chat messages
  const activeChat = activeChatId ? chatThreads[activeChatId] : null;
  const activeFriend = activeChatId ? mockFriends.find(f => f.id === activeChatId) : null;
  
  // Handle opening full-screen chat
  const openFullScreenChat = (friendId: string) => {
    setActiveChatId(friendId);
    setIsFullScreen(true);
    // Add a slight delay to ensure the animation runs smoothly
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };
  
  // Handle closing full-screen chat
  const closeFullScreenChat = () => {
    setIsFullScreen(false);
  };
  
  // Handle clicking outside to close full-screen view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fullScreenChatRef.current && 
          !fullScreenChatRef.current.contains(event.target as Node) && 
          isFullScreen) {
        closeFullScreenChat();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFullScreen]);

  return (
    <div className={styles.messagesContainer}>
      {/* Hidden file inputs to open native gallery */}
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        accept="image/*"
        onChange={handleImageSelect}
        capture="environment"
      />
      <input 
        type="file" 
        hidden 
        ref={videoInputRef} 
        accept="video/*"
        onChange={handleVideoSelect}
        capture="environment"
      />
      {/* Header with Logo */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Drifty</h1>
        </div>
      </header>

      <div className={styles.chatInterface}>
        {/* Friends List / Chat List */}
        <div className={styles.chatList}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.friendsList}>
            {filteredFriends.map(friend => {
              const lastMessage = chatThreads[friend.id]?.messages.slice(-1)[0];
              const unreadCount = chatThreads[friend.id]?.messages.filter(
                msg => msg.senderId === friend.id && !msg.isRead
              ).length || 0;
              
              return (
                <motion.div 
                  key={friend.id}
                  className={`${styles.friendItem} ${activeChatId === friend.id ? styles.activeFriend : ''}`}
                  onClick={() => openFullScreenChat(friend.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.avatarContainer}>
                    <img 
                      src={friend.avatar} 
                      alt={friend.name} 
                      className={styles.avatar}
                    />
                    {friend.isOnline && <span className={styles.onlineIndicator}></span>}
                  </div>
                  <div className={styles.friendInfo}>
                    <div className={styles.nameRow}>
                      <h3>{friend.name}</h3>
                      {lastMessage && (
                        <span className={styles.timeStamp}>
                          {format(new Date(lastMessage.timestamp), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    <div className={styles.previewRow}>
                      {lastMessage && (
                        <p className={styles.messagePreview}>
                          {lastMessage.text ? lastMessage.text : 
                           lastMessage.media ? (lastMessage.media.type === 'image' ? '📷 Photo' : '🎥 Video') :
                           lastMessage.location ? '📍 Location' : ''}
                        </p>
                      )}
                      {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chat area removed */}
      </div>
      
      {/* Full-screen chat view (Instagram style) */}
      {isFullScreen && activeChatId && activeFriend && (
        <div className={fullScreenStyles.fullScreenOverlay}>
          <motion.div 
            className={fullScreenStyles.fullScreenChat}
            ref={fullScreenChatRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className={fullScreenStyles.fullScreenHeader}>
              <button 
                className={fullScreenStyles.backButton}
                onClick={closeFullScreenChat}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              
              <div className={fullScreenStyles.fullScreenHeaderInfo}>
                <img 
                  src={activeFriend.avatar} 
                  alt={activeFriend.name} 
                  className={fullScreenStyles.fullScreenAvatar}
                />
                <div className={fullScreenStyles.fullScreenUserInfo}>
                  <h2>{activeFriend.name}</h2>
                  <p>
                    {activeFriend.isOnline ? 'Online' : `Last seen ${activeFriend.lastSeen}`}
                  </p>
                </div>
              </div>
              
              <div className={fullScreenStyles.fullScreenActions}>
                <button className={fullScreenStyles.fullScreenActionButton}>
                  <FiPhone />
                </button>
                <button className={fullScreenStyles.fullScreenActionButton}>
                  <FiVideo />
                </button>
              </div>
            </div>
            
            <div className={fullScreenStyles.fullScreenMessages}>
              {activeChat?.messages.map((msg) => {
                const isMine = msg.senderId === 'me';
                return (
                  <div 
                    key={msg.id} 
                    className={`${fullScreenStyles.fullScreenMessage} ${isMine ? fullScreenStyles.fullScreenMyMessage : fullScreenStyles.fullScreenTheirMessage}`}
                  >
                    {msg.text && <p className={fullScreenStyles.fullScreenMessageText}>{msg.text}</p>}
                    
                    {msg.media && (
                      <div className={fullScreenStyles.fullScreenMediaContainer}>
                        {msg.media.type === 'image' ? (
                          <img 
                            src={msg.media.url} 
                            alt="Shared image" 
                            className={fullScreenStyles.fullScreenSharedImage}
                          />
                        ) : (
                          <div className={fullScreenStyles.fullScreenVideoContainer}>
                            <video 
                              src={msg.media.url} 
                              controls 
                              poster={msg.media.thumbnail}
                              className={fullScreenStyles.fullScreenSharedVideo}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {msg.location && (
                      <div className={fullScreenStyles.fullScreenLocationContainer}>
                        <div className={fullScreenStyles.fullScreenLocationMap}>
                          {/* In a real app, this would be a map component */}
                          <div className={fullScreenStyles.fullScreenMapPlaceholder}>
                            <IoLocationSharp size={24} />
                            <span>{msg.location.name}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={fullScreenStyles.fullScreenMessageInfo}>
                      <span className={fullScreenStyles.fullScreenMessageTime}>
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                      {isMine && (
                        <span className={fullScreenStyles.fullScreenMessageStatus}>
                          {msg.isRead ? (
                            <FiCheckCircle className={fullScreenStyles.fullScreenReadIcon} />
                          ) : (
                            <FiCheck className={fullScreenStyles.fullScreenDeliveredIcon} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
            
            <div className={fullScreenStyles.fullScreenInputArea}>
              {(selectedMedia || selectedLocation) && (
                <div className={fullScreenStyles.fullScreenSelectedAttachment}>
                  {selectedMedia && (
                    <div className={fullScreenStyles.fullScreenSelectedMedia}>
                      {selectedMedia.type.includes('image') ? (
                        <img 
                          src={URL.createObjectURL(selectedMedia)} 
                          alt="Selected image" 
                          className={fullScreenStyles.fullScreenSelectedImage}
                        />
                      ) : (
                        <video 
                          src={URL.createObjectURL(selectedMedia)} 
                          className={fullScreenStyles.fullScreenSelectedVideo}
                        />
                      )}
                      <button 
                        className={fullScreenStyles.fullScreenClearButton}
                        onClick={clearSelection}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}

                  {selectedLocation && (
                    <div className={fullScreenStyles.fullScreenSelectedLocation}>
                      <div className={fullScreenStyles.fullScreenLocationPreview}>
                        <IoLocationSharp />
                        <span>{selectedLocation.name}</span>
                      </div>
                      <button 
                        className={fullScreenStyles.fullScreenClearButton}
                        onClick={clearSelection}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className={fullScreenStyles.fullScreenMessageInputContainer}>
                <button 
                  className={fullScreenStyles.fullScreenEmojiButton}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <IoHappy />
                </button>
                
                <input 
                  type="text" 
                  placeholder="Type a message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className={fullScreenStyles.fullScreenMessageInput}
                />
                
                <div className={fullScreenStyles.fullScreenAttachmentButtons}>
                  <button 
                    className={fullScreenStyles.fullScreenAttachButton}
                    onClick={() => openMediaGallery('image')}
                    title="Send an image"
                  >
                    <FiImage />
                  </button>
                  
                  <button 
                    className={fullScreenStyles.fullScreenAttachButton}
                    onClick={() => openMediaGallery('video')}
                    title="Send a video"
                  >
                    <FiVideo />
                  </button>
                  
                  <button 
                    className={fullScreenStyles.fullScreenAttachButton}
                    onClick={handleLocationSelect}
                  >
                    <FiMapPin />
                  </button>
                </div>
                
                <button 
                  className={`${fullScreenStyles.fullScreenSendButton} ${(!message && !selectedMedia && !selectedLocation) ? fullScreenStyles.disabledSendButton : ''}`}
                  onClick={sendMessage}
                  disabled={!message && !selectedMedia && !selectedLocation}
                  aria-label="Send message"
                  title="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"></path>
                  </svg>
                </button>
              </div>
              
              {showEmojiPicker && (
                <div className={fullScreenStyles.fullScreenEmojiPickerContainer}>
                  <EmojiPicker onEmojiClick={addEmoji} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Messages;
