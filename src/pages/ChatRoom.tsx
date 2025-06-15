import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { FiArrowLeft, FiMoreVertical, FiPaperclip, FiMic, FiSmile, FiSend, FiMapPin, FiImage, FiCamera, FiFile, FiCornerUpRight, FiX } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { IoCall, IoVideocam } from 'react-icons/io5';
import { RiHeartLine, RiHeartFill } from 'react-icons/ri';
import styles from './ChatRoom.module.css';

// Mock data for the chat room
const mockChats = {
  '1': {
    id: '1',
    user: {
      id: 'user2',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      isOnline: true,
      lastSeen: 'Last seen recently',
    },
    messages: [
      {
        id: '1',
        type: 'text',
        content: 'Hey there! 👋',
        sender: 'user2',
        time: '2023-05-15T10:30:00',
        status: 'read',
      },
      {
        id: '2',
        type: 'text',
        content: 'Hi! How are you?',
        sender: 'me',
        time: '2023-05-15T10:32:00',
        status: 'read',
      },
      {
        id: '3',
        type: 'text',
        content: "I'm doing great! Just wanted to check in.",
        sender: 'user2',
        time: '2023-05-15T10:33:00',
        status: 'read',
      },
      {
        id: '4',
        type: 'location',
        content: {
          name: 'Central Park',
          address: '59th to 110th Street, Manhattan, New York, NY',
          lat: 40.7829,
          lng: -73.9654,
        },
        sender: 'user2',
        time: '2023-05-15T10:35:00',
        status: 'read',
      },
      {
        id: '5',
        type: 'text',
        content: 'This is a voice message',
        sender: 'me',
        time: '2023-05-15T10:36:00',
        status: 'read',
        isVoiceMessage: true,
        duration: '0:23',
      },
    ],
  },
  '2': {
    id: '2',
    user: {
      id: 'user3',
      name: 'Sarah Miller',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      isOnline: false,
      lastSeen: '3 hours ago',
    },
    messages: [
      {
        id: '1',
        type: 'text',
        content: 'Hey, how are you doing?',
        sender: 'user3',
        time: '2023-05-15T09:30:00',
        status: 'read',
      },
      {
        id: '2',
        type: 'text',
        content: 'Good! Just finished my workout.',
        sender: 'me',
        time: '2023-05-15T09:35:00',
        status: 'read',
      },
    ],
  },
};

// Group messages by date
const groupMessagesByDate = (messages: any[]) => {
  const groups: { [key: string]: any[] } = {};
  
  messages.forEach((message) => {
    const date = new Date(message.time);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(message);
  });
  
  return groups;
};

// Format time for display
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
};

// Format date for display
const formatDate = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return format(date, 'MMMM d, yyyy');
};

