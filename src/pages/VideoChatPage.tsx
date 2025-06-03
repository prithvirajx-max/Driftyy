import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaArrowLeft, FaPaperPlane, FaCommentAlt, FaSync, FaUserPlus, FaForward, FaCheck, FaTimes } from 'react-icons/fa';
import { createGlobalStyle } from 'styled-components';

// List of Indian cities for the filter
const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara'
];

// Global styles for the video chat page
const GlobalStyle = createGlobalStyle`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #FF4E8E;
    cursor: pointer;
    margin-top: -6px;
  }
  
  .gender-option {
    flex: 1;
    padding: 10px;
    text-align: center;
    border-radius: 20px;
    background: #f0f0f0;
    cursor: pointer;
    margin: 0 5px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .gender-option.selected {
    background: linear-gradient(135deg, #FF4E8E 0%, #FF8EC2 100%);
    color: white;
    border-color: white;
    transform: scale(1.05);
  }
  
  .gender-options {
    display: flex;
    margin: 15px 0;
    width: 100%;
  }
  
  .video-chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background: transparent;
    position: relative;
    font-family: 'Poppins', sans-serif;
  }
  
  .intro-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    max-width: 500px;
    margin: 0 auto;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    animation: fadeIn 0.5s ease;
    text-align: center;
    position: relative;
    z-index: 1;
    margin-top: 50px;
  }
  
  .start-matching-btn {
    margin-top: 30px;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(135deg, #FF4E8E 0%, #9867C5 100%);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    animation: pulse 2s infinite;
  }
  
  .start-matching-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
  }
  
  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.7);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .back-button:hover {
    background: white;
    transform: scale(1.1);
  }
  
  .video-chat-interface {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px;
    animation: fadeIn 0.5s ease;
    overflow: hidden;
    justify-content: space-between;
  }
  
  .remote-video-container {
    flex: 1;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    height: 45vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .local-video-container {
    flex: 1;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 45vh;
    justify-content: center;
    align-items: center;
  }
  
  .emoji-reactions {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    z-index: 10;
  }
  
  .emoji-button {
    background: rgba(255, 255, 255, 0.7);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    margin: 0 5px;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .emoji-button:hover {
    transform: scale(1.2);
  }
  
  .emoji-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 100;
  }
  
  .animated-emoji {
    font-size: 100px;
    animation: emojiAnimation 2s ease-out;
    opacity: 0;
  }
  
  @keyframes emojiAnimation {
    0% { transform: scale(0.5); opacity: 0; }
    20% { transform: scale(1.5); opacity: 0.9; }
    80% { transform: scale(1.5); opacity: 0.9; }
    100% { transform: scale(2); opacity: 0; }
  }
  
  .age-sliders {
    width: 100%;
    margin: 10px 0;
  }
  
  .age-sliders > div {
    margin-bottom: 15px;
  }
  
  .remote-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 20px;
    max-height: 100%;
    max-width: 100%;
  }
  
  .local-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 20px;
    max-height: 100%;
    max-width: 100%;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    animation: slideUp 0.5s ease;
  }
  
  .control-button {
    background: rgba(255, 255, 255, 0.7);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    margin: 0 10px;
    font-size: 20px;
    position: relative;
  }
  
  .button-tooltip {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    pointer-events: none;
  }
  
  .control-button:hover .button-tooltip {
    opacity: 1;
  }
  
  .control-buttons-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 15px;
    z-index: 100;
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 20px;
    border-radius: 30px;
  }
  
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  .friend-request-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }
  
  .friend-request-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .accept-button, .decline-button {
    padding: 8px 15px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
  }
  
  .accept-button {
    background: #4CAF50;
    color: white;
  }
  
  .decline-button {
    background: #f44336;
    color: white;
  }
  
  .control-button:hover {
    background: white;
    transform: scale(1.1);
  }
  
  .control-button.disabled {
    background: #ff4e8e;
    color: white;
  }
  
  .user-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    animation: slideUp 0.5s ease;
  }
  
  .user-name {
    font-weight: 600;
    margin-right: 10px;
  }
  
  .user-location {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  
  .chat-container {
    position: absolute;
    bottom: 80px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease;
    z-index: 100;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
  }
  
  .chat-input {
    display: flex;
    padding: 10px;
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
  }
  
  .message-input {
    flex: 1;
    border: none;
    border-radius: 20px;
    padding: 10px 15px;
    margin-right: 10px;
    background: white;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  }
  
  .send-button {
    border: none;
    background: linear-gradient(135deg, #FF4E8E 0%, #9867C5 100%);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .send-button:hover {
    transform: scale(1.1);
  }
  
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #FF4E8E;
    animation: spin 1s infinite linear;
  }
  
  .message {
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 18px;
    max-width: 80%;
    word-wrap: break-word;
  }
  
  .message.sent {
    background: linear-gradient(135deg, #FF4E8E 0%, #9867C5 100%);
    color: white;
    align-self: flex-end;
    margin-left: auto;
    border-bottom-right-radius: 5px;
  }
  
  .message.received {
    background: #f0f0f0;
    color: #333;
    align-self: flex-start;
    margin-right: auto;
    border-bottom-left-radius: 5px;
  }
  
  .typing-indicator {
    display: flex;
    padding: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
    margin: 0 2px;
    animation: pulse 1s infinite;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  select {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    background: white;
    width: 100%;
    max-width: 300px;
    margin: 10px 0;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

// Random user data for demonstration
const randomUsers = [
  {
    id: 1,
    name: 'Priya',
    age: 25,
    location: 'Mumbai',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    id: 2,
    name: 'Rahul',
    age: 28,
    location: 'Delhi',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    id: 3,
    name: 'Ananya',
    age: 24,
    location: 'Bangalore',
    profilePic: 'https://randomuser.me/api/portraits/women/3.jpg'
  },
  {
    id: 4,
    name: 'Vikas',
    age: 30,
    location: 'Hyderabad',
    profilePic: 'https://randomuser.me/api/portraits/men/4.jpg'
  }
];

const VideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for the intro page
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  
  // State for video chat
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const [showFriendRequest, setShowFriendRequest] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Prefetch the fallback video canvas when component loads
  useEffect(() => {
    // Create a hidden canvas for potential fallback
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw something on it to make it ready
      ctx.fillStyle = '#FF4E8E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Handle starting the matching process
  const handleStartMatching = () => {
    setHasStartedMatching(true);
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Filter users based on gender and city filters (in a real app, this would be server-side)
      const filteredUsers = randomUsers.filter(user => {
        const genderMatch = genderFilter === 'all' || 
          (genderFilter === 'male' && user.id % 2 === 0) ||
          (genderFilter === 'female' && user.id % 2 !== 0);
        
        const cityMatch = cityFilter === 'all' || user.location === cityFilter;
        
        // Age match - compare with the user's age
        const ageMatch = user.age >= minAge && user.age <= maxAge;
        
        return genderMatch && cityMatch && ageMatch;
      });
      
      // Select a random user from filtered results
      if (filteredUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredUsers.length);
        setCurrentUser(filteredUsers[randomIndex]);
      } else {
        // If no users match criteria, use any random user
        const randomIndex = Math.floor(Math.random() * randomUsers.length);
        setCurrentUser(randomUsers[randomIndex]);
      }
      
      setIsLoading(false);
    }, 2000);
    
    // Get user media for local video
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: cameraType },
      audio: true 
    })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Simulate remote user video using canvas animation instead of external video
        if (remoteVideoRef.current) {
          // Create a canvas for simulation
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Create a simulated video stream using canvas animation
            let hue = 0;
            const drawFrame = () => {
              // Create a gradient background that slowly changes color
              hue = (hue + 0.5) % 360;
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
              gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 60%)`);
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Draw a simulated person silhouette
              ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
              // Head
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 3, 70, 0, Math.PI * 2);
              ctx.fill();
              // Body
              ctx.beginPath();
              ctx.moveTo(canvas.width / 2 - 50, canvas.height / 3 + 70);
              ctx.lineTo(canvas.width / 2 + 50, canvas.height / 3 + 70);
              ctx.lineTo(canvas.width / 2 + 80, canvas.height);
              ctx.lineTo(canvas.width / 2 - 80, canvas.height);
              ctx.closePath();
              ctx.fill();
              
              // Add some text
              ctx.fillStyle = 'white';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Remote User', canvas.width / 2, canvas.height - 50);
              
              requestAnimationFrame(drawFrame);
            };
            
            drawFrame();
            
            // Set the canvas stream as the video source
            const stream = canvas.captureStream(30); // 30 fps
            remoteVideoRef.current.srcObject = stream;
          }
        }
      })
      .catch(() => {
        console.warn('Could not access camera/microphone. Using fallback video.'); // More user-friendly error
        // Create a fallback video stream using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw a gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#FF4E8E');
          gradient.addColorStop(1, '#9867C5');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw camera disabled text
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Camera access denied', canvas.width / 2, canvas.height / 2);
          
          // Create a stream from the canvas
          const stream = canvas.captureStream(30); // 30 fps
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // Simulate remote user video using canvas animation
          if (remoteVideoRef.current) {
            // Create a canvas for simulation
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Create a simulated video stream using canvas animation
              let hue = 180; // Start with a different color
              const drawFrame = () => {
                // Create a gradient background that slowly changes color
                hue = (hue + 0.5) % 360;
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
                gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 60%)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw a simulated person silhouette
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                // Head
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 3, 70, 0, Math.PI * 2);
                ctx.fill();
                // Body
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 50, canvas.height / 3 + 70);
                ctx.lineTo(canvas.width / 2 + 50, canvas.height / 3 + 70);
                ctx.lineTo(canvas.width / 2 + 80, canvas.height);
                ctx.lineTo(canvas.width / 2 - 80, canvas.height);
                ctx.closePath();
                ctx.fill();
                
                // Add some text
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Remote User', canvas.width / 2, canvas.height - 50);
                
                requestAnimationFrame(drawFrame);
              };
              
              drawFrame();
              
              // Set the canvas stream as the video source
              const stream = canvas.captureStream(30); // 30 fps
              remoteVideoRef.current.srcObject = stream;
            }
          }
        }
      });
  };
  
  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Toggle audio on/off
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };
  
  // State for notification feedback
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // State for emoji reactions
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<string>('user'); // 'user' for front camera, 'environment' for back camera
  
  // Send friend request
  const sendFriendRequest = () => {
    // Show feedback notification to the sender
    setNotificationMessage('Friend request sent!');
    setShowNotification(true);
    
    // Simulate receiving a friend request notification on the other side
    // In a real app, this would be handled by the server
    setTimeout(() => {
      setNotificationMessage('New friend request received from ' + currentUser?.name);
      setShowNotification(true);
    }, 1000);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };
  
  // Handle friend request response
  const handleFriendRequestResponse = (accepted: boolean) => {
    setShowFriendRequest(false);
    
    // Show notification to the user who received the request
    if (accepted) {
      setNotificationMessage('Friend request accepted!');
      // In a real app, you would update the friends list here
    } else {
      setNotificationMessage('Friend request declined');
    }
    
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };
  
  // Find next match
  const findNextMatch = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Get a random user that's different from the current one
      let nextUser;
      do {
        const randomIndex = Math.floor(Math.random() * randomUsers.length);
        nextUser = randomUsers[randomIndex];
      } while (nextUser && currentUser && nextUser.id === currentUser.id);
      
      setCurrentUser(nextUser);
      setIsLoading(false);
      setMessages([]);
    }, 1500);
  };
  
  // Send a message
  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = { text: messageInput, sent: true };
      setMessages([...messages, newMessage]);
      setMessageInput('');
      
      // Simulate receiving a response
      setTimeout(() => {
        const responses = [
          'Hi there! How are you?',
          'Nice to meet you!',
          'What are your hobbies?',
          'I like your profile!',
          'That sounds interesting!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { text: randomResponse, sent: false }]);
      }, 1000 + Math.random() * 2000);
    }
  };
  
  // Send emoji reaction
  const sendEmoji = (emoji: string) => {
    setShowEmoji(emoji);
    
    // Hide emoji after animation duration
    setTimeout(() => {
      setShowEmoji(null);
    }, 2000);
  };
  
  // Toggle between front and back camera
  const toggleCamera = () => {
    // Stop current stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Set new camera type
    const newCameraType = cameraType === 'user' ? 'environment' : 'user';
    setCameraType(newCameraType);
    
    // Get new stream with updated camera
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: newCameraType },
      audio: isAudioEnabled 
    })
    .then(stream => {
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    })
    .catch(error => {
      console.error('Error switching camera:', error);
    });
  };
  
  // Cleanup function to stop media streams when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);
  
  return (
    <>
      <GlobalStyle />
      <div className="video-chat-container">
        {!hasStartedMatching ? (
          // Intro page with filters
          <div className="intro-container">
            <h1>Video Chat</h1>
            <p>Connect with the world! Talk to strangers, make new friends, and have fun conversations.</p>
            
            <div>
              <h3>I want to meet:</h3>
              <div className="gender-options">
                <div 
                  className={`gender-option ${genderFilter === 'all' ? 'selected' : ''}`}
                  onClick={() => setGenderFilter('all')}
                >
                  Everyone
                </div>
                <div 
                  className={`gender-option ${genderFilter === 'male' ? 'selected' : ''}`}
                  onClick={() => setGenderFilter('male')}
                >
                  Men
                </div>
                <div 
                  className={`gender-option ${genderFilter === 'female' ? 'selected' : ''}`}
                  onClick={() => setGenderFilter('female')}
                >
                  Women
                </div>
              </div>
            </div>
            
            <div>
              <h3>Location:</h3>
              <select 
                value={cityFilter} 
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="all">All of India</option>
                {indianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="age-sliders">
              <h3>Age Range: {minAge} - {maxAge}</h3>
              <div>
                <label>Minimum Age: {minAge}</label>
                <input 
                  type="range" 
                  min="18" 
                  max="60" 
                  value={minAge}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setMinAge(value);
                    if (value > maxAge) {
                      setMaxAge(value);
                    }
                  }}
                />
              </div>
              <div>
                <label>Maximum Age: {maxAge}</label>
                <input 
                  type="range" 
                  min="18" 
                  max="60" 
                  value={maxAge}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setMaxAge(value > minAge ? value : minAge);
                  }}
                />
              </div>
            </div>
            
            <button 
              className="start-matching-btn"
              onClick={handleStartMatching}
            >
              Start Matching
            </button>
          </div>
        ) : (
          // Video chat interface
          <div className="video-chat-interface">
            {/* Remote user video (top) */}
            <div className="remote-video-container">
              {isLoading && <div className="loading-spinner"></div>}
              <video 
                ref={remoteVideoRef}
                className="remote-video"
                autoPlay
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              ></video>
              
              {/* Emoji overlay for animations */}
              {showEmoji && (
                <div className="emoji-overlay">
                  <div className="animated-emoji">{showEmoji}</div>
                </div>
              )}
              
              {currentUser && !isLoading && (
                <div className="user-info">
                  <div>
                    <span className="user-name">{currentUser.name}, {currentUser.age}</span>
                    <div className="user-location">
                      <FaMapMarkerAlt style={{ marginRight: '5px' }} />
                      {currentUser.location}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Local video (bottom) */}
            <div className="local-video-container">
              <video 
                ref={localVideoRef}
                className="local-video"
                autoPlay
                playsInline
                muted
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              ></video>
              
              {/* Control buttons */}
              <div className="control-buttons-container">
                <button 
                  className="control-button"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  <span className="button-tooltip">Camera</span>
                </button>
                
                <button 
                  className="control-button"
                  onClick={toggleCamera}
                >
                  <FaSync />
                  <span className="button-tooltip">Switch Camera</span>
                </button>
                
                <button 
                  className="control-button"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                >
                  <FaCommentAlt />
                  <span className="button-tooltip">Message</span>
                </button>
                
                <button 
                  className="control-button"
                  onClick={findNextMatch}
                  style={{ background: '#FF4E8E', color: 'white' }}
                >
                  <FaForward />
                  <span className="button-tooltip">Next</span>
                </button>
                
                <button 
                  className="control-button"
                  onClick={sendFriendRequest}
                  style={{ background: '#4267B2', color: 'white' }}
                >
                  <FaUserPlus />
                  <span className="button-tooltip">Add Friend</span>
                </button>
              </div>
              
              {/* Emoji reactions */}
              <div className="emoji-reactions">
                <button className="emoji-button" onClick={() => sendEmoji('❤️')}>❤️</button>
                <button className="emoji-button" onClick={() => sendEmoji('😊')}>😊</button>
                <button className="emoji-button" onClick={() => sendEmoji('👋')}>👋</button>
                <button className="emoji-button" onClick={() => sendEmoji('👍')}>👍</button>
                <button className="emoji-button" onClick={() => sendEmoji('🔥')}>🔥</button>
              </div>
              

              
              {/* Notification */}
              {showNotification && (
                <div className="notification">
                  {notificationMessage}
                </div>
              )}
            </div>
            
            {/* Chat container */}
            {isChatOpen && (
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sent ? 'sent' : 'received'}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                
                <div className="chat-input">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="send-button" onClick={sendMessage}>
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Back button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
      </div>
    </>
  );
};

export default VideoChatPage;
