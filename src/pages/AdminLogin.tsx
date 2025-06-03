import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './CenteredAdminLogin.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log('Attempting admin login with:', { username });

    // Check credentials and use the adminLogin function from AuthContext
    if (username === 'prithvi_rajx' && password === 'driftyfounderprithviraj') {
      console.log('Credentials match! Proceeding with admin login');
      
      try {
        // Use the adminLogin function from AuthContext
        const success = await adminLogin(username, password);
        
        if (success) {
          console.log('Admin login successful, redirecting to dashboard...');
          // Navigate to the admin dashboard
          navigate('/admin/dashboard');
        } else {
          setError('Failed to authenticate as admin. Please try again.');
        }
      } catch (error) {
        console.error('Admin login error:', error);
        setError('An error occurred during login. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Invalid admin credentials');
      setTimeout(() => {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="admin-login-container">
      <motion.div 
        className="admin-login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="admin-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Admin Login
        </motion.h1>
        <motion.p 
          className="admin-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Enter your credentials to access the admin dashboard
        </motion.p>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaExclamationTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <motion.input
              whileFocus={{ boxShadow: '0 0 0 2px rgba(255, 78, 142, 0.5)' }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="admin-input"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <motion.input
              whileFocus={{ boxShadow: '0 0 0 2px rgba(255, 78, 142, 0.5)' }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`admin-login-button ${isLoading ? 'loading' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loader-wrapper">
                <div className="loader"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              'Login to Dashboard'
            )}
          </motion.button>
        </form>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="back-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
