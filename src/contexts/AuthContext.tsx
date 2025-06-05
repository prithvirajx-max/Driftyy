import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useGoogleLogin, googleLogout, TokenResponse } from '@react-oauth/google';

interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  token: string;
}

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
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        token
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
