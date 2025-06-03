import { useState, useEffect, useRef } from 'react';
import { User } from '../types/user';
import { Heart, X, Info, Flag, Shield, MapPin, MessageSquare } from 'lucide-react';
import styles from './MatchingPage.module.css';
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';

// Extended User type with additional properties for matching functionality
interface MatchUser extends User {
  distance: number;
  fullName?: string;
}

// Mock data - replace with actual API call
const mockUsers: MatchUser[] = [
  {
    id: '1',
    name: 'Sophia',
    fullName: 'Sophia Martinez',
    age: 27,
    gender: 'female',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80'
    ],
    bio: 'Passionate about art, travel, and meeting new people. Looking for someone who enjoys deep conversations and spontaneous adventures.',
    distance: 5,
    religion: 'Spiritual',
    job: 'UX Designer',
    education: 'Masters in Design',
    height: '165 cm',
    smoking: 'Never',
    drinking: 'Social',
    lookingFor: ['Relationship'],
    location: { city: 'San Francisco', state: 'CA' },
    interests: ['Art', 'Travel', 'Photography'],
    preferences: {
      minAge: 25,
      maxAge: 35,
      gender: ['male', 'non-binary']
    },
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Alex',
    fullName: 'Alexander Johnson',
    age: 30,
    gender: 'male',
    photos: [
      'https://images.unsplash.com/photo-1541647376583-8934aaf3448a?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80'
    ],
    bio: 'Tech enthusiast, amateur chef, and fitness buff. Love hiking and exploring new restaurants. Looking for someone who values growth and authenticity.',
    distance: 12,
    religion: 'Agnostic',
    job: 'Software Engineer',
    education: 'BS in Computer Science',
    height: '183 cm',
    smoking: 'Never',
    drinking: 'Occasional',
    lookingFor: ['Dating'],
    location: { city: 'San Francisco', state: 'CA' },
    interests: ['Technology', 'Cooking', 'Fitness'],
    preferences: {
      minAge: 25,
      maxAge: 35,
      gender: ['female', 'non-binary']
    },
    lastActive: new Date()
  },
  {
    id: '3',
    name: 'Emma',
    fullName: 'Emma Wilson',
    age: 25,
    gender: 'female',
    photos: [
      'https://images.unsplash.com/photo-1562003389-902303a38425?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80'
    ],
    bio: 'Book lover, coffee addict, and nature enthusiast. When not working, I\'m usually hiking or lost in a good book. Looking for genuine connections.',
    distance: 8,
    religion: 'Buddhist',
    job: 'Environmental Scientist',
    education: 'Masters in Environmental Science',
    height: '170 cm',
    smoking: 'Never',
    drinking: 'Rarely',
    lookingFor: ['Meaningful connection'],
    location: { city: 'Oakland', state: 'CA' },
    interests: ['Reading', 'Hiking', 'Environment'],
    preferences: {
      minAge: 23,
      maxAge: 32,
      gender: ['male', 'female']
    },
    lastActive: new Date()
  },
  {
    id: '4',
    name: 'Noah',
    fullName: 'Noah Thompson',
    age: 29,
    gender: 'male',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80'
    ],
    bio: 'Music producer by day, foodie by night. Looking for someone who appreciates art and isn\'t afraid to try new things. Let\'s explore the city together!',
    distance: 15,
    religion: 'None',
    job: 'Music Producer',
    education: 'Berklee College of Music',
    height: '178 cm',
    smoking: 'Never',
    drinking: 'Social',
    lookingFor: ['Dating', 'Relationship'],
    location: { city: 'Berkeley', state: 'CA' },
    interests: ['Music', 'Food', 'Traveling'],
    preferences: {
      minAge: 23,
      maxAge: 34,
      gender: ['female']
    },
    lastActive: new Date()
  },
  {
    id: '5',
    name: 'Olivia',
    fullName: 'Olivia Parker',
    age: 26,
    gender: 'female',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80'
    ],
    bio: 'Yoga instructor and plant enthusiast. Passionate about sustainable living and mindfulness. Looking for genuine connection with someone who values personal growth.',
    distance: 7,
    religion: 'Spiritual',
    job: 'Yoga Instructor',
    education: 'BA in Psychology',
    height: '163 cm',
    smoking: 'Never',
    drinking: 'Rarely',
    lookingFor: ['Relationship'],
    location: { city: 'Oakland', state: 'CA' },
    interests: ['Yoga', 'Sustainability', 'Psychology'],
    preferences: {
      minAge: 25,
      maxAge: 35,
      gender: ['male', 'female']
    },
    lastActive: new Date()
  }
];

