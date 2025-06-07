import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCheck, FaTimes, FaCamera } from 'react-icons/fa';
import styles from './ProfileCreation.module.css';
import { User } from '../../types/user';
import { v4 as uuidv4 } from 'uuid';

// Interests options
const INTERESTS = [
  'Travel', 'Books', 'Movies', 'Parties', 'Fitness', 'Music', 
  'Arts', 'Pets', 'Cooking', 'Gaming', 'Technology', 'Photography', 
  'Hiking', 'Swimming', 'Dancing', 'Yoga', 'Fashion', 'Coffee'
];

// Age options for dropdown (18-100)
const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => i + 18);

// Height options in cm (140cm - 220cm)
const HEIGHT_OPTIONS = Array.from({ length: 81 }, (_, i) => i + 140);

// Weight options in kg (40kg - 150kg)
const WEIGHT_OPTIONS = Array.from({ length: 111 }, (_, i) => i + 40);

// Sexuality options
const SEXUALITY_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Demisexual', 'Queer', 'Questioning', 'Prefer not to say'
];

// Marital Status options
const MARITAL_STATUS_OPTIONS = [
  'Single', 'Divorced', 'Widowed', 'Separated', 'Prefer not to say'
];

// Body Type options
const BODY_TYPE_OPTIONS = [
  'Athletic', 'Average', 'Slim', 'Curvy', 'Muscular', 'Full Figured', 'Plus Size', 'Prefer not to say'
];

// Skin Color options
const SKIN_COLOR_OPTIONS = [
  'Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark', 'Prefer not to say'
];

// Ethnicity options
const ETHNICITY_OPTIONS = [
  'Asian', 'Black/African', 'Hispanic/Latino', 'Middle Eastern', 'Native American', 'Pacific Islander', 'White/Caucasian', 'Mixed', 'Other', 'Prefer not to say'
];

// Looking for options
const LOOKING_FOR_OPTIONS = [
  'Local Friend', 'Travel Buddy', 'Casual Friend', 'Hangout', 'Deep Talk', 'Companion',
  'True Love', 'Culture Exchange', 'Adventure Partner', 'Coffee Date', 'Real Connection',
  'Unexpected Moments', 'City Explorer', 'Language Partner', 'Meaningful Bond', 'Stranger to Soulmate'
];

// Education options
const EDUCATION_OPTIONS = [
  'High School', 'Some College', 'Associate\'s Degree', 'Bachelor\'s Degree', 
  'Master\'s Degree', 'PhD', 'Trade School', 'Prefer not to say'
];

// Religion options
const RELIGION_OPTIONS = [
  'Agnostic', 'Atheist', 'Buddhist', 'Christian', 'Hindu', 
  'Jewish', 'Muslim', 'Spiritual', 'Other', 'Prefer not to say'
];

// Diet options
const DIET_OPTIONS = [
  'Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo',
  'Gluten-Free', 'Dairy-Free', 'Kosher', 'Halal', 'Other', 'Prefer not to say'
];

// Sleep Schedule options
const SLEEP_SCHEDULE_OPTIONS = [
  'Early Bird', 'Night Owl', 'Regular Schedule', 'Irregular Schedule', 'Prefer not to say'
];

// Fitness Level options
const FITNESS_LEVEL_OPTIONS = [
  'Very Active', 'Active', 'Moderately Active', 'Occasionally Active', 'Not Active', 'Prefer not to say'
];

// Work-Life Balance options
const WORK_LIFE_BALANCE_OPTIONS = [
  'Work Focused', 'Balanced', 'Life Focused', 'Flexible', 'Prefer not to say'
];

// Living Situation options
const LIVING_SITUATION_OPTIONS = [
  'Living Alone', 'With Roommates', 'With Parents', 'Own House/Apartment', 'Other', 'Prefer not to say'
];

// Travel Preference options
const TRAVEL_PREFERENCE_OPTIONS = [
  'Frequent Traveler', 'Occasional Traveler', 'Rarely Travel', 'Want to Travel More', 'Prefer not to say'
];

