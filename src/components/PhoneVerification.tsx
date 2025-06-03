import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './PhoneVerification.css';

const PhoneVerification: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const digits = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format the phone number (US format)
    let formatted = '';
    if (limitedDigits.length > 0) {
      formatted += limitedDigits.slice(0, 3);
      if (limitedDigits.length > 3) {
        formatted += '-' + limitedDigits.slice(3, 6);
        if (limitedDigits.length > 6) {
          formatted += '-' + limitedDigits.slice(6, 10);
        }
      }
    }
    
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get only digits for validation
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Validate exactly 10 digits
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Make API call to save the phone number
      const API_URL = 'http://localhost:5001/api'; // Match the server URL
      const response = await axios.post(`${API_URL}/auth/update-profile`, {
        userId: user?._id,
        phoneNumber: digits // Send raw digits without formatting
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Phone number saved successfully:', response.data);
      
      // Update user context if needed
      if (response.data.success && user && setUser) {
        setUser({
          ...user,
          phoneNumber: digits
        });
      }
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      console.error('Error saving phone number:', err);
      setError(err.response?.data?.message || 'Failed to save phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="phone-verification-container">
      <div className="phone-verification-card">
        <h2>One Last Step</h2>
        <p className="welcome-text">
          Welcome, <span style={{fontWeight: 600}}>{user?.displayName || 'there'}</span>! Please enter your phone number to continue your dating journey.
        </p>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter 10 digits (XXX-XXX-XXXX)"
              disabled={isLoading}
              autoFocus
              maxLength={12} /* 10 digits + 2 hyphens */
            />
            <div className="input-helper-text">Please enter exactly 10 digits</div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Saving...
              </>
            ) : (
              'Done'
            )}
          </button>
        </form>
        
        <div className="privacy-note">
          Your phone number helps us verify your account and keep it secure.
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;
