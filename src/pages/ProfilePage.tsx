import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProfileCreation from '../components/profile/CreationForm';
import ProfileView from '../components/profile/ProfileView';
import { User } from '../types/user';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [viewAfterSave, setViewAfterSave] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firebase user from AuthContext
  const { firebaseUser } = useAuth();

  // Load profile directly from Firestore whenever the authenticated user changes
  useEffect(() => {
    const fetchProfileFromFirestore = async () => {
      if (!firebaseUser) return;
      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data: any = userDoc.data();
          const profileData = data.profile ? data.profile : data;
          setUserProfile(profileData);
          setAdditionalInfo(data.additionalInfo || {});
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Error fetching profile from Firestore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileFromFirestore();
  }, [firebaseUser]);

  // Function to load profile data - first try the backend, then fall back to localStorage
  const loadProfileData = async () => {
    console.log('[ProfilePage] loadProfileData: Called');
    setIsLoading(true);
    
    try {
      // Try to fetch profile from backend first (if user is authenticated)
      const token = localStorage.getItem('token');
      console.log('[ProfilePage] loadProfileData: Token value -', token);
      if (token) {
        console.log('[ProfilePage] loadProfileData: Token found, attempting API fetch.');
        try {
          // Make API call to get profile data
          const response = await fetch('http://localhost:5001/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('[ProfilePage] loadProfileData: API response OK.');
            const data = await response.json();
            if (data.profile) {
              console.log('[ProfilePage] loadProfileData: Profile data found in API response:', JSON.stringify(data.profile));
              setUserProfile(data.profile);
              if (data.additionalInfo) {
                setAdditionalInfo(data.additionalInfo);
              }
              setHasProfile(true);
              setIsLoading(false);
              console.log('[ProfilePage] loadProfileData: State after API success - userProfile:', JSON.stringify(userProfile), 'hasProfile:', hasProfile, 'isLoading:', isLoading);
              return; // Successfully loaded from API
            }
          }
        } catch (error) {
          console.error('[ProfilePage] loadProfileData: Error fetching profile from API:', error);
          // Continue to localStorage fallback
        }
      }
      
      // Fallback to localStorage if API fetch failed or user is not authenticated
      console.log('[ProfilePage] loadProfileData: Falling back to localStorage.');
      const savedProfile = localStorage.getItem('userProfile');
      const savedAdditionalInfo = localStorage.getItem('userAdditionalInfo');
      
      if (savedProfile) {
        console.log('[ProfilePage] loadProfileData: Found profile in localStorage:', savedProfile);
        try {
          const profile = JSON.parse(savedProfile);
          
          // Convert the ISO date string back to a Date object
          if (typeof profile.lastActive === 'string') {
            profile.lastActive = new Date(profile.lastActive);
          }
          
          // Handle photo references
          if (profile.photos) {
            // Keep the references as they are - the ProfileView component will resolve them
            // from sessionStorage when it renders
          }
          
          setUserProfile(profile);
          
          // Check if profile has essential info
          if (profile.name && profile.age) {
            console.log('[ProfilePage] loadProfileData: Profile from localStorage has essential info.');
            setHasProfile(true);
          }
        } catch (error) {
          console.error('[ProfilePage] loadProfileData: Error parsing saved profile from localStorage:', error);
        }
      }
      
      if (savedAdditionalInfo) {
        console.log('[ProfilePage] loadProfileData: Found additionalInfo in localStorage:', savedAdditionalInfo);
        try {
          const additionalData = JSON.parse(savedAdditionalInfo);
          setAdditionalInfo(additionalData);
        } catch (error) {
          console.error('[ProfilePage] loadProfileData: Error parsing additional info from localStorage:', error);
        }
      }
    } finally {
      console.log('[ProfilePage] loadProfileData: Finally block. Current state BEFORE setIsLoading(false) - userProfile:', JSON.stringify(userProfile), 'hasProfile:', hasProfile, 'isLoading:', isLoading);
      setIsLoading(false);
      console.log('[ProfilePage] loadProfileData: Finally block. Current state AFTER setIsLoading(false) - userProfile:', JSON.stringify(userProfile), 'hasProfile:', hasProfile, 'isLoading:', isLoading);
    }
  };

  // Handle profile save completion
  const handleProfileSaved = () => {
    loadProfileData();
    setIsEditing(false);
    setViewAfterSave(true);
  };

  // Check if user has already created a profile on mount
  useEffect(() => {
    // Set the body background style to maintain the app's gradient background
    // but don't override the existing background - let it show through
    document.body.style.overflow = 'auto';
    
    // The background is already set in the main CSS to: 
    // linear-gradient(135deg, #FF4E8E 0%, #7B2FF6 100%)
    // so we don't need to set it here, which was causing the white overlay
    
    // Hide any navigation or UI elements
    const navElements = document.querySelectorAll('nav, .bottomNav, header');
    navElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    
    // Load profile data
    loadProfileData();
    
    return () => {
      // Clean up styles when component unmounts
      document.body.style.overflow = '';
      
      // Restore navigation elements
      const navElements = document.querySelectorAll('nav, .bottomNav, header');
      navElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    };
  }, []);

  // Show view after save
  useEffect(() => {
    if (viewAfterSave && hasProfile) {
      setViewAfterSave(false);
    }
  }, [viewAfterSave, hasProfile]);

  // Render the profile content based on state
  const renderProfileContent = () => {
    console.log(`[ProfilePage] renderProfileContent: Called. State: isLoading=${isLoading}, hasProfile=${hasProfile}, isEditing=${isEditing}, userProfile=${JSON.stringify(userProfile)}`);
    // Loading state
    if (isLoading) {
      console.log('[ProfilePage] renderProfileContent: Rendering loading screen (isLoading is true).');
      return <div className={styles.loading}>Loading profile...</div>;
    }
    
    // New profile creation
    if (!hasProfile && !isEditing) {
      console.log('[ProfilePage] renderProfileContent: Condition met for NEW profile creation.');
      return (
        <ProfileCreation
          onProfileSaved={handleProfileSaved}
        />
      );
    }
    
    // Editing existing profile
    if (isEditing) {
      console.log('[ProfilePage] renderProfileContent: Condition met for EDITING existing profile.');
      return (
        <ProfileCreation
          existingProfile={userProfile!}
          existingAdditionalInfo={additionalInfo}
          onProfileSaved={handleProfileSaved}
          isEditingProp={true}
        />
      );
    }
    
    // View mode (has profile, not editing)
    if (userProfile && additionalInfo) { // This condition is for VIEWING, not creating/editing
      console.log('[ProfilePage] renderProfileContent: Condition met for VIEWING profile.');
      return (
        <ProfileView 
          profile={userProfile}
          additionalInfo={additionalInfo}
          onEditClick={() => setIsEditing(true)}
        />
      );
    }
    
    // Loading state or fallback
    console.log('[ProfilePage] renderProfileContent: No specific condition met, rendering fallback loading screen.');
    return <div className={styles.loading}>Loading profile...</div>;
  };

  return (
    <div className={styles.profilePageContainer}>
      {renderProfileContent()}
    </div>
  );
};

export default ProfilePage;