// Family Relationship options
const FAMILY_RELATIONSHIP_OPTIONS = [
  'Very Close', 'Close', 'Neutral', 'Distant', 'Complicated', 'Prefer not to say'
];

// Financial Situation options
const FINANCIAL_SITUATION_OPTIONS = [
  'Comfortable', 'Managing', 'Struggling', 'Prefer not to say'
];

// Social Life options
const SOCIAL_LIFE_OPTIONS = [
  'Very Social', 'Moderately Social', 'Occasionally Social', 'Introvert', 'Prefer not to say'
];

// Languages options
const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Chinese', 
  'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Portuguese', 'Indonesian'
];

interface ProfileCreationProps {
  onProfileSaved?: () => void;
  existingProfile?: User;
  existingAdditionalInfo?: any;
  isEditing?: boolean;
}

export default function ProfileCreation(props: ProfileCreationProps) {
  // Profile state
  const [profile, setProfile] = useState<User>({
    id: uuidv4(),
    name: '',
    age: 25,
    gender: 'male',
    bio: '',
    interests: [],
    photos: [],
    location: {
      city: '',
      state: ''
    },
    preferences: {
      minAge: 18,
      maxAge: 45,
      gender: []
    },
    lastActive: new Date()
  });

  // Additional profile fields not in the User interface
  const [additionalInfo, setAdditionalInfo] = useState<{
    height: string;
    weight: string;
    sexuality: string;
    maritalStatus: string;
    bodyType: string;
    skinColor: string;
    ethnicity: string;
    education: string;
    job: string;
    jobTitle: string;
    religion: string;
    interestsDescription: string;
    languagesLearning: string;
    dreams: string;
    degree?: string; // optional
    diet: string;
    sleepSchedule: string;
    fitnessLevel: string;
    workLifeBalance: string;
    livingSituation: string;
    travelPreference: string;
    familyRelationship: string;
    financialSituation: string;
    socialLife: string;
    drinking: string;
    smoking: string;
    languages: string[];
    lookingFor: string[];
  }>({
    height: '',
    weight: '',
    sexuality: '',
    maritalStatus: '',
    bodyType: '',
    skinColor: '',
    ethnicity: '',
    education: '',
    job: '',
    jobTitle: '',
    religion: '',
    interestsDescription: '',
    languagesLearning: '',
    dreams: '',
    degree: '',
    diet: '',
    sleepSchedule: '',
    fitnessLevel: '',
    workLifeBalance: '',
    livingSituation: '',
    travelPreference: '',
    familyRelationship: '',
    financialSituation: '',
    socialLife: '',
    drinking: 'sometimes',
    smoking: 'no',
    languages: [],
    lookingFor: []
  });

  // UI state
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [bioCharCount, setBioCharCount] = useState(0);
  const [interestsDescCharCount, setInterestsDescCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const BIO_LIMIT = 1000;
  const INTERESTS_DESC_LIMIT = 500;
  const DREAMS_LIMIT = 500;
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null, null]);
  
  // Location detection (made optional)
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setDetectingLocation(true);
    setLocationError(null);
    
    // Set timeout to handle long-running geolocation requests
    const timeoutId = setTimeout(() => {
      setDetectingLocation(false);
      setLocationError('Location detection timed out. Please enter your location manually.');
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          clearTimeout(timeoutId);
          
          // Fetch location details from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          
          // Extract city and state from response
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          
          if (city || state) {
            setProfile(prev => ({
              ...prev,
              location: { city, state }
            }));
            setLocationDetected(true);
          }
        } catch (_error) {
          // Silent fail - user can input location manually
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        // More informative error logging with error code
        const errorMessage = error.code ? 
          `Error getting location: Code ${error.code} - ${error.message || 'Permission denied or timeout'}` : 
          'Error getting location: Unknown error';
        console.error(errorMessage);
        
        // Silent fail in UI - user can still input location manually
        setDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 0 }
    );
  };
  
  // Try to detect location on first load (but don't force it)
  useEffect(() => {
    // Don't auto-detect if user already has a location set
    if (profile.location?.city || profile.location?.state) {
      return;
    }
    
    // Only attempt detection once
    if (!locationDetected && !detectingLocation) {
      detectLocation();
    }
  }, [locationDetected, detectingLocation, profile.location]);
  
  // Calculate profile completion percentage
  useEffect(() => {
    const requiredFields = [
      !!profile.name,
      !!profile.age,
      !!profile.gender,
      profile.bio && profile.bio.length > 0,
      profile.interests.length > 0,
      !!profile.location?.city,
      additionalInfo.height,
      additionalInfo.education,
      additionalInfo.job,
      additionalInfo.lookingFor && additionalInfo.lookingFor.length > 0,
      profile.photos && profile.photos.length > 0
    ];
    
    const completedFields = requiredFields.filter(Boolean).length;
    const percentage = Math.round((completedFields / requiredFields.length) * 100);
    setProfileCompletion(percentage);
  }, [profile, additionalInfo]);
  
  // Load saved profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedAdditionalInfo = localStorage.getItem('userAdditionalInfo');
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        // Ensure lastActive is a Date object
        parsedProfile.lastActive = new Date(parsedProfile.lastActive);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
    
    if (savedAdditionalInfo) {
      try {
        setAdditionalInfo(JSON.parse(savedAdditionalInfo));
      } catch (error) {
        console.error('Error parsing saved additional info:', error);
      }
    }
  }, []);
  
  // Update bio character count
  useEffect(() => {
    setBioCharCount(profile.bio?.length || 0);
  }, [profile.bio]);
  
  // Handle text input changes for basic profile info
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => {
        const parentObj = prev[parent as keyof typeof prev] || {};
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle changes for additional info
  const handleAdditionalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'interestsDescription') {
      // Track character count for interests description
      if (value.length <= INTERESTS_DESC_LIMIT) {
        setInterestsDescCharCount(value.length);
        setAdditionalInfo(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'dreams') {
      // Track character count for dreams/future plans
      if (value.length <= DREAMS_LIMIT) {
        setAdditionalInfo(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setAdditionalInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  
  // Handle bio input with character limit
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= BIO_LIMIT) {
      setProfile(prev => ({
        ...prev,
        bio: value
      }));
    }
  };
  
  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) {
        return {
          ...prev,
          interests: interests.filter(item => item !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...interests, interest]
        };
      }
    });
  };
  
  // Toggle looking for option
  const toggleLookingFor = (option: string) => {
    setAdditionalInfo(prev => {
      const lookingFor = prev.lookingFor || [];
      if (lookingFor.includes(option)) {
        return {
          ...prev,
          lookingFor: lookingFor.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          lookingFor: [...lookingFor, option]
        };
      }
    });
  };
  
  // Toggle language selection
  const toggleLanguage = (language: string) => {
    setAdditionalInfo(prev => {
      const languages = prev.languages || [];
      if (languages.includes(language)) {
        return {
          ...prev,
          languages: languages.filter(item => item !== language)
        };
      } else {
        return {
          ...prev,
          languages: [...languages, language]
        };
      }
    });
  };
  
  // Handle photo upload
  const handlePhotoUpload = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };
  
  // Process uploaded photo
  const processPhoto = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        const newPhotos = [...(profile.photos || [])];
        
        // If it's profile photo (index 0), make sure it's the first in the array
        if (index === 0) {
          newPhotos[0] = photoUrl;
        } else {
          // For additional photos, find next empty slot or replace at index
          if (index < newPhotos.length) {
            newPhotos[index] = photoUrl;
          } else {
            newPhotos.push(photoUrl);
          }
        }
        
        setProfile(prev => ({
          ...prev,
          photos: newPhotos
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setProfile(prev => {
      const newPhotos = [...(prev.photos || [])];
      newPhotos.splice(index, 1);
      
      // If removing profile photo, shift everything
      if (index === 0 && newPhotos.length > 0) {
        // First additional photo becomes new profile photo
      }
      
      return {
        ...prev,
        photos: newPhotos
      };
    });
  };
  
  // Initialize from existing profile if in edit mode
  useEffect(() => {
    if (props.existingProfile && props.existingAdditionalInfo) {
      setProfile(props.existingProfile);
      setAdditionalInfo(props.existingAdditionalInfo);
    }
  }, [props.existingProfile, props.existingAdditionalInfo]);

  // Convert a base64 image to a Blob for upload
  const base64ToBlob = async (base64String: string): Promise<Blob> => {
    const response = await fetch(base64String);
    return await response.blob();
  };

  // Save profile data
  // Validate the profile data before submission
  const validateProfile = () => {
    const errors: string[] = [];

    // Basic validation
    if (!profile.name) errors.push('Name is required');
    if (!profile.age || profile.age < 18) errors.push('Valid age (18+) is required');
    if (!profile.gender) errors.push('Gender is required');
    if (!profile.bio || profile.bio.length < 10) errors.push('Bio is required (minimum 10 characters)');

    // Location validation
    if (!profile.location?.city) errors.push('City is required');

    // At least one interest is required
    if (!profile.interests || profile.interests.length === 0) {
      errors.push('Please select at least one interest');
    }

    // At least one photo is recommended
    if (!profile.photos || profile.photos.length === 0) {
      errors.push('At least one photo is recommended');
    }

    // Validate preferences
    // if (!profile.preferences?.gender || profile.preferences.gender.length === 0) {
    //   errors.push('Please select at least one gender preference');
    // }

    // Return errors if any
    return errors;
  };

  // Upload profile photos to the server
  const uploadPhotos = async () => {
    const uploadedPhotoUrls: string[] = [];

    if (profile.photos && profile.photos.length > 0) {
      for (const photoData of profile.photos) {
        if (photoData) {
          try {
            // Create a form data object for the photo upload
            const formData = new FormData();
            
            // Convert base64 to blob if necessary
            let photoBlob;
            if (photoData.startsWith('data:')) {
              // It's a base64 string, convert to blob
              photoBlob = await base64ToBlob(photoData);
            } else if (typeof photoData === 'string' && !photoData.startsWith('http')) {
              // It's a local photo, retrieve from sessionStorage
              const storedPhoto = sessionStorage.getItem(photoData);
              if (storedPhoto) {
                photoBlob = await base64ToBlob(storedPhoto);
              }
            }

            // If we have a blob, append it to the form data
            if (photoBlob) {
              formData.append('photo', photoBlob, 'profile-photo.jpg');
              
              // Send the photo to the server
              const response = await fetch('/api/profile/upload-photo', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
              });

              if (response.ok) {
                const result = await response.json();
                uploadedPhotoUrls.push(result.photoUrl);
              } else {
                console.error('Failed to upload photo:', await response.text());
              }
            } else if (photoData.startsWith('http')) {
              // It's already a URL, just add it to the list
              uploadedPhotoUrls.push(photoData);
            }
          } catch (err) {
            console.error('Error uploading photo:', err);
          }
        }
      }
    }

    return uploadedPhotoUrls;
  };

  const saveProfile = async () => {
    try {
      // First validate the profile data
      const validationErrors = validateProfile();
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
        return;
      }

      // Show a loading indicator
      setIsLoading(true);

      // Upload photos and get their URLs
      const photoUrls = await uploadPhotos();

      // Prepare the complete profile data to send to the server
      const completeProfile = {
        profile: {
          ...profile,
          photos: photoUrls,
          // Add additional info to the profile object
          ...additionalInfo,
          // Update timestamp
          lastActive: new Date().toISOString()
        }
      };

      // Also save locally as a backup
      localStorage.setItem('userProfile', JSON.stringify(completeProfile.profile));
      localStorage.setItem('userAdditionalInfo', JSON.stringify(additionalInfo));

      // Send the profile data to the server
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(completeProfile)
      });

      if (response.ok) {
        // Hide loading indicator
        setIsLoading(false);
        
        // Show success notification
        alert('Profile saved successfully!');
        
        // Call the callback if provided
        if (props.onProfileSaved) {
          props.onProfileSaved();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }
    } catch (error) {
      // Hide loading indicator
      setIsLoading(false);
      
      console.error('Error saving profile:', error);
      alert(`There was an error saving your profile: ${error instanceof Error ? error.message : 'Unknown error'}.\n\nYour profile has been saved locally as a backup.`);
      
      // Still call the callback if provided (since we have local backup)
      if (props.onProfileSaved) {
        props.onProfileSaved();
      }
    }
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  // This duplicate detectLocation function was removed

  return (
    <div className={styles.profileCreationContainer} style={{ backgroundColor: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {/* Header */}
      <motion.h1 
        className={styles.formTitle}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Create Your Profile
      </motion.h1>
      <motion.p 
        className={styles.formSubtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Let's get your profile set up so you can start connecting with others!
      </motion.p>
      
      {/* Profile Photo Upload */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <h2 className={styles.sectionTitle}>Your Profile Photo</h2>
        <div className={styles.profilePhotoUpload} onClick={() => handlePhotoUpload(0)}>
          {profile.photos?.[0] ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img 
                src={profile.photos[0]} 
                alt="Profile" 
                className={styles.photoPreview} 
              />
              {/* WhatsApp-style camera overlay */}
              <div className={styles.cameraOverlay}>
                <div className={styles.photoUploadIcon}>
                  <FaCamera />
                </div>
                <p className={styles.photoUploadText}>Change photo</p>
              </div>
              <button 
                className={styles.removePhotoBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(0);
                }}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <div className={styles.photoUploadIcon}>
                <FaCamera size={24} />
              </div>
              <p className={styles.photoUploadText}>Add profile photo</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => processPhoto(e, 0)}
            ref={el => { fileInputRefs.current[0] = el }}
            style={{ display: 'none' }}
          />
        </div>
      </motion.div>
      
      {/* Basic Information */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Name</label>
          <input
            type="text"
            name="name"
            value={profile.name || ''}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Your name"

          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Age</label>
          <select
            name="age"
            value={profile.age || ''}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            {AGE_OPTIONS.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Sexuality</label>
          <select
            name="sexuality"
            value={additionalInfo.sexuality}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your sexuality</option>
            {SEXUALITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Gender</label>
          <select
            name="gender"
            value={profile.gender || ''}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Height (cm)</label>
          <select
            name="height"
            value={additionalInfo.height}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your height</option>
            {HEIGHT_OPTIONS.map(height => (
              <option key={height} value={`${height}`}>{height} cm</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Weight (kg)</label>
          <select
            name="weight"
            value={additionalInfo.weight}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your weight</option>
            {WEIGHT_OPTIONS.map(weight => (
              <option key={weight} value={`${weight}`}>{weight} kg</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Marital Status</label>
          <select
            name="maritalStatus"
            value={additionalInfo.maritalStatus}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your marital status</option>
            {MARITAL_STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Body Type</label>
          <select
            name="bodyType"
            value={additionalInfo.bodyType}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your body type</option>
            {BODY_TYPE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Skin Color</label>
          <select
            name="skinColor"
            value={additionalInfo.skinColor}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your skin color</option>
            {SKIN_COLOR_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ethnicity</label>
          <select
            name="ethnicity"
            value={additionalInfo.ethnicity}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your ethnicity</option>
            {ETHNICITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Religion</label>
          <select
            name="religion"
            value={additionalInfo.religion}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your religion</option>
            {RELIGION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </motion.div>
      
      {/* Looking For */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>Looking For</h2>
        <div className={styles.optionTabs}>
          {LOOKING_FOR_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              className={`${styles.optionTab} ${additionalInfo.lookingFor?.includes(option) ? styles.active : ''}`}
              onClick={() => toggleLookingFor(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Location */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>Location</h2>
        <div className={styles.locationContainer} style={{ maxWidth: '90%' }}>
          <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0, maxWidth: '45%' }}>
            <label className={styles.formLabel} style={{ fontSize: '0.75rem', marginBottom: '2px' }}>City</label>
            <input
              type="text"
              name="location.city"
              value={profile.location?.city || ''}
              onChange={handleInputChange}
              className={`${styles.formInput} ${styles.smallInput}`}
              placeholder="City"
              style={{ width: '100%' }}
            />
          </div>
          
          <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0, maxWidth: '45%' }}>
            <label className={styles.formLabel} style={{ fontSize: '0.75rem', marginBottom: '2px' }}>State/Province</label>
            <input
              type="text"
              name="location.state"
              value={profile.location?.state || ''}
              onChange={handleInputChange}
              className={`${styles.formInput} ${styles.smallInput}`}
              placeholder="State/Province"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        <div className={styles.locationField}>
          <button 
            type="button" 
            className={styles.detectLocationButton}
            onClick={detectLocation}
            disabled={detectingLocation}
          >
            {detectingLocation ? 'Detecting...' : 'Detect Location'}
          </button>
          {locationError && (
            <div className={styles.errorMessage}>{locationError}</div>
          )}
        </div>
      </motion.div>
      
      {/* Interests */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7 }}
      >
        <h2 className={styles.sectionTitle}>Interests</h2>
        <label className={styles.formLabel}>Select your interests (select all that apply)</label>
        <div className={styles.chipContainer}>
          {INTERESTS.map(interest => (
            <div
              key={interest}
              className={`${styles.chip} ${profile.interests?.includes(interest) ? styles.selected : ''}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
              {profile.interests?.includes(interest) && <FaCheck size={12} />}
            </div>
          ))}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>What do you love, enjoy, or feel passionate about?</label>
          <div style={{ width: '100%' }}>
            <textarea
              name="interestsDescription"
              value={additionalInfo.interestsDescription}
              onChange={handleAdditionalInfoChange}
              className={`${styles.formInput} ${styles.textarea}`}
              placeholder="Tell us more about your interests, hobbies, and passions in your own words..."
              rows={4}
              maxLength={INTERESTS_DESC_LIMIT}
              data-component-name="ProfileCreation"
            />
            <div className={styles.characterCount} style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {interestsDescCharCount}/{INTERESTS_DESC_LIMIT}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Education and Work */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
      >
        <h2 className={styles.sectionTitle}>Education & Work</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Education</label>
          <select
            name="education"
            value={additionalInfo.education}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your education</option>
            {EDUCATION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel} data-component-name="ProfileCreation">College Name</label>
          <input
            type="text"
            name="job"
            value={additionalInfo.job}
            onChange={handleAdditionalInfoChange}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} data-component-name="ProfileCreation">Degree (optional)</label>
          <input
            type="text"
            name="degree"
            value={additionalInfo.degree || ''}
            onChange={handleAdditionalInfoChange}
            className={styles.formInput}
            data-component-name="ProfileCreation"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} data-component-name="ProfileCreation">What job do you do?</label>
          <input
            type="text"
            name="jobTitle"
            value={additionalInfo.jobTitle}
            onChange={handleAdditionalInfoChange}
            className={styles.formInput}
            placeholder="Write what job you do"
            data-component-name="ProfileCreation"
          />
        </div>
      </motion.div>
      
      {/* Lifestyle */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.9 }}
      >
        <h2 className={styles.sectionTitle}>Lifestyle</h2>
        

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Drinking</label>
          <select
            name="drinking"
            value={additionalInfo.drinking}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="sometimes">Sometimes</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Smoking</label>
          <select
            name="smoking"
            value={additionalInfo.smoking}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="sometimes">Sometimes</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Diet</label>
          <select
            name="diet"
            value={additionalInfo.diet}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your diet</option>
            {DIET_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Sleep Schedule</label>
          <select
            name="sleepSchedule"
            value={additionalInfo.sleepSchedule}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your sleep schedule</option>
            {SLEEP_SCHEDULE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Fitness Level</label>
          <select
            name="fitnessLevel"
            value={additionalInfo.fitnessLevel}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your fitness level</option>
            {FITNESS_LEVEL_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Work-Life Balance</label>
          <select
            name="workLifeBalance"
            value={additionalInfo.workLifeBalance}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your work-life balance</option>
            {WORK_LIFE_BALANCE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Living Situation</label>
          <select
            name="livingSituation"
            value={additionalInfo.livingSituation}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your living situation</option>
            {LIVING_SITUATION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Travel Preference</label>
          <select
            name="travelPreference"
            value={additionalInfo.travelPreference}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your travel preference</option>
            {TRAVEL_PREFERENCE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Relationship with Family</label>
          <select
            name="familyRelationship"
            value={additionalInfo.familyRelationship}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your relationship with family</option>
            {FAMILY_RELATIONSHIP_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Financial Situation (Optional)</label>
          <select
            name="financialSituation"
            value={additionalInfo.financialSituation}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your financial situation</option>
            {FINANCIAL_SITUATION_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Social Life</label>
          <select
            name="socialLife"
            value={additionalInfo.socialLife}
            onChange={handleAdditionalInfoChange}
            className={styles.formSelect}
          >
            <option value="">Select your social life</option>
            {SOCIAL_LIFE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </motion.div>
      
      {/* Languages */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.0 }}
      >
        <h2 className={styles.sectionTitle}>Languages</h2>
        <label className={styles.formLabel}>Languages you speak (select all that apply)</label>
        <div className={styles.chipContainer} data-component-name="ProfileCreation">
          {LANGUAGE_OPTIONS.map(language => (
            <div
              key={language}
              className={`${styles.chip} ${additionalInfo.languages?.includes(language) ? styles.selected : ''}`}
              onClick={() => toggleLanguage(language)}
            >
              {language}
              {additionalInfo.languages?.includes(language) && <FaCheck size={12} />}
            </div>
          ))}
        </div>

        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
          <label className={styles.formLabel}>Languages you're learning (optional)</label>
          <textarea
            name="languagesLearning"
            value={additionalInfo.languagesLearning}
            onChange={handleAdditionalInfoChange}
            className={`${styles.formInput} ${styles.textarea}`}
            placeholder="Tell us about any languages you're currently learning or want to learn..."
            rows={1}
            style={{ minHeight: '32px', padding: '6px 10px' }}
            data-component-name="ProfileCreation"
          />
        </div>
      </motion.div>
      
      {/* Bio */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2 }}
      >
        <h2 className={styles.sectionTitle}>About You</h2>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} style={{ fontSize: '0.85rem', marginBottom: 5 }}>Write a short bio</label>
          <div style={{ width: '100%' }}>
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleBioChange}
              className={styles.textarea}
              placeholder="Tell something about yourself..."
              maxLength={BIO_LIMIT}
            />
            <div className={styles.characterCount} style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {bioCharCount}/{BIO_LIMIT}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Photos */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2 }}
      >
        <h2 className={styles.sectionTitle}>Additional Photos</h2>
        <p className={styles.photoUploadText}>Add up to 6 additional photos to showcase your personality</p>
        
        <div className={styles.photoGrid}>
          {Array.from({ length: 6 }).map((_, index) => {
            const photoIndex = index + 1; // +1 because index 0 is the profile photo
            return (
              <div 
                key={index}
                className={styles.photoUploadBox}
                onClick={() => handlePhotoUpload(photoIndex)}
              >
                {profile.photos?.[photoIndex] ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img 
                      src={profile.photos[photoIndex]} 
                      alt={`Photo ${photoIndex}`} 
                      className={styles.photoPreview} 
                    />
                    <button 
                      className={styles.removePhotoBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photoIndex);
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.photoUploadIcon}>
                      <FaPlus />
                    </div>
                    <p className={styles.photoUploadText}>Add Photo</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => processPhoto(e, photoIndex)}
                  ref={el => { fileInputRefs.current[photoIndex] = el }}
                  style={{ display: 'none' }}
                />
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Save Button with Progress Bar Below */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <button 
          className={styles.saveBtn}
          disabled={profileCompletion < 60 || isLoading}
          onClick={saveProfile}
        >
          {isLoading ? 'Saving...' : (props.isEditing ? 'Update Profile' : 'Save Profile')}
        </button>
        
        {/* Progress Bar - Moved below save button */}
        <div className={styles.progressSection}>
          <div className={styles.progressContainer}>
            <p className={styles.progressText}>
              Completion: {profileCompletion}%
            </p>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}