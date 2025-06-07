import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/auth/AuthModal';
import styles from './HomePage.module.css';
import { motion } from 'framer-motion';
import { FaUserFriends, FaVideo, FaComments, FaBolt, FaInstagram, FaYoutube, FaFacebook, FaUser, FaRegStar, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LogoutConfirmationDialog from '../components/dialogs/LogoutConfirmationDialog';
import prithviProfilePic from '../assets/images/prithvi-raj-profile.jpg'; // Assuming image is saved here

const features = [
  {
    icon: <FaUserFriends size={32} color="#FF4E8E" />,
    title: 'Swipe Nearby Profiles',
    desc: 'Discover locals and say hi instantly.',
    path: '/matching'
  },
  {
    icon: <FaVideo size={32} color="#7B2FF6" />,
    title: 'Random Video Chat',
    desc: 'Connect face-to-face with a heart bubble.',
    path: '/video-chat'
  },
  {
    icon: <FaComments size={32} color="#FF4E8E" />,
    title: 'Messaging Hub',
    desc: 'One unified inbox for all chats.',
    path: '/messages'
  },
  {
    icon: <FaBolt size={32} color="#7B2FF6" />,
    title: 'Instant Meetups',
    desc: 'Spark something special in your city.',
    path: '/hangout'
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleProtectedAction = (action: () => void) => {
    if (isAuthenticated && user) {
      action();
    } else {
      setAuthTab('signup');
      setAuthOpen(true);
    }
  };

  const openAboutModal = () => setShowAboutModal(true);
  const closeAboutModal = () => setShowAboutModal(false);

  // Specific handler for external links to allow default behavior if authenticated
  const handleExternalLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthTab('signup');
      setAuthOpen(true);
    }
    // If authenticated, allow the default <a> tag behavior (opening the link)
  };
  
  const handleLogoutClick = () => {
    // Show the logout confirmation dialog
    setShowLogoutDialog(true);
  };
  
  const handleLogoutConfirm = async () => {
    try {
      await logout();
      // Close the dialog after successful logout
      setShowLogoutDialog(false);
      // No need to do anything else as userDetails will be null after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const handleLogoutCancel = () => {
    // Close the logout confirmation dialog without logging out
    setShowLogoutDialog(false);
  };
  return (
    <div className={styles.background}>
      {/* Floating Glassmorphism Auth Buttons or User Profile (fixed to viewport) */}
      <div className={styles.floatingAuthBtns}>
        {isAuthenticated && user ? (
          <> 
            <div className={`${styles.authPillBtn} ${styles.userProfile}`}>
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className={styles.userAvatar} 
                />
              ) : (
                <FaUser size={18} />
              )}
              <span className={styles.username}>{user.name}</span>
            </div>
            <button
              className={`${styles.authPillBtn} ${styles.logout}`}
              aria-label="Logout"
              onClick={handleLogoutClick}
            >
              <FaSignOutAlt size={18} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.authPillBtn} ${styles.login}`}
              aria-label="Login"
              onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
            >
              <FaUser size={18} />
              Login
            </button>
            <button
              className={`${styles.authPillBtn} ${styles.signup}`}
              aria-label="Sign up"
              onClick={() => { setAuthTab('signup'); setAuthOpen(true); }}
            >
              <FaRegStar size={18} />
              Sign up
            </button>
          </>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authTab} />
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog 
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      <main className={styles.heroSection}>
        <motion.h1 
          className={styles.headline}
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
        >
          find someone
        </motion.h1>
        <motion.p 
          className={styles.subtext}
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.9 }}
        >
          make new friends and spark something special in your city
        </motion.p>
        <div className={styles.ctaButtons}>
          <motion.button 
            className={styles.startNowBtn}
            whileHover={{ scale: 1.08, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handleProtectedAction(() => navigate('/experience'))}
          >
            Start Now
          </motion.button>
          <motion.button 
            className={styles.howItWorksBtn}
            whileHover={{ scale: 1.04, boxShadow: '0 0 12px #7B2FF6' }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={() => handleProtectedAction(() => {
              // TODO: Define action for authenticated users (e.g., scroll to a section)
              console.log('"See How It Works" clicked by authenticated user');
            })}
          >
            See How It Works
          </motion.button>
        </div>
      </main>
      <section className={styles.featuresSection}>
        {features.map((feature, idx) => (
          <motion.div
            className={styles.featureCard}
            key={feature.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 + idx * 0.1 }}
            onClick={() => handleProtectedAction(() => navigate(feature.path))}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(255, 78, 142, 0.2)' }}
          >
            <div className={styles.featureIcon}>{feature.icon}</div>
            <div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="#about" onClick={(e) => { e.preventDefault(); openAboutModal(); }} style={{ cursor: 'pointer' }}>About</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); handleProtectedAction(() => console.log('Footer link Terms clicked')); }}>Terms</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); handleProtectedAction(() => console.log('Footer link Contact clicked')); }}>Contact</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); handleProtectedAction(() => console.log('Footer link Privacy clicked')); }}>Privacy</a>
          <a href="/admin" className={styles.adminLink} onClick={(e) => { e.preventDefault(); handleProtectedAction(() => navigate('/admin')); }}>Admin</a>
        </div>
        <div className={styles.socialIcons}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" onClick={handleExternalLinkClick}><FaInstagram /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" onClick={handleExternalLinkClick}><FaYoutube /></a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" onClick={handleExternalLinkClick}><FaFacebook /></a>
        </div>
        <div className={styles.footerBrand}>© Drifty.</div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <motion.div
          className={styles.aboutModalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAboutModal} // Close modal when overlay is clicked
        >
          <motion.div
            className={styles.aboutModalCard}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when card is clicked
          >
            <button className={styles.aboutModalCloseButton} onClick={closeAboutModal}>
              <FaTimes />
            </button>
            <img src={prithviProfilePic} alt="Prithvi Raj - Founder of Drifty" className={styles.aboutModalImage} />
            <div className={styles.aboutModalTextContent}>
              <h2>Hi, I'm Prithvi Raj, the founder of Drifty.</h2>
              <p>I'm a traveler, a seeker, and someone who deeply values real human connection. Through my journeys across different cultures and landscapes, I realized something powerful—we all crave connection, understanding, and a sense of belonging, no matter where we come from.</p>
              <p>I created Drifty not just as another dating app, but as a space where authentic conversations and meaningful relationships can begin. In a world full of fast swipes and fake profiles, I wanted to build something different—something that feels human. A place where strangers can turn into companions, where love, friendship, and deep bonds can grow naturally, beyond algorithms.</p>
              <p>Drifty is inspired by my own life—traveling solo, meeting new people, and discovering the beauty of connection in unexpected moments. It's for people who are open to drifting through life with purpose, with curiosity, and with the hope of finding someone who truly understands them. It's not just a dating platform It's a reflection of what I believe in: real people, real emotions, real stories.</p>
              <p>Welcome to Drifty. Let's make meaningful connections.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
