import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';

interface OtpVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  email?: string; // Add email parameter for OTP sending
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ onVerified, onCancel, email }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyOtp, sendOtp } = useAuth();

  // Start countdown for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleResendOtp = async () => {
    try {
      if (!email) {
        setError('No email available for sending OTP');
        return;
      }
      
      setLoading(true);
      await sendOtp(email);
      setCountdown(60);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize countdown and send OTP when component mounts
  useEffect(() => {
    if (email) {
      // Send initial OTP only if not already sent (countdown started)
      if (countdown === 60) {
        handleResendOtp();
      }
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const isVerified = await verifyOtp(otp);
      
      if (isVerified) {
        onVerified();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed');
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
      <h2 className={styles.formTitle}>Verify Your Email</h2>
      
      <p className={styles.formSubtitle}>
        We've sent a 6-digit verification code to your email address.
      </p>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.otpContainer}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            className={styles.otpInput}
            maxLength={6}
            autoFocus
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        
        <div className={styles.resendContainer}>
          {countdown > 0 ? (
            <p className={styles.countdownText}>
              Resend code in <span className={styles.countdown}>{countdown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className={styles.resendButton}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Back to Login
        </button>
      </form>
    </motion.div>
  );
};

export default OtpVerification;
