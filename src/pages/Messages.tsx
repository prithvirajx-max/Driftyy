 import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiSend, FiImage, FiVideo, FiMic, FiPhone,
  FiSmile, FiPaperclip, FiX, FiChevronLeft, FiMoreVertical,
  FiCheck, FiCheckCircle, FiMaximize2
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import styles from './Messages.module.css';
import { useAuth } from '../contexts/AuthContext';
import { listenConversations, listenMessages, sendTextMessage, sendMediaMessage, markMessagesSeen } from '../services/chatService';
import { getUserProfile } from '../services/userService';

// Types
interface Media {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
}

interface Message {
  id: string;
  sender: string;
  text?: string;
  media?: Media;
  time: string;
  seen: boolean;
  replyTo?: string;
  reactions: string[];
  createdAt?: any;
}

interface Chat {
  participants: string[];
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  unreadCount: number;
  messages: Message[];
  typing: boolean;
  lastMessage?: {
    text?: string;
    type: string;
    sender: string;
    time: string;
    seen: boolean;
  };
}

export default function Messages() {
  const { user } = useAuth();
  // States
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [lightboxMedia, setLightboxMedia] = useState<Media | null>(null);
  const [showMobileChatRoom, setShowMobileChatRoom] = useState(false);

  /* Loading & error state */
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const messageBubbleRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  /* Cache user profiles to avoid redundant fetches */
  const profileCache = useRef<Map<string, any>>(new Map());

  // --- Firestore listeners ---
  // Listen for conversations
  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    setLoadingChats(true);
const unsub = listenConversations(user.id, async (snapshot) => {
      const conversationsPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const participants = data.participants || [];
        const otherId = participants.find((p: string) => p !== user.id) || '';
        
        if (!otherId) return null;

        const otherProfile = await getUserProfile(otherId);
        
        const lastMessageData = data.lastMessage;
        const lastMessage = lastMessageData ? {
            text: lastMessageData.text,
            type: lastMessageData.type,
            sender: lastMessageData.sender,
            time: lastMessageData.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
            seen: lastMessageData.seen || false,
        } : undefined;

        return {
          id: docSnap.id,
          participants,
          name: otherProfile?.displayName || 'Unknown User',
          avatar: otherProfile?.photoURL || '/default-avatar.png',
          isOnline: false,
          lastSeen: 'long ago',
          typing: false,
          messages: [],
          lastMessage: lastMessage,
          unreadCount: 0, // Will be calculated
        } as Chat;
      });

      const conversations = (await Promise.all(conversationsPromises)).filter(Boolean) as Chat[];
      // Merge with existing chats to preserve messages/unread counts
      setChats(prev => {
        const prevMap = new Map(prev.map(c => [c.id, c]));
        return conversations.map(chat => {
          const existing = prevMap.get(chat.id);
          return existing ? { ...existing, ...chat } : chat;
        });
      });
      setLoadingChats(false);
    });

    return () => unsub();
  }, [user]);

  // Listen for messages of the active chat
  useEffect(() => {
    if (!activeChat?.id || !user) return;

    setLoadingMessages(true);
    const unsub = listenMessages(activeChat.id, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender,
          text: data.text,
          media: data.media,
          seen: data.seen || false,
          reactions: data.reactions || [],
          replyTo: data.replyTo,
          createdAt: data.createdAt,
          time: data.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
        } as Message;
      });

      const unreadCount = messages.filter(m => !m.seen && m.sender !== user.id).length;

      setLoadingMessages(false);

      setChats(prevChats => prevChats.map(chat =>
        chat.id === activeChat.id ? { ...chat, messages, unreadCount } : chat
      ));
    });

    return () => unsub();
  }, [activeChat?.id, user]);

  // Mark messages as seen
  useEffect(() => {
    if (activeChat && user && activeChat.unreadCount > 0) {
      markMessagesSeen(activeChat.id, user.id);
    }
  }, [activeChat, user]);

  // Effects
  useEffect(() => {
    // Scroll to bottom on new messages
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Keep activeChat reference in sync with latest chats data
  useEffect(() => {
    if (!activeChat) return;
    const updated = chats.find(c => c.id === activeChat.id);
    if (updated && updated !== activeChat) {
      setActiveChat(updated);
    }
  }, [chats, activeChat]);

  useEffect(() => {
    // Cleanup recording on unmount
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
        audioRecorderRef.current.stop();
      }
    };
  }, []);

  // Handlers
    const handleSend = () => {
    if (!user || !activeChat) return;
    const text = message.trim();
    if (!text && !selectedMedia) return;

    const otherId = activeChat.participants.find((p: string) => p !== user.id) || '';
    if (!otherId) return;

    const tempId = `temp_${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      sender: user.id,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false,
      reactions: [],
      replyTo: replyingTo?.id,
    };
    
    if (selectedMedia) {
      const isVideo = selectedMedia.type.startsWith('video/');
      const isAudio = selectedMedia.type.startsWith('audio/');
      const type = isAudio ? 'audio' : isVideo ? 'video' : 'image';
      newMessage.media = {
        type: type,
        url: URL.createObjectURL(selectedMedia),
      };
    }

    // Optimistically update the UI
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChat.id
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
    
    // Send to backend
    if (selectedMedia) {
      const isVideo = selectedMedia.type.startsWith('video/');
      const isAudio = selectedMedia.type.startsWith('audio/');
      const type = isAudio ? 'audio' : isVideo ? 'video' : 'image';
      sendMediaMessage(user.id, otherId, selectedMedia, type, replyingTo?.id);
    }
    
    if (text) {
      sendTextMessage(user.id, otherId, text, replyingTo?.id);
    }

    // Reset input states
    setMessage('');
    setSelectedMedia(null);
    setReplyingTo(null);
    setShowEmoji(false);
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = file.type.startsWith('video/') ? 8 * 1024 * 1024 : 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedMedia(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setSelectedMedia(new File([blob], 'voice-message.ogg', { type: 'audio/ogg' }));
        setIsRecording(false);
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
        }
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChat.id
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, reactions: [...msg.reactions, emoji] }
                  : msg
              )
            }
          : chat
      )
    );
  };

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    setShowMobileChatRoom(true);
  };

  const renderMessage = (msg: Message) => {
    const isMine = msg.sender === user?.id;
    const messageClass = isMine ? styles.sent : styles.received;

    return (
      <motion.div
        key={msg.id}
        ref={(el: HTMLDivElement | null) => {
          if (el) messageBubbleRefs.current.set(msg.id, el);
        }}
        className={`${styles.messageBubble} ${messageClass}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, { offset }) => {
          if (offset.x > 50 && !isMine) setReplyingTo(msg);
          else if (offset.x < -50 && isMine) setReplyingTo(msg);
        }}
      >
        {msg.replyTo && (
          <motion.div
            className={styles.replyPreview}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {chats.find(c => c.id === activeChat?.id)?.messages.find(m => m.id === msg.replyTo)?.text || 'Original message'}
          </motion.div>
        )}

        <div className={styles.bubbleContent}>
          {msg.text && <p>{msg.text}</p>}
          
          {msg.media && (
            <div 
              className={styles.mediaContainer}
              onClick={() => setLightboxMedia(msg.media!)}
            >
              {msg.media.type === 'image' ? (
                <img src={msg.media.url} alt="" className={styles.mediaImg} />
              ) : msg.media.type === 'video' ? (
                <video
                  src={msg.media.url}
                  poster={msg.media.thumbnail}
                  controls
                  className={styles.mediaVid}
                />
              ) : (
                <audio
                  src={msg.media.url}
                  controls
                  className={styles.mediaAudio}
                />
              )}
            </div>
          )}
        </div>

        <div className={styles.messageInfo}>
          <span className={styles.timestamp}>{msg.time}</span>
          {isMine && <span className={styles.readStatus}>
            {msg.seen ? <FiCheckCircle /> : <FiCheck />}
          </span>}
        </div>

        {msg.reactions.length > 0 && (
          <div className={styles.reactions}>
            {msg.reactions.map((reaction, index) => (
              <span key={index} className={styles.reaction}>{reaction}</span>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={styles.messagesContainer}>
      <div className={`${styles.mainContent} ${showMobileChatRoom ? styles.showChatRoom : ''}`}>
        {/* Chat List */}
        <div className={styles.chatList}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search users..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.inboxList}>
            {filteredChats.length === 0 ? (
              <div className={styles.emptyInbox}>
                <h2>No whisper here yet.</h2>
                <p>Your next connection is just a message away.</p>
              </div>
            ) : (
              <AnimatePresence>
              {filteredChats.map(chat => (
                  <motion.div
                    key={chat.id}
                    className={`${styles.inboxCard} ${activeChat?.id === chat.id ? styles.active : ''}`}
                    onClick={() => handleChatSelect(chat)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.avatarWrap}>
                      <img src={chat.avatar} alt={chat.name} className={styles.avatar} />
                      <span className={chat.isOnline ? styles.online : styles.offline} />
                    </div>
                    <div className={styles.inboxInfo}>
                      <div className={styles.topRow}>
                        <h3>{chat.name}</h3>
                        <span className={styles.inboxTime}>
                          {chat.messages[chat.messages.length - 1]?.time || ''}
                        </span>
                      </div>
                      <p className={styles.lastMessage}>
                        {chat.typing ? 'typing...' : 
                         chat.messages[chat.messages.length - 1]?.text || 'No messages yet'}
                      </p>
                    </div>

                    {chat.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>
            )}
          </div>
        </div>

        {/* Chat Room */}
        {activeChat && (
          <div className={styles.chatRoom}>
            <div className={styles.roomHeader}>
              <button
                className={styles.mobileBack}
                onClick={() => setShowMobileChatRoom(false)}
              >
                <FiChevronLeft />
              </button>
              <div className={styles.avatarWrap}>
                <img src={activeChat.avatar} alt={activeChat.name} className={styles.avatar} />
                <span className={activeChat.isOnline ? styles.online : styles.offline} />
              </div>

              <div className={styles.roomInfo}>
                <h2>{activeChat.name}</h2>
                <p>{activeChat.isOnline ? 'Online' : `Last seen ${activeChat.lastSeen}`}</p>
              </div>

              <div className={styles.roomActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => alert('Voice calls coming soon!')}
                >
                  <FiPhone />
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => alert('Video calls coming soon!')}
                >
                  <FiVideo />
                </button>
                <button className={styles.actionButton}>
                  <FiMoreVertical />
                </button>
              </div>
            </div>

            <div className={styles.messagesArea}>
              <AnimatePresence>
                {activeChat.messages.length === 0 ? (
                 <p className={styles.emptyMessage}>No whisper here yet. Your next connection is just a message away.</p>
               ) : (
                 activeChat.messages.map(renderMessage)
               )}
              </AnimatePresence>
              <div ref={messageEndRef} />
            </div>

            {replyingTo && (
              <motion.div 
                className={styles.replyingTo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className={styles.replyPreview}>
                  Replying to: {replyingTo.text}
                </div>
                <button 
                  className={styles.actionButton}
                  onClick={() => setReplyingTo(null)}
                >
                  <FiX />
                </button>
              </motion.div>
            )}

            <div className={styles.inputArea}>
              <div className={styles.inputContainer}>
                <button 
                  className={styles.actionButton}
                  onClick={() => setShowEmoji(prev => !prev)}
                >
                  <FiSmile />
                </button>

                <input
                  type="text"
                  placeholder="Type a message…"
                  className={styles.input}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                />

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />

                <button
                  className={styles.actionButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip />
                </button>

                <button
                  className={styles.actionButton}
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                >
                  <FiMic />
                  {isRecording && <span className={styles.recordingTime}>
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>}
                </button>

                <button
                  className={`${styles.actionButton} ${styles.sendButton}`}
                  onClick={handleSend}
                  disabled={!message.trim() && !selectedMedia && !isRecording}
                >
                  <FiSend />
                </button>
              </div>

              {showEmoji && (
                <div className={styles.emojiPicker}>
                  <EmojiPicker
                    onEmojiClick={emoji => {
                      setMessage(prev => prev + emoji.emoji);
                      setShowEmoji(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      {/* Empty state when no chat selected */}
      {!activeChat && (
        <div className={styles.emptyState}>
          <h2>No whisper here yet.</h2>
          <p>Your next connection is just a message away.</p>
        </div>
      )}
      </div>

      {/* Lightbox for media */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMedia(null)}
          >
            <div 
              className={styles.lightboxContent}
              onClick={e => e.stopPropagation()}
            >
              {lightboxMedia.type === 'image' ? (
                <img 
                  src={lightboxMedia.url} 
                  alt="" 
                  className={styles.lightboxImage}
                />
              ) : (
                <video
                  src={lightboxMedia.url}
                  controls
                  className={styles.lightboxVideo}
                  autoPlay
                />
              )}
              <button 
                className={styles.lightboxClose}
                onClick={() => setLightboxMedia(null)}
              >
                <FiX />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
