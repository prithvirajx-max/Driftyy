import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Effect to show auth modal if not authenticated after a brief delay
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (!isLoading && !isAuthenticated) {
      // Show auth modal after a short delay
      timer = setTimeout(() => setShowAuthModal(true), 100);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated]);

  // Handle closing the auth modal and redirecting to home
  const handleModalClose = () => {
    setShowAuthModal(false);
    setRedirecting(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  // If admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated and redirecting after modal close
  if (!isAuthenticated && redirecting) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    // For admin routes, check if user is admin
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
  }

  // If not authenticated, show the outlet with the auth modal
  // This allows the route content to still render behind the modal
  return (
    <>
      <div className="filter blur-sm pointer-events-none">
        {children ? children : <Outlet />}
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onClose={handleModalClose}
        mode="login"
      />
    </>
  );
};

export default ProtectedRoute;
