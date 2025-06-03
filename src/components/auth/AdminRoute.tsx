import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // While checking auth status, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  // If not authenticated at all, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated but not an admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If admin is authenticated, render the admin dashboard
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