interface MatchNotificationProps {
  user: MatchUser;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const MatchNotification = ({ user, onAccept, onDecline, onClose }: MatchNotificationProps) => {
  return (
    <div className={styles.matchNotification}>
      <div className={styles.matchContent}>
        <div className={styles.matchHeader}>
          <h2>It's a Match!</h2>
          <p>You and {user.name} have liked each other</p>
        </div>
        <div className={styles.matchImages}>
          <div className={styles.matchImageContainer}>
            <img 
              src="https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80" 
              alt="You" 
              className={styles.matchImage} 
            />
          </div>
          <div className={styles.matchImageContainer}>
            <img src={user.photos[0]} alt={user.name} className={styles.matchImage} />
          </div>
        </div>
        <div className={styles.matchActions}>
          <button onClick={onDecline} className={styles.declineButton}>
            Maybe Later
          </button>
          <button onClick={onAccept} className={styles.acceptButton}>
            <MessageSquare size={18} />
            Send Message
          </button>
        </div>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>
    </div>
  );
};

const MatchingPage = () => {
  const [users, setUsers] = useState<MatchUser[]>(mockUsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [swipesRemaining, setSwipesRemaining] = useState(20);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<MatchUser | null>(null);
  const [initialTouchY, setInitialTouchY] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return Math.round(distance);
  };

  // Get user's current location and filter users within 50km
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location:', latitude, longitude);
          
          // In a real app, you would fetch users from an API based on location
          // For now, we'll simulate filtering the mock users by distance
          const userCoords = { latitude, longitude };
          
          // Simulate different coordinates for mock users
          const mockCoordinates = [
            { latitude: latitude + 0.02, longitude: longitude + 0.01 }, // ~2-3km
            { latitude: latitude + 0.1, longitude: longitude + 0.05 },  // ~12km
            { latitude: latitude + 0.05, longitude: longitude + 0.02 }, // ~6km
            { latitude: latitude + 0.12, longitude: longitude + 0.08 }, // ~15km
            { latitude: latitude + 0.04, longitude: longitude - 0.03 }  // ~7km
          ];
          
          // Update users with calculated distances
          const usersWithDistance = mockUsers.map((user, index) => {
            const coords = mockCoordinates[index % mockCoordinates.length];
            const distance = calculateDistance(
              userCoords.latitude, 
              userCoords.longitude, 
              coords.latitude, 
              coords.longitude
            );
            return { ...user, distance };
          });
          
          // Filter users within 50km
          const nearbyUsers = usersWithDistance.filter(user => user.distance <= 50);
          setUsers(nearbyUsers);
          
          // Simulate API loading delay
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        },
        (error) => {
          // More detailed error logging with error code
          const errorMessage = error.code ? 
            `Error getting location: Code ${error.code} - ${error.message || 'Permission denied or timeout'}` : 
            'Error getting location: Unknown error';
          console.error(errorMessage);
          setLoading(false);
          // Fallback to mock data without distance filtering
          setUsers(mockUsers);
        },
        // Add options object with timeout and high accuracy settings
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 0 }
      );
    } else {
      setLoading(false);
      // Fallback to mock data without distance filtering
      setUsers(mockUsers);
    }
  }, []);

  // Load user swipe limit from local storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('swipeData');
    
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        setSwipesRemaining(data.remaining);
      } else {
        // Reset for new day
        localStorage.setItem('swipeData', JSON.stringify({ date: today, remaining: 20 }));
      }
    } else {
      localStorage.setItem('swipeData', JSON.stringify({ date: today, remaining: 20 }));
    }
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (swipesRemaining <= 0) {
      alert('You have used all your swipes for today. Come back tomorrow!');
      return;
    }

    if (cardRef.current) {
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(direction === 'right' ? [40] : [20, 30]);
      }
      
      // Add swipe animation class
      cardRef.current.classList.add(direction === 'right' ? styles.swipeRight : styles.swipeLeft);
      
      // Update swipe counter
      const newSwipesRemaining = swipesRemaining - 1;
      setSwipesRemaining(newSwipesRemaining);
      
      // Save to local storage
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('swipeData', JSON.stringify({ date: today, remaining: newSwipesRemaining }));

      // If swiping right (like), simulate a match 50% of the time
      if (direction === 'right' && Math.random() > 0.5) {
        setTimeout(() => {
          setMatchedUser(users[currentIndex]);
          setShowMatchNotification(true);
        }, 500);
      }

      // Wait for animation to complete before showing next card
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove(styles.swipeRight, styles.swipeLeft);
        }
        setCurrentIndex(prev => prev + 1);
        setExpanded(false);
      }, 500); // Increased from 300ms to match the animation duration
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setInitialTouchY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialTouchY === null) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = initialTouchY - currentY;
    
    // If swiping up more than 50px, expand the card
    if (diffY > 50 && !expanded) {
      setExpanded(true);
      setInitialTouchY(null);
    } else if (diffY < -50 && expanded) {
      setExpanded(false);
      setInitialTouchY(null);
    }
  };

  const handleTouchEnd = () => {
    setInitialTouchY(null);
  };

  const handleAcceptMatch = () => {
    setShowMatchNotification(false);
    if (matchedUser) {
      // Navigate to chat with this user
      navigate(`/chat/${matchedUser.id}`);
    }
  };

  const handleDeclineMatch = () => {
    setShowMatchNotification(false);
  };

  const handleReportUser = () => {
    // Implement report functionality
    if (currentIndex < users.length) {
      alert(`User ${users[currentIndex].name} has been reported. Thank you for helping keep our community safe.`);
    }
  };

  const handleBlockUser = () => {
    // Implement block functionality
    if (currentIndex < users.length) {
      alert(`User ${users[currentIndex].name} has been blocked.`);
      handleSwipe('left');
    }
  };

  const loadMoreProfiles = () => {
    setLoading(true);
    // Simulate API call to load more profiles
    setTimeout(() => {
      // In a real app, you would fetch more users from an API
      // Here we're just resetting to the original mock data
      setUsers(mockUsers);
      setCurrentIndex(0);
      setLoading(false);
    }, 1500);
  };

  // No profiles to display
  // Show loading screen when initially loading profiles
  if (loading && currentIndex === 0) {
    return (
      <div className={styles.noProfilesContainer}>
        <div className={styles.noProfilesContent}>
          <div className={styles.loadingSpinner}></div>
          <h2>Finding Matches</h2>
          <p>Discovering perfect matches within 50km of you...</p>
        </div>
      </div>
    );
  }
  
  // Show empty state when there are no profiles
  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className={styles.noProfilesContainer}>
        <div className={styles.noProfilesContent}>
          <h2>No New Profiles Nearby</h2>
          <p>We couldn't find any more people within 50km of your location.</p>
          <p>Try again later or expand your search criteria.</p>
          <button 
            onClick={loadMoreProfiles}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className={styles.matchingContainer}>
      <div className={styles.header}>
        <BackButton />
        <div className={styles.swipesCounter}>
          <Heart size={16} /> <span>{swipesRemaining} swipes left today</span>
        </div>
      </div>
      
      <div
        ref={cardRef}
        className={`${styles.profileCard} ${expanded ? styles.expanded : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.mainPhoto} style={{ backgroundImage: `url(${currentUser.photos[0]})` }}>
          <div className={styles.logo}>
            <span>Drifty</span>
          </div>
          
          <div className={styles.userInfo}>
            <h2>{currentUser.name}, {currentUser.age}</h2>
            <div className={styles.userMeta}>
              <span className={styles.gender}>{currentUser.gender}</span>
              <span className={styles.distance}>
                <MapPin size={14} />
                {currentUser.distance} km away
              </span>
            </div>
          </div>
          
          <div className={styles.swipeHint}>
            <span className={styles.swipeUp}>⬆ Swipe up for more details</span>
          </div>
        </div>
        
        {expanded && (
          <div className={styles.expandedContent}>
            <h3 className={styles.fullName}>{currentUser.fullName || currentUser.name}</h3>
            
            <div className={styles.profileSection}>
              <h4>About</h4>
              <p>{currentUser.bio}</p>
            </div>
            
            <div className={styles.profileSection}>
              <h4>Details</h4>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Height</span>
                  <span className={styles.detailValue}>{currentUser.height}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Religion</span>
                  <span className={styles.detailValue}>{currentUser.religion}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Job</span>
                  <span className={styles.detailValue}>{currentUser.job}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Education</span>
                  <span className={styles.detailValue}>{currentUser.education}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Smoking</span>
                  <span className={styles.detailValue}>{currentUser.smoking}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Drinking</span>
                  <span className={styles.detailValue}>{currentUser.drinking}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Looking for</span>
                  <span className={styles.detailValue}>{currentUser.lookingFor ? currentUser.lookingFor.join(', ') : ''}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.profileSection}>
              <h4>More Photos</h4>
              <div className={styles.photosGrid}>
                {currentUser.photos.slice(1).map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img 
                      src={photo} 
                      alt={`${currentUser.name} ${index + 2}`} 
                      loading="lazy" 
                      onError={(e) => {
                        // Fallback for broken images
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Photo+Not+Available';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.safetyTools}>
              <button onClick={handleReportUser} className={styles.reportButton}>
                <Flag size={16} /> Report
              </button>
              <button onClick={handleBlockUser} className={styles.blockButton}>
                <Shield size={16} /> Block
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.actionsContainer}>
  <div className={styles.actionGroup}>
    <button 
      onClick={() => handleSwipe('left')} 
      className={styles.actionButton}
      disabled={swipesRemaining <= 0}
      aria-label="Nope"
    >
      <X size={70} style={{ display: 'block', margin: '0 auto', color: '#ff4e8e', strokeWidth: 2.5 }} />
    </button>
    <span className={styles.actionLabel}>Nope</span>
  </div>
  <div className={styles.actionGroup}>
    <button
      onClick={() => setExpanded(!expanded)}
      className={styles.infoButton}
      aria-label="More Info"
    >
      <Info size={24} />
    </button>
    <span className={styles.actionLabel}>Info</span>
  </div>
  <div className={styles.actionGroup}>
    <button 
      onClick={() => handleSwipe('right')} 
      className={styles.actionButton}
      disabled={swipesRemaining <= 0}
      aria-label="Like"
    >
      <Heart size={70} style={{ display: 'block', margin: '0 auto', color: '#ff4e8e', strokeWidth: 2.5 }} />
    </button>
    <span className={styles.actionLabel}>Like</span>
  </div>
</div>
      
      {showMatchNotification && matchedUser && (
        <MatchNotification
          user={matchedUser}
          onAccept={handleAcceptMatch}
          onDecline={handleDeclineMatch}
          onClose={() => setShowMatchNotification(false)}
        />
      )}
    </div>
  );
};

export default MatchingPage;
