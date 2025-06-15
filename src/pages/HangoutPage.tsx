import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegCommentDots, FaHeart, FaFilter, FaCheck, FaTimes, FaInfoCircle, FaBan } from 'react-icons/fa';
import { IoMdSend, IoIosNotifications } from 'react-icons/io';
import { FiMapPin, FiClock, FiRefreshCw } from 'react-icons/fi';
import { BiMale, BiFemale } from 'react-icons/bi';
import { RiChatSmile3Line } from 'react-icons/ri';
import { MdMyLocation, MdLocationOff } from 'react-icons/md';
import axios from 'axios';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleUser } from '../types/auth';
import NotificationBell from '../components/notifications/NotificationBell';
import { hangoutService } from '../services/hangoutService';
import { Location } from '../types/hangout';
import styles from './HangoutPage.module.css';

interface User {
  id: string;
  name: string;
  age: number;
  distance: number;
  photo: string;
  availabilityReason: string;
  availabilityDuration: string;
  religion?: string;
  height?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  lastActive?: string;
}

// Logo component
const DriftyLogo: React.FC = () => (
  <div className={styles.logoContainer}>
    <span className={styles.driftyLogo}>Drifty</span>
  </div>
);

const HangoutPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isAvailable, setIsAvailable] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [availabilityReason, setAvailabilityReason] = useState('');
  const [availabilityDuration, setAvailabilityDuration] = useState('1 hour');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [distanceFilter, setDistanceFilter] = useState<5 | 10 | 30>(30);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestSuccessPopup, setShowRequestSuccessPopup] = useState(false);

  // Function to get user's location
  const getUserLocation = useCallback(async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);

  // Function to fetch nearby users
  const fetchNearbyUsers = useCallback(async () => {
    if (!userLocation || !user?.id) return;

    try {
      const nearbyUsers = await hangoutService.getNearbyUsers(
        userLocation,
        distanceFilter,
        genderFilter
      );
      setFilteredUsers(nearbyUsers);
      setNetworkError(null);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      setNetworkError('Failed to fetch nearby users. Please try again.');
    }
  }, [userLocation, distanceFilter, genderFilter, user]);

  // Effect to update availability
  useEffect(() => {
    const updateAvailability = async () => {
      if (!user?.id || !userLocation) return;

      try {
        await hangoutService.updateAvailability(user.id, {
          isAvailable,
          reason: availabilityReason,
          duration: availabilityDuration,
          location: {
            lat: userLocation.lat,
            lng: userLocation.lng
          }
        });

        if (isAvailable) {
          fetchNearbyUsers();
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Error updating availability:', error);
        setNetworkError('Failed to update availability. Please try again.');
      }
    };

    updateAvailability();
  }, [isAvailable, availabilityReason, availabilityDuration, userLocation, user, fetchNearbyUsers]);

  // Effect to get initial location
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLocating(true);
      try {
        await getUserLocation();
        setLocationError(null);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Failed to get your location. Please enable location services.');
      } finally {
        setIsLocating(false);
      }
    };

    initializeLocation();
  }, [getUserLocation]);

  // Effect to refetch users when filters change
  useEffect(() => {
    if (isAvailable && userLocation) {
      fetchNearbyUsers();
    }
  }, [isAvailable, genderFilter, distanceFilter, userLocation, fetchNearbyUsers]);

  // Clean up effect
  useEffect(() => {
    return () => {
      if (isAvailable && user?.id && userLocation) {
        hangoutService.updateAvailability(user.id, {
          isAvailable: false,
          reason: '',
          duration: '',
          location: {
            lat: userLocation.lat,
            lng: userLocation.lng
          }
        });
      }
    };
  }, [isAvailable, user, userLocation]);

  // Modify existing functions to use the new functionality
  const handleAvailabilitySubmit = async () => {
    if (!availabilityReason.trim()) return;
    setIsAvailable(true);
    setShowReasonPopup(false);
  };

  const handleEndHangout = async () => {
    setIsAvailable(false);
    setFilteredUsers([]);
  };

  // Initialize and set up the page
  useEffect(() => {
    // Apply the app's theme styling
    document.body.style.overflow = 'auto';
    document.body.style.background = 'linear-gradient(135deg, #FF4E8E 0%, #7B2FF6 100%)';
    
    return () => {
      // Clean up styles when component unmounts
      document.body.style.overflow = '';
      document.body.style.background = '';
    };
  }, [location.search]);
  
  // Filter users whenever criteria changes
  useEffect(() => {
    if (!isAvailable) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = filteredUsers.filter(user => {
      // Filter by distance
      if (user.distance > distanceFilter) return false;
      
      // Filter by gender
      if (genderFilter !== 'all' && user.gender !== genderFilter) return false;
      
      return true;
    });
    
    setFilteredUsers(filtered);
  }, [isAvailable, genderFilter, distanceFilter]);
  
  const handleAvailabilityToggle = async () => {
    if (!isAvailable) {
      // First check if we have the location before showing reason popup
      if (!userLocation) {
        try {
          await getUserLocation();
          // Only show popup if we successfully got location
          setShowReasonPopup(true);
        } catch (error) {
          // Error is already handled in getUserLocation function
          return;
        }
      } else {
        // We already have location, show the popup
        setShowReasonPopup(true);
      }
    } else {
      // Disable availability immediately and update server
      setIsAvailable(false);
      setAvailabilityReason('');
      setAvailabilityDuration('1 hour');
      
      // Server update will be handled by the effect
    }
  };

  const handleReasonSubmit = () => {
    if (availabilityReason.trim()) {
      // Set local state first for immediate UI feedback
      setIsAvailable(true);
      setShowReasonPopup(false);
      
      // Server update will be handled by the effect
    }
  };
  
  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setRequestMessage('');
  };

  return (
    <div className={styles.hangoutContainer}>
      {/* Logo and top bar */}
      <div className={styles.topBar}>
        <DriftyLogo />
        
        {/* Top Bar Actions - Removed notification bell and refresh button */}
        <div className={styles.topBarActions}>
          {/* Empty to maintain layout */}
        </div>
      </div>
      
      {/* Error Messages */}
      {networkError && (
        <div className={styles.errorBanner}>
          <FaInfoCircle /> {networkError}
          <button onClick={() => setNetworkError(null)} className={styles.dismissError}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {locationError && (
        <div className={styles.errorBanner}>
          <FaInfoCircle /> {locationError}
          <button onClick={() => setLocationError(null)} className={styles.dismissError}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {/* Hangout Requests Section has been removed */}
      
      {/* Floating requests notification button has been removed */}
      
      {/* Hangout Availability Toggle */}
      <div className={styles.toggleContainer}>
        <h2 className={styles.toggleTitle}>Start a Hangout</h2>
        <div className={styles.locationStatus}>
          {userLocation ? (
            <span className={styles.locationDetected}>
              <MdMyLocation /> Location detected
            </span>
          ) : (
            <span className={styles.locationNotDetected}>
              <MdLocationOff /> Location required to be available
            </span>
          )}
          {isLocating && <span className={styles.locating}>Detecting location...</span>}
        </div>
        <div className={styles.toggleWrapper}>
          <div className={styles.toggleLabel}>{isAvailable ? "I'm Available" : "I'm Not Available"}</div>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={isAvailable} 
              onChange={handleAvailabilityToggle}
              disabled={showReasonPopup || isLocating}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
        
        {isAvailable && (
          <div className={styles.availabilityDetails}>
            <div className={styles.availabilityReason}>
              <p className={styles.reasonLabel}>Why are you hanging out? <RiChatSmile3Line /></p>
              <p className={styles.reasonValue}>{availabilityReason}</p>
            </div>
            <div className={styles.availabilityDuration}>
              <p className={styles.durationLabel}>Available for <FiClock /></p>
              <p className={styles.durationValue}>{availabilityDuration}</p>
            </div>
          </div>
        )}
        
        {isAvailable && (
          <div className={styles.filterSection}>
            <button 
              className={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filters
            </button>
            
            {showFilters && (
              <div className={styles.filtersContainer}>
                <div className={styles.filterGroup}>
                  <h3>Gender</h3>
                  <div className={styles.filterOptions}>
                    <button 
                      className={`${styles.filterOption} ${genderFilter === 'all' ? styles.active : ''}`}
                      onClick={() => setGenderFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`${styles.filterOption} ${genderFilter === 'male' ? styles.active : ''}`}
                      onClick={() => setGenderFilter('male')}
                    >
                      <BiMale /> Male
                    </button>
                    <button 
                      className={`${styles.filterOption} ${genderFilter === 'female' ? styles.active : ''}`}
                      onClick={() => setGenderFilter('female')}
                    >
                      <BiFemale /> Female
                    </button>
                  </div>
                </div>
                
                <div className={styles.filterGroup}>
                  <h3>Distance</h3>
                  <div className={styles.filterOptions}>
                    <button 
                      className={`${styles.filterOption} ${distanceFilter === 5 ? styles.active : ''}`}
                      onClick={() => setDistanceFilter(5)}
                    >
                      5 km
                    </button>
                    <button 
                      className={`${styles.filterOption} ${distanceFilter === 10 ? styles.active : ''}`}
                      onClick={() => setDistanceFilter(10)}
                    >
                      10 km
                    </button>
                    <button 
                      className={`${styles.filterOption} ${distanceFilter === 30 ? styles.active : ''}`}
                      onClick={() => setDistanceFilter(30)}
                    >
                      30 km
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Availability Reason Popup */}
      {showReasonPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>Why are you available?</h3>
            <p>Let others know what you're looking for</p>
            <textarea
              className={styles.reasonInput}
              value={availabilityReason}
              onChange={(e) => setAvailabilityReason(e.target.value)}
              placeholder="I'm free for coffee and conversation..."
              maxLength={100}
            />
            
            <div className={styles.durationSelector}>
              <h4><FiClock /> How long will you be available?</h4>
              <div className={styles.durationOptions}>
                <button 
                  className={`${styles.durationOption} ${availabilityDuration === '1 hour' ? styles.active : ''}`}
                  onClick={() => setAvailabilityDuration('1 hour')}
                >
                  1 hour
                </button>
                <button 
                  className={`${styles.durationOption} ${availabilityDuration === '2 hours' ? styles.active : ''}`}
                  onClick={() => setAvailabilityDuration('2 hours')}
                >
                  2 hours
                </button>
                <button 
                  className={`${styles.durationOption} ${availabilityDuration === '3 hours' ? styles.active : ''}`}
                  onClick={() => setAvailabilityDuration('3 hours')}
                >
                  3 hours
                </button>
                <button 
                  className={`${styles.durationOption} ${availabilityDuration === 'Full day' ? styles.active : ''}`}
                  onClick={() => setAvailabilityDuration('Full day')}
                >
                  Full day
                </button>
              </div>
            </div>
            
            <div className={styles.popupActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowReasonPopup(false)}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleReasonSubmit}
                disabled={!availabilityReason.trim()}
              >
                Start Hangout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show notification of request success */}
      {showRequestSuccessPopup && (
        <div className={styles.successPopup}>
          <FaCheck size={24} />
          <p>Hangout request sent successfully!</p>
        </div>
      )}

      {/* Nearby Users Feed */}
      {isAvailable && (
        <div className={styles.nearbyUsersContainer}>
          <h2 className={styles.sectionTitle}>
            People Available Nearby
          </h2>
          
          {filteredUsers.length > 0 ? (
            <div className={styles.usersGrid}>
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className={styles.userCard}
                  onClick={() => openUserProfile(user)}
                >
                  <div 
                    className={styles.userPhoto} 
                    style={{ backgroundImage: `url(${user.photo})` }}
                  >
                    <div className={styles.userGender}>
                      {user.gender === 'male' ? <BiMale size={16} /> : <BiFemale size={16} />}
                    </div>
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{user.name}, {user.age}</h3>
                    <div className={styles.distanceInfo}>
                      <FiMapPin size={14} />
                      <span>{user.distance} km away</span>
                    </div>
                    <div className={styles.durationInfo}>
                      <FiClock size={14} />
                      <span>{user.availabilityDuration}</span>
                    </div>
                    <p className={styles.availabilityReason}>
                      {user.availabilityReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noUsersMessage}>
              <p>No one available nearby matching your filters.</p>
              <p>Try expanding your search distance or changing filters.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Expanded User Profile Popup */}
      {selectedUser && (
        <div className={styles.popupOverlay}>
          <div className={styles.expandedUserCard}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedUser(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div
              className={styles.expandedUserPhoto}
              style={{ backgroundImage: `url(${selectedUser.photo})` }}
            >
              <div className={styles.userGenderLarge}>
                {selectedUser.gender === 'male' ? <BiMale size={24} /> : <BiFemale size={24} />}
              </div>
            </div>
            <div className={styles.expandedUserInfo}>
              <h2>{selectedUser.name}, {selectedUser.age}</h2>
              <div className={styles.userDetailRow}>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Distance:</span>
                  <span>{selectedUser.distance} km</span>
                </div>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Available for:</span>
                  <span>{selectedUser.availabilityDuration}</span>
                </div>
              </div>
              <div className={styles.userDetailRow}>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Religion:</span>
                  <span>{selectedUser.religion || 'Not specified'}</span>
                </div>
                <div className={styles.userDetail}>
                  <span className={styles.detailLabel}>Height:</span>
                  <span>{selectedUser.height || 'Not specified'}</span>
                </div>
              </div>
              <div className={styles.bioSection}>
                <h3>Bio</h3>
                <p>{selectedUser.bio || 'No bio available'}</p>
              </div>
              <div className={styles.availabilitySection}>
                <h3>Available For</h3>
                <p>{selectedUser.availabilityReason}</p>
              </div>
              <div className={styles.requestSection}>
                <textarea
                  className={styles.requestMessage}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Send a message with your hangout request..."
                ></textarea>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.chatButton}
                    onClick={() => navigate(`/chat/${selectedUser.id}`)}
                  >
                    <FaRegCommentDots size={18} />
                    Chat
                  </button>
                  <button
                    className={styles.sendRequestButton}
                    onClick={() => {
                      if (!user || !selectedUser) return;
                      
                      axios.post('/api/hangouts/requests', {
                        recipientId: selectedUser.id,
                        message: requestMessage,
                      }, {
                        headers: { Authorization: `Bearer ${user.token}` }
                      })
                      .then(response => {
                        if (response.data.success) {
                          // Show success popup
                          setShowRequestSuccessPopup(true);
                          
                          // Show success notification only
                          
                          // Automatically close after 3 seconds
                          setTimeout(() => {
                            setShowRequestSuccessPopup(false);
                            setSelectedUser(null);
                          }, 3000);
                        }
                      })
                      .catch(error => {
                        console.error('Error sending hangout request:', error);
                        setNetworkError('Failed to send hangout request. Please try again.');
                      });
                    }}
                    disabled={!requestMessage.trim()}
                  >
                    <FaRegCommentDots size={18} />
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HangoutPage;
