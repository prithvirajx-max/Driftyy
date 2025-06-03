import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider, facebookProvider } from '../config/firebase';

interface AuthContextType {
  user: UserDetails | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  logout: () => Promise<void>;
}

interface UserProfile {
  bio?: string;
  age?: number;
  gender?: string;
  location?: string;
  interests?: string[];
  matches?: string[];
}

interface UserSettings {
  notifications: boolean;
  theme: string;
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showReadReceipts: boolean;
  };
}

interface UserDetails {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: string;
  providerId: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  phoneNumber?: string;
  profile?: UserProfile;
  settings?: UserSettings;
}

// Helper function to convert Firebase user to our UserDetails format
const mapFirebaseUserToUserDetails = (firebaseUser: FirebaseUser, additionalData?: any): UserDetails => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'User',
    photoURL: firebaseUser.photoURL,
    provider: firebaseUser.providerData[0]?.providerId || 'email',
    providerId: firebaseUser.uid,
    role: additionalData?.role || 'user',
    createdAt: additionalData?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
    lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    phoneNumber: firebaseUser.phoneNumber || undefined,
    profile: additionalData?.profile || {},
    settings: additionalData?.settings || {
      notifications: true,
      theme: 'auto',
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showReadReceipts: true
      }
    }
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to check auth status
  const checkAuthStatus = async () => {
    setIsLoading(true);
    // Nothing to do here, Firebase onAuthStateChanged handles this
    setIsLoading(false);
  };

  // Handle successful authentication
  const handleAuthSuccess = async (user: FirebaseUser, userData?: any) => {
    try {
      // Get the Firebase token
      const token = await user.getIdToken();
      
      // Set the token in Axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create user details object
      const userDetails = mapFirebaseUserToUserDetails(user, userData);
      
      // Store in state
      setFirebaseUser(user);
      setUser(userDetails);
      setIsAuthenticated(true);
      setIsAdmin(userDetails.role === 'admin');
      
      return true;
    } catch (error) {
      console.error('Error handling auth success:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Firebase auth state listener
  useEffect(() => {
    // Check for redirect result first (for Netlify deployment)
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User has returned from a redirect sign-in
          // Create or update user document
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          let userData: any = null;
          
          if (!userDoc.exists()) {
            userData = {
              role: 'user',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              profile: {
                bio: '',
                interests: []
              },
              settings: {
                notifications: true,
                theme: 'auto',
                privacy: {
                  showOnlineStatus: true,
                  showLastSeen: true,
                  showReadReceipts: true
                }
              }
            };
            await setDoc(doc(db, 'users', result.user.uid), userData);
          } else {
            userData = userDoc.data();
            await updateDoc(doc(db, 'users', result.user.uid), {
              lastLogin: serverTimestamp()
            });
          }
          
          // Handle successful authentication
          await handleAuthSuccess(result.user, userData);
          
          // Redirect back to the original path if stored
          const redirectPath = sessionStorage.getItem('authRedirectPath') || '/';
          sessionStorage.removeItem('authRedirectPath');
          if (redirectPath !== window.location.pathname) {
            window.location.href = redirectPath;
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setIsLoading(false);
      }
    };
    
    // Check for redirect result
    checkRedirectResult();
    
    // Then set up the regular auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      
      if (currentUser) {
        // User is signed in
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          let userData: any = null;
          
          if (userDoc.exists()) {
            // Get user data from Firestore
            userData = userDoc.data();
            
            // Update last login time
            await updateDoc(doc(db, 'users', currentUser.uid), {
              lastLogin: serverTimestamp()
            });
          } else {
            // Create new user document if it doesn't exist
            userData = {
              role: 'user',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              profile: {
                bio: '',
                interests: []
              },
              settings: {
                notifications: true,
                theme: 'auto',
                privacy: {
                  showOnlineStatus: true,
                  showLastSeen: true,
                  showReadReceipts: true
                }
              }
            };
            
            await setDoc(doc(db, 'users', currentUser.uid), userData);
          }
          
          // Handle authentication success
          await handleAuthSuccess(currentUser, userData);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setIsLoading(false);
        }
      } else {
        // User is signed out
        delete axios.defaults.headers.common['Authorization'];
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signupWithEmail = async (email: string, password: string, displayName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set display name
      await updateProfile(user, {
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${displayName}&background=random`
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profile: {
          bio: '',
          interests: []
        },
        settings: {
          notifications: true,
          theme: 'auto',
          privacy: {
            showOnlineStatus: true,
            showLastSeen: true,
            showReadReceipts: true
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Email signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with email and password
  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Email login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      const userData = userDoc.data();
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        profile: {
          ...userData.profile,
          ...data
        },
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...data
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Upload profile photo
  const uploadProfilePhoto = async (file: File): Promise<string> => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Create storage reference
      const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Update user profile in Firebase Auth
      await updateProfile(auth.currentUser, { photoURL });
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: photoURL,
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      if (user) {
        setUser({
          ...user,
          photoURL: photoURL
        });
      }
      
      return photoURL;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // On Netlify or in production, use redirect method instead of popup
      const isNetlify = window.location.hostname.includes('netlify.app') || import.meta.env.PROD;
      
      if (isNetlify) {
        // Store the current path to redirect back after auth
        sessionStorage.setItem('authRedirectPath', window.location.pathname);
        // Configure additional parameters for the provider
        googleProvider.setCustomParameters({
          // Request email selection
          prompt: 'select_account',
          // Set the redirect URL (must be authorized in Google Cloud Console)
          redirect_uri: window.location.origin
        });
        
        // Use redirect method for deployment
        await signInWithRedirect(auth, googleProvider);
        return; // The page will redirect to Google
      } else {
        // Use popup for local development
        const result = await signInWithPopup(auth, googleProvider);
        
        // Check if the user document exists, if not create it
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', result.user.uid), {
            role: 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            profile: {
              bio: '',
              interests: []
            },
            settings: {
              notifications: true,
              theme: 'auto',
              privacy: {
                showOnlineStatus: true,
                showLastSeen: true,
                showReadReceipts: true
              }
            }
          });
        } else {
          // Update last login
          await updateDoc(doc(db, 'users', result.user.uid), {
            lastLogin: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with Facebook
  const loginWithFacebook = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Check if the user document exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          role: 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          profile: {
            bio: '',
            interests: []
          },
          settings: {
            notifications: true,
            theme: 'auto',
            privacy: {
              showOnlineStatus: true,
              showLastSeen: true,
              showReadReceipts: true
            }
          }
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Admin login - using Firebase email/password authentication
  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Development mode hardcoded credentials check
      if (username === 'prithvi_rajx' && password === 'driftyfounderprithviraj') {
        try {
          // First check if admin user exists in Firebase
          const email = `${username}@dating-app.com`;
          
          try {
            // Try to sign in with email/password
            await signInWithEmailAndPassword(auth, email, password);
          } catch (error) {
            // If user doesn't exist, create admin account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Set display name
            await updateProfile(user, {
              displayName: username,
              photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`
            });
            
            // Create admin user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              role: 'admin',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              profile: {
                bio: 'Administrator',
                interests: ['Managing the platform']
              },
              settings: {
                notifications: true,
                theme: 'dark',
                privacy: {
                  showOnlineStatus: false,
                  showLastSeen: false,
                  showReadReceipts: true
                }
              }
            });
          }
          
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error('Admin login error:', error);
          setIsLoading(false);
          return false;
        }
      }
      
      // If not using development credentials, try normal email/password login
      try {
        // Attempt to sign in with email/password
        await signInWithEmailAndPassword(auth, username, password);
        
        // Check if user has admin role
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsLoading(false);
          return true;
        } else {
          // Not an admin, sign out
          await signOut(auth);
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.error('Admin login error:', error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Admin authentication error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout using Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      // Firebase auth state listener will handle the rest
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    signupWithEmail,
    adminLogin,
    resetPassword,
    updateUserProfile,
    uploadProfilePhoto,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
