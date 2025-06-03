import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Success callback component
const AuthSuccess = () => {
  const { handleAuthSuccess } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log('Auth success page loaded, processing token...');
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        console.log('Token from URL:', token ? 'Token exists' : 'No token');
        
        if (!token) {
          setError('No authentication token received');
          return;
        }
        
        // Process the token and redirect to home on success
        console.log('Calling handleAuthSuccess with token');
        const success = await handleAuthSuccess(token);
        
        console.log('Auth success result:', success);
        
        if (success) {
          console.log('Authentication successful, redirecting to phone verification');
          // Redirect to phone verification page instead of home
          setTimeout(() => {
            navigate('/phone-verification', { replace: true });
          }, 500);
        } else {
          console.error('Token validation failed');
          setError('Failed to authenticate with the provided token');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication process failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    
    processAuth();
  }, [location, handleAuthSuccess, navigate]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-pink-400 to-violet-500">
        <div className="backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Authentication Error</h2>
          <p className="text-center text-gray-800">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 w-full py-2 px-4 bg-white/50 hover:bg-white/70 text-gray-800 rounded-xl"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-pink-400 to-violet-500">
      <div className="backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Authentication Successful</h2>
        <p className="text-center text-gray-800">Redirecting you to complete your profile...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

// Failure callback component
const AuthFailure = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-pink-400 to-violet-500">
      <div className="backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Authentication Failed</h2>
        <p className="text-center text-gray-800">We couldn't authenticate you. Please try again.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 w-full py-2 px-4 bg-white/50 hover:bg-white/70 text-gray-800 rounded-xl"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

// Protected Route component
export const ProtectedRoute: React.FC<{ 
  element: React.ReactNode; 
}> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  
  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Render the protected content if authenticated
  return <>{element}</>;
};

// Admin Route component
export const AdminRoute: React.FC<{ 
  element: React.ReactNode; 
}> = ({ element }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = () => {
      // Check both auth context and localStorage
      const isAdminInContext = isAdmin;
      const isAdminInStorage = localStorage.getItem('adminAuthenticated') === 'true';
      
      console.log('AdminRoute check - isAuthenticated:', isAuthenticated);
      console.log('AdminRoute check - isAdmin in context:', isAdminInContext);
      console.log('AdminRoute check - isAdmin in storage:', isAdminInStorage);
      
      // Also check if there's admin data in localStorage userDetails
      try {
        const storedDetails = localStorage.getItem('userDetails');
        if (storedDetails) {
          const userDetails = JSON.parse(storedDetails);
          console.log('AdminRoute check - stored user details:', userDetails);
          
          if (userDetails && (userDetails.isAdmin === true || userDetails.role === 'admin')) {
            console.log('Admin found in stored user details');
            setIsAdminAuthenticated(true);
            setIsCheckingAdmin(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing stored user details:', error);
      }
      
      setIsAdminAuthenticated(isAdminInContext || isAdminInStorage);
      setIsCheckingAdmin(false);
    };
    
    checkAdminStatus();
  }, [isAdmin, isAuthenticated]);
  
  // Show loading state while checking authentication
  if (isLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }
  
  // Redirect to admin login if not authenticated as admin
  if (!isAdminAuthenticated) {
    console.log('Not authenticated as admin, redirecting to admin login');
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  
  // Render the admin content if authenticated and admin
  console.log('Admin authenticated, rendering admin content');
  return <>{element}</>;
};

// Auth Routes component
const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/success" element={<AuthSuccess />} />
      <Route path="/failure" element={<AuthFailure />} />
    </Routes>
  );
};

export default AuthRoutes;
