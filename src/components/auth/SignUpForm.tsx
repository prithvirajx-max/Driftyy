import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle } from 'react-icons/fa';

interface SignUpFormProps {
  onSubmit: () => void;
  onSwitch: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, onSwitch }) => {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  
  // Form validation
  const validateForm = () => {
    setError('');
    
    if (!username || !email || !phoneNumber || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
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
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signup(email, password, username, phoneNumber);
      setShowOtpForm(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }
    
    setLoading(true);
    try {
      const { verifyOtp } = useAuth();
      const isVerified = await verifyOtp(otp);
      
      if (isVerified) {
        onSubmit();
      } else {
        setError('Invalid OTP, please try again');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {!showOtpForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={styles.formContainer}
        >
          <h2 className={styles.formTitle}>Create Account</h2>
          
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
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            
            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className={styles.input}
                maxLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className={styles.switchContainer}>
            <span>Already have an account?</span>
            <button 
              type="button"
              onClick={onSwitch}
              className={styles.switchButton}
            >
              Log In
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={styles.formContainer}
        >
          <h2 className={styles.formTitle}>Verify Your Email</h2>
          <p className={styles.formSubtitle}>
            We've sent a 6-digit code to your email address.
          </p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleOtpSubmit}>
            <div className={styles.otpContainer}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className={styles.otpInput}
                maxLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                const { sendOtp } = useAuth();
                sendOtp().catch(err => setError(err.message));
              }}
              className={styles.resendButton}
            >
              Resend Code
            </button>
          </form>
        </motion.div>
      )}
    </>
  );
};

export default SignUpForm;
