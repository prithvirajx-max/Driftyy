import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { createOrUpdateUserProfile } from '../services/userService'; // Import the service
import { useGoogleLogin, googleLogout, TokenResponse } from '@react-oauth/google';

interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

interface GoogleUser {
  id: string; // To store Google's unique 'sub'
  name: string;
  email: string;
  picture: string;
  token: string; // This is the access_token
}

import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('googleUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Helper to fetch Google user profile
  const fetchGoogleProfile = async (token: string): Promise<GoogleUser | null> => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch Google profile');
      const profile = await res.json();
      const googleUser: GoogleUser = {
        id: profile.sub, // STORE THE 'sub' CLAIM
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        token // access_token
      };
      return googleUser;
    } catch (err) {
      console.error('Google profile fetch error:', err);
      return null;
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      const googleUser = await fetchGoogleProfile(tokenResponse.access_token);
      if (googleUser) {
        setUser(googleUser);
        localStorage.setItem('googleUser', JSON.stringify(googleUser));
        // Ensure profile exists in Firestore
        try {
          const firestoreProfile = await createOrUpdateUserProfile(googleUser);
          console.log('Firestore profile ensured/updated:', firestoreProfile);
          // Optionally, you could merge firestoreProfile details back into the local 'user' state
          // if it contains more/updated info (e.g., a custom username set previously)
          // For now, the local 'user' state primarily reflects Google's direct info + token.
        } catch (error) {
          console.error('Error ensuring/updating Firestore profile:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      alert('Google login failed.');
    },
    flow: 'implicit',
    scope: 'openid profile email'
  });

  // Logout handler
  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('googleUser');
  };
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
