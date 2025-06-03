import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaVideo, FaCompass, FaCalendarAlt, FaUser, FaRegCommentDots } from 'react-icons/fa';
import styles from './LandingExperience.module.css';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const LandingExperience: React.FC = () => {
  const navigate = useNavigate();

  // Section data
  const sections = [
    {
      id: 'video-chat',
      icon: <FaVideo size={64} />,
      title: 'Video Chat',
      description: [
        'Connect face-to-face instantly with people around the world.',
        'Build meaningful connections through authentic conversations.'
      ],
      buttonText: 'Start Video Chat',
      action: () => navigate('/video-chat')
    },
    {
      id: 'explore-nearby',
      icon: <FaCompass size={64} />,
      title: 'Explore Nearby',
      description: [
        'Discover interesting people within 50km of your location.',
        'Find connections based on shared interests and compatibility.'
      ],
      buttonText: 'Start Matching',
      action: () => navigate('/matching')
    },
    {
      id: 'hangout',
      icon: <FaCalendarAlt size={64} />,
      title: 'Hangout',
      description: [
        'Suggest and join local meetups, activities, and events.',
        'Turn digital connections into real-life memories.'
      ],
      buttonText: 'Start Hangout',
      action: () => navigate('/hangout')
    },
    {
      id: 'profile',
      icon: <FaUser size={64} />,
      title: 'Profile',
      description: [
        'Showcase the authentic you with a personalized profile.',
        'Control your preferences and manage your connections.'
      ],
      buttonText: 'View Profile',
      action: () => navigate('/profile')
    }
  ];

  return (
    <div className={styles.container}>
      {/* Fixed Message Icon */}
      <button 
        className={styles.messageIcon} 
        aria-label="Messages"
        onClick={() => navigate('/messages')}
      >
        <FaRegCommentDots size={24} />
      </button>
      <NotificationDropdown />
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <div className={styles.content}>
            <div className={styles.logoContainer}>
              <h2 className={styles.logo}>Drifty</h2>
            </div>
            
            <motion.div 
              className={styles.iconContainer}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {section.icon}
            </motion.div>
            
            <motion.div 
              className={styles.textContainer}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.title}>{section.title}</h2>
              <div className={styles.description}>
                {section.description.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </motion.div>
            
            <motion.button 
              className={styles.actionButton}
              onClick={section.action}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 25px rgba(255, 78, 142, 0.6), 0 0 10px rgba(123, 47, 246, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {section.buttonText}
            </motion.button>
          </div>
        </section>
      ))}
    </div>
  );
};

export default LandingExperience;
