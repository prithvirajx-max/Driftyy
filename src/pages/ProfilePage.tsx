import React, { useState, useEffect } from 'react';
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

  // Function to load profile data - first try the backend, then fall back to localStorage
  const loadProfileData = async () => {
    setIsLoading(true);
    
    try {
      // Try to fetch profile from backend first (if user is authenticated)
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Make API call to get profile data
          const response = await fetch('http://localhost:5001/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              setUserProfile(data.profile);
              if (data.additionalInfo) {
                setAdditionalInfo(data.additionalInfo);
              }
              setHasProfile(true);
              setIsLoading(false);
              return; // Successfully loaded from API
            }
          }
        } catch (error) {
          console.error('Error fetching profile from API:', error);
          // Continue to localStorage fallback
        }
      }
      
      // Fallback to localStorage if API fetch failed or user is not authenticated
      const savedProfile = localStorage.getItem('userProfile');
      const savedAdditionalInfo = localStorage.getItem('userAdditionalInfo');
      
      if (savedProfile) {
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
            setHasProfile(true);
          }
        } catch (error) {
          console.error('Error parsing saved profile:', error);
        }
      }
      
      if (savedAdditionalInfo) {
        try {
          const additionalData = JSON.parse(savedAdditionalInfo);
          setAdditionalInfo(additionalData);
        } catch (error) {
          console.error('Error parsing additional info:', error);
        }
      }
    } finally {
      setIsLoading(false);
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
    // Loading state
    if (isLoading) {
      return <div className={styles.loading}>Loading profile...</div>;
    }
    
    // New profile creation
    if (!hasProfile && !isEditing) {
      return (
        <ProfileCreation
          onProfileSaved={handleProfileSaved}
        />
      );
    }
    
    // Editing existing profile
    if (isEditing) {
      return (
        <ProfileCreation
          existingProfile={userProfile!}
          existingAdditionalInfo={additionalInfo}
          onProfileSaved={handleProfileSaved}
          isEditing={true}
        />
      );
    }
    
    // View mode (has profile, not editing)
    if (userProfile && additionalInfo) {
      return (
        <ProfileView 
          profile={userProfile}
          additionalInfo={additionalInfo}
          onEditClick={() => setIsEditing(true)}
        />
      );
    }
    
    // Loading state or fallback
    return <div className={styles.loading}>Loading profile...</div>;
  };

  return (
    <div className={styles.profilePageContainer}>
      {renderProfileContent()}
    </div>
  );
};

export default ProfilePage;