const ChatRoom: React.FC = () => {
  // Get the chat ID from the URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find the chat based on ID
  const currentChat = id ? mockChats[id as keyof typeof mockChats] : null;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>(currentChat?.messages || []);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactedMessages, setReactedMessages] = useState<string[]>([]);
  
  // Reply state to track which message we're replying to
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    text?: string;
    sender: {
      displayName: string;
    };
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat when ID changes
  useEffect(() => {
    if (id && mockChats[id as keyof typeof mockChats]) {
      setMessages(mockChats[id as keyof typeof mockChats].messages);
    }
  }, [id]);

  // Scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Adjust scroll when keyboard opens
  useEffect(() => {
    const handleResize = () => {
      scrollToBottom();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scroll to bottom on initial render and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close attachment menu and emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle replying to a message
  const handleReplyToMessage = (messageId: string) => {
    // Find the message we're replying to
    const targetMessage = messages.find(msg => msg.id === messageId);
    
    if (targetMessage) {
      setReplyingTo({
        id: targetMessage.id,
        text: targetMessage.content,
        sender: {
          displayName: targetMessage.sender === 'me' ? 'You' : currentChat?.user.name || 'User'
        }
      });
      
      // Focus the input field after setting up a reply
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  // Cancel replying
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  // Send a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage) {
      const newMessage = {
        id: `${messages.length + 1}`,
        type: 'text',
        content: trimmedMessage,
        sender: 'me',
        time: new Date().toISOString(),
        status: 'sent',
        // Include reply information if replying to a message
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: {
            displayName: replyingTo.sender.displayName
          }
        } : undefined
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setShowEmojiPicker(false);
      // Clear reply state after sending
      setReplyingTo(null);
      scrollToBottom();
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        
        // Simulate reply after a delay
        setTimeout(() => {
          const replyMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: 'Thanks for your message! I\'ll get back to you soon.',
            sender: currentChat?.user.id || 'user2',
            time: new Date().toISOString(),
            status: 'delivered',
          };
          setMessages(prev => [...prev, replyMessage]);
        }, 1500);
      }, 1000);
    }
  };

  // Send a location message
  const handleSendLocation = () => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'location',
      content: {
        name: 'My Location',
        address: '123 Main St, New York, NY 10001',
        lat: 40.7128,
        lng: -74.006,
      },
      sender: 'me',
      time: new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setShowAttachmentMenu(false);
  };

  // Toggle reaction on a message
  const toggleReaction = (messageId: string) => {
    setReactedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(msgId => msgId !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);

  // If no chat is found, show a message
  if (!currentChat) {
    return (
      <div className={styles.noChatContainer}>
        <h2>Chat not found</h2>
        <button onClick={() => navigate('/messages')} className={styles.backToMessagesButton}>
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatRoom}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate('/messages')} 
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
        <div className={styles.userInfo}>
          <div 
            className={styles.avatarContainer} 
            onClick={() => navigate(`/profile/${currentChat.user.id}`)}
            style={{ cursor: 'pointer' }}
            title={`View ${currentChat.user.name}'s profile`}
          >
            <img
              className={styles.avatar}
              src={currentChat.user.avatar}
              alt={`${currentChat.user.name}'s avatar`}
            />
            {currentChat.user.isOnline && <div className={styles.onlineBadge} />}
          </div>
          <div>
            <h3 
              className={styles.userName}
              onClick={() => navigate(`/profile/${currentChat.user.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {currentChat.user.name}
            </h3>
            <p className={styles.userStatus}>
              {currentChat.user.isOnline ? 'Online now' : currentChat.user.lastSeen}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} title="Voice call" aria-label="Voice call">
            <IoCall size={20} />
          </button>
          <button className={styles.iconButton} title="Video call" aria-label="Video call">
            <IoVideocam size={20} />
          </button>
          <button className={styles.iconButton} title="More options" aria-label="More options">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            <div className={styles.dateHeader}>
              <span>{formatDate(date)}</span>
            </div>

            {msgs.map((msg: any) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${msg.sender === 'me' ? styles.currentUser : ''}`}
              >
                <div className={styles.messageContent}>
                  {msg.type === 'text' && (
                    <div
                      className={`${styles.messageBubble} ${msg.sender === 'me' ? styles.sent : styles.received}`}
                      onDoubleClick={() => handleReplyToMessage(msg.id)}
                    >
                      {/* Display reply information if this message is a reply */}
                      {msg.replyTo && (
                        <div className={styles.replyInfo}>
                          <div className={styles.replyPreview}>
                            <span className={styles.replyingSender}>
                              {msg.replyTo.sender.displayName}
                            </span>
                            <span className={styles.replyingText}>
                              {msg.replyTo.text}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.messageText}>{msg.content}</div>
                      <div className={styles.messageFooter}>
                        <div className={styles.messageTime}>
                          {formatTime(msg.time)}
                          {msg.sender === 'me' && (
                            <span className={styles.messageStatus}>
                              {msg.status === 'read' && <BsCheck2All className={styles.readIcon} size={16} />}
                              {msg.status === 'delivered' && <BsCheck2All size={16} />}
                              {msg.status === 'sent' && <BsCheck2All size={16} />}
                            </span>
                          )}
                        </div>
                        <div className={styles.messageActions}>
                          <button 
                            className={styles.replyButton}
                            onClick={() => handleReplyToMessage(msg.id)}
                            aria-label="Reply to message"
                            type="button"
                          >
                            <FiCornerUpRight size={14} />
                          </button>
                          
                          {msg.sender !== 'me' && (
                            <button 
                              className={`${styles.reactButton} ${reactedMessages.includes(msg.id) ? styles.reacted : ''}`}
                              onClick={() => toggleReaction(msg.id)}
                              aria-label="React with heart"
                              type="button"
                            >
                              {reactedMessages.includes(msg.id) ? <RiHeartFill size={14} /> : <RiHeartLine size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.type === 'location' && (
                    <div
                      className={`${styles.messageBubble} ${styles.locationBubble} ${msg.sender === 'me' ? styles.sent : styles.received}`}
                    >
                      <div className={styles.locationContainer}>
                        <div className={styles.locationMap}>
                          <FiMapPin size={24} />
                        </div>
                        <div className={styles.locationDetails}>
                          <div className={styles.locationName}>{msg.content.name}</div>
                          <div className={styles.locationAddress}>{msg.content.address}</div>
                        </div>
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.messageTime}>
                          {formatTime(msg.time)}
                          {msg.sender === 'me' && (
                            <span className={styles.messageStatus}>
                              {msg.status === 'read' && <BsCheck2All className={styles.readIcon} size={16} />}
                              {msg.status === 'delivered' && <BsCheck2All size={16} />}
                              {msg.status === 'sent' && <BsCheck2All size={16} />}
                            </span>
                          )}
                        </div>
                        {msg.sender !== 'me' && (
                          <button 
                            className={`${styles.reactButton} ${reactedMessages.includes(msg.id) ? styles.reacted : ''}`}
                            onClick={() => toggleReaction(msg.id)}
                            aria-label="React with heart"
                            type="button"
                          >
                            {reactedMessages.includes(msg.id) ? <RiHeartFill size={14} /> : <RiHeartLine size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {msg.isVoiceMessage && (
                    <div
                      className={`${styles.messageBubble} ${styles.voiceMessageBubble} ${msg.sender === 'me' ? styles.sent : styles.received}`}
                    >
                      <div className={styles.voiceMessageContainer}>
                        <div className={styles.playButton}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5.14v14l11-7-11-7z" />
                          </svg>
                        </div>
                        <div className={styles.waveform}>
                          {Array(20)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className={styles.waveformBar}
                                style={{ height: `${Math.random() * 15 + 5}px` }}
                              />
                            ))}
                        </div>
                        <div className={styles.voiceDuration}>{msg.duration}</div>
                      </div>
                      <div className={styles.messageFooter}>
                        <div className={styles.messageTime}>
                          {formatTime(msg.time)}
                          {msg.sender === 'me' && (
                            <span className={styles.messageStatus}>
                              {msg.status === 'read' && <BsCheck2All className={styles.readIcon} size={16} />}
                              {msg.status === 'delivered' && <BsCheck2All size={16} />}
                              {msg.status === 'sent' && <BsCheck2All size={16} />}
                            </span>
                          )}
                        </div>
                        {msg.sender !== 'me' && (
                          <button 
                            className={`${styles.reactButton} ${reactedMessages.includes(msg.id) ? styles.reacted : ''}`}
                            onClick={() => toggleReaction(msg.id)}
                            aria-label="React with heart"
                            type="button"
                          >
                            {reactedMessages.includes(msg.id) ? <RiHeartFill size={14} /> : <RiHeartLine size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {isTyping && (
          <div className={styles.messageRow}>
            <div className={styles.messageContent}>
              <div className={`${styles.messageBubble} ${styles.received}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={styles.messageInputContainer}>
        {/* Reply UI - Shows when replying to a message */}
        {replyingTo && (
          <div className={styles.replyBar}>
            <div className={styles.replyInfo}>
              <FiCornerUpRight className={styles.replyIcon} />
              <div className={styles.replyText}>
                <span className={styles.replyingTo}>Replying to {replyingTo.sender.displayName}</span>
                <span className={styles.replyMessage}>
                  {replyingTo.text && replyingTo.text.length > 50 
                    ? `${replyingTo.text.substring(0, 50)}...` 
                    : replyingTo.text || 'Media message'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.cancelReplyButton}
              onClick={handleCancelReply}
              aria-label="Cancel reply"
            >
              <FiX size={18} />
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <div className={styles.attachmentContainer}>
            <button
              type="button"
              className={styles.attachButton}
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              aria-label="Add attachment"
            >
              <FiPaperclip size={22} />
            </button>
            {showAttachmentMenu && (
              <div className={styles.attachmentMenu} ref={attachmentMenuRef}>
                <button type="button" className={styles.attachmentOption}>
                  <FiCamera size={20} />
                  <span>Camera</span>
                </button>
                <button type="button" className={styles.attachmentOption}>
                  <FiImage size={20} />
                  <span>Gallery</span>
                </button>
                <button type="button" className={styles.attachmentOption} onClick={handleSendLocation}>
                  <HiOutlineLocationMarker size={20} />
                  <span>Location</span>
                </button>
                <button type="button" className={styles.attachmentOption}>
                  <FiFile size={20} />
                  <span>File</span>
                </button>
              </div>
            )}
          </div>
          <div className={styles.emojiContainer}>
            <button
              type="button"
              className={styles.emojiButton}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Add emoji"
            >
              <FiSmile size={22} />
            </button>
            {showEmojiPicker && (
              <div className={styles.emojiPicker}>
                <div className={styles.emojiGrid}>
                  {['😊', '😂', '😍', '👍', '🎉', '❤️', '🔥', '👋', '😎', '🤔', '😘', '💕', '🌹', '✨', '🥰', '😜', '🤫', '😈', '🍷', '💋'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={styles.emojiItem}
                      onClick={() => setMessage((prev) => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.messageInput}
            ref={inputRef}
          />
          {!message.trim() ? (
            <button type="button" className={styles.micButton} aria-label="Record voice message">
              <FiMic size={22} />
            </button>
          ) : (
            <button type="submit" className={styles.sendButton} disabled={!message.trim()} aria-label="Send message">
              <FiSend size={22} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
