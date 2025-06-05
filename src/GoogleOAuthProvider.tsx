import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const DriftyyGoogleOAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!clientId) {
    console.error('Google Client ID is not set. Please add VITE_GOOGLE_CLIENT_ID to your .env');
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
};
