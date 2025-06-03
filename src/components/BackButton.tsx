import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './BackButton.module.css';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the back button on the home page
  if (location.pathname === '/' || location.pathname === '/home') {
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button
      className={styles.backButton}
      onClick={handleBack}
      aria-label="Go back"
    >
      <FiArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
