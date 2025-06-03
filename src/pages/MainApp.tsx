import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainApp.module.css';
import { Heart, MessageSquare, User as UserIcon, Settings } from 'lucide-react';

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize the app
    // Removed overflow hidden to allow scrolling
    return () => {};
  }, []);
  
  const handleStartMatching = () => {
    navigate('/matching');
  };
  
  return (
    <div className={styles.appContainer}>
      <div className={styles.header}>
        <h1>Drifty</h1>
        <button onClick={() => navigate('/profile')} className={styles.profileButton}>
          <UserIcon size={20} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.welcomeCard}>
          <h2>Find Your Perfect Match</h2>
          <p>Start swiping and discover people with similar interests near you</p>
          
          <button 
            onClick={handleStartMatching} 
            className={styles.startMatchingButton}
          >
            <Heart size={20} />
            Start Matching
          </button>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>20</div>
            <div className={styles.statLabel}>Daily Swipes</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>3</div>
            <div className={styles.statLabel}>New Matches</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>8</div>
            <div className={styles.statLabel}>Messages</div>
          </div>
        </div>
      </div>

      <div className={styles.navBar}>
        <button className={`${styles.navButton} ${styles.active}`}>
          <Heart size={24} />
          <span>Discover</span>
        </button>
        <button onClick={() => navigate('/messages')} className={styles.navButton}>
          <MessageSquare size={24} />
          <span>Messages</span>
        </button>
        <button onClick={() => navigate('/profile')} className={styles.navButton}>
          <UserIcon size={24} />
          <span>Profile</span>
        </button>
        <button className={styles.navButton}>
          <Settings size={24} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default MainApp;
