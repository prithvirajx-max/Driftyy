import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa';

interface LoginFormProps {
  onSubmit: () => void;
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSwitch }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form validation
  const validateForm = () => {
    setError('');
    
    if (!username || !phoneNumber || !password) {
      setError('All fields are required');
      return false;
    }
    
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (password.length !== 6 || !/^\d{6}$/.test(password)) {
      setError('Password must be exactly 6 digits');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(username, password, phoneNumber);
      onSubmit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.formContainer}
    >
      <h2 className={styles.formTitle}>Welcome Back</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <FaUser className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <FaPhone className={styles.inputIcon} />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            className={styles.input}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <FaLock className={styles.inputIcon} />
          <input
            type="password"
            placeholder="6-Digit Password"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            className={styles.input}
            maxLength={6}
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      
      <div className={styles.switchContainer}>
        <span>Don't have an account?</span>
        <button 
          type="button"
          onClick={onSwitch}
          className={styles.switchButton}
        >
          Sign Up
        </button>
      </div>
    </motion.div>
  );
};

export default LoginForm;
