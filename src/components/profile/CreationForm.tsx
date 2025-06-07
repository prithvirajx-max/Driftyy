import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaCheck, FaTimes, FaCamera } from 'react-icons/fa';
import styles from './ProfileCreation.module.css';
import { User, ProfilePhoto } from '../../types/user';
import { v4 as uuidv4 } from 'uuid';
// Cascade: Adding Firebase and axios imports
import axios from 'axios';
import { getAuth, onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage, auth } from '../../firebaseConfig'; // auth is the initialized Firebase auth instance

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

// Firebase GoogleAuthProvider and signInWithPopup are no longer used here.
// Google Sign-In is handled by AuthContext via @react-oauth/google.

// Firebase app, auth, and db instances are now imported from '../../firebaseConfig.ts'

interface ProfileCreationProps {
  onProfileSaved?: () => void;
  existingProfile?: User;
  existingAdditionalInfo?: any;
  isEditing?: boolean;
}

// Firebase GoogleAuthProvider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default function ProfileCreation(props: ProfileCreationProps) {
  // Cascade: Adding auth state and logic
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);


  const handleFirebaseGoogleSignIn = async () => {
    if (!auth) {
      setAuthError("Firebase authentication service is not initialized.");
      return;
    }
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting firebaseUser and authLoading
      alert("Sign-in successful! Please try saving your profile again.");
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in cancelled. Please try again.');
      } else {
        setAuthError(err.message || "An error occurred during Google sign-in.");
      }
    }
  };

  useEffect(() => {
    if (!auth) { // Check if Firebase auth was initialized
      setAuthLoading(false);
      setAuthError("Firebase authentication service is not initialized. Please check your Firebase configuration.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      console.log('[Auth] onAuthStateChanged: firebaseUser:', currentFirebaseUser);
      setFirebaseUser(currentFirebaseUser);
      if (currentFirebaseUser) {
        setProfile((prevProfile) => ({ // Set ID immediately
          ...prevProfile,
          id: currentFirebaseUser.uid,
          name: prevProfile.name || currentFirebaseUser.displayName || '',
        }));

        // Attempt to load profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.profile) {
              const firestoreProfile = userData.profile;
              // Firestore stores ProfilePhoto[] (without 'file' property)
              // We need to ensure the objects are correctly typed as ProfilePhoto for the state
              const photosFromFirestore: ProfilePhoto[] = (firestoreProfile.photos || []).map((photoFromFileStore: any) => ({
                id: photoFromFileStore.id || uuidv4(), // Ensure ID exists
                storageUrl: photoFromFileStore.storageUrl,
                // Use storageUrl as previewUrl if previewUrl is missing or was a temporary blob
                previewUrl: (photoFromFileStore.previewUrl && photoFromFileStore.previewUrl.startsWith('http')) ? photoFromFileStore.previewUrl : photoFromFileStore.storageUrl,
                file: undefined, // No local file when loading from storage
                uploadProgress: undefined,
                error: undefined,
              }));

              setProfile(prev => ({ 
                ...prev, 
                ...firestoreProfile,
                photos: photosFromFirestore, // Set the transformed photos
                id: currentFirebaseUser.uid, // Ensure ID is from auth
                lastActive: firestoreProfile.lastActive?.seconds ? new Date(firestoreProfile.lastActive.seconds * 1000) : new Date()
              }));
            }
            if (userData.additionalInfo) {
              setAdditionalInfo(userData.additionalInfo);
            }
            console.log('User profile loaded from Firestore.');
          } else {
            // New user or no profile in Firestore, set defaults
            console.log('No profile found in Firestore for this user. Using defaults.');
            // Profile ID and name are already partially set above
            // Other defaults for profile and additionalInfo will remain as per initialState
          }
        } catch (error) {
          console.error('Error fetching user profile from Firestore:', error);
          setAuthError('Failed to load profile data.');
          // Fallback to default empty profile if Firestore fails
          setProfile({
            id: currentFirebaseUser.uid,
            name: currentFirebaseUser.displayName || '',
            age: 25,
            gender: 'male',
            bio: '',
            interests: [],
            photos: [] as ProfilePhoto[], // Initial state for photos is an empty array of ProfilePhoto
            location: { city: '', state: '' },
            preferences: { minAge: 18, maxAge: 45, gender: [] },
            lastActive: new Date(),
          });
          setAdditionalInfo({
            height: '', weight: '', sexuality: '', maritalStatus: '', bodyType: '',
            skinColor: '', ethnicity: '', education: '', job: '', jobTitle: '',
            religion: '', interestsDescription: '', languagesLearning: '', dreams: '',
            degree: '', diet: '', sleepSchedule: '', fitnessLevel: '', workLifeBalance: '',
            livingSituation: '', travelPreference: '', familyRelationship: '',
            financialSituation: '', socialLife: '', drinking: 'sometimes', smoking: 'no',
            languages: [], lookingFor: []
          });
        }

        // Sync auth data to your own backend (if still needed)
        try {
          const userDataToSync = {
            email: currentFirebaseUser.email,
            displayName: currentFirebaseUser.displayName,
            photoURL: currentFirebaseUser.photoURL,
            createdAt: currentFirebaseUser.metadata.creationTime,
            lastLogin: currentFirebaseUser.metadata.lastSignInTime,
          };
          // console.log('Syncing user data to backend:', userDataToSync); // Optional: keep if useful
          // await axios.post(`/api/profile/${currentFirebaseUser.uid}/sync-auth`, userDataToSync); // Commented out to prevent 404 if backend endpoint is not ready
        } catch (syncError: any) {
          console.error("Error syncing user data to backend:", syncError);
          // This error is secondary to profile loading, so might not set authError globally
        }

      } else {
        // User is signed out
        setProfile({
          id: uuidv4(), name: '', age: 25, gender: 'male', bio: '', interests: [], photos: [],
          location: { city: '', state: '' }, preferences: { minAge: 18, maxAge: 45, gender: [] }, lastActive: new Date()
        });
        setAdditionalInfo({
            height: '', weight: '', sexuality: '', maritalStatus: '', bodyType: '',
            skinColor: '', ethnicity: '', education: '', job: '', jobTitle: '',
            religion: '', interestsDescription: '', languagesLearning: '', dreams: '',
            degree: '', diet: '', sleepSchedule: '', fitnessLevel: '', workLifeBalance: '',
            livingSituation: '', travelPreference: '', familyRelationship: '',
            financialSituation: '', socialLife: '', drinking: 'sometimes', smoking: 'no',
            languages: [], lookingFor: []
        });
        setAuthError(null);
      }
      console.log('[Auth] onAuthStateChanged: Final check before setAuthLoading(false). currentFirebaseUser:', currentFirebaseUser);
      setAuthLoading(false);
    }); // End of onAuthStateChanged callback

    return () => unsubscribe(); // Cleanup function for useEffect
  }, []); // Empty dependency array to run only once on mount

  // The handleGoogleSignIn function that used Firebase signInWithPopup has been removed.
  // Google Sign-In is now managed by AuthContext.

  // Cascade: Conditional rendering logic for auth state will be prepended to the main return.
  // The original 'Profile state' and subsequent form logic will only render if firebaseUser is authenticated.
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
  
  // The useEffect hook for loading data from localStorage has been removed.
  // Data is now loaded from Firestore within the onAuthStateChanged listener.
  
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
      const newPhotoId = uuidv4();
      const objectUrl = URL.createObjectURL(file);
      const newPhotoEntry: ProfilePhoto = {
        id: newPhotoId,
        file: file,
        previewUrl: objectUrl,
        storageUrl: undefined // New file, no storage URL yet
      };

      setProfile(prev => {
        const currentPhotos = prev.photos ? [...prev.photos] : [];
        // Revoke old object URL if replacing an image that was a blob
        const photoBeingReplaced = currentPhotos[index];
        if (index < currentPhotos.length && photoBeingReplaced && typeof photoBeingReplaced.previewUrl === 'string' && photoBeingReplaced.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photoBeingReplaced.previewUrl);
        }

        if (index < currentPhotos.length) {
          currentPhotos[index] = newPhotoEntry;
        } else {
          // Ensure we don't exceed a max number of photos if applicable (e.g., 7 based on fileInputRefs)
          if (currentPhotos.length < 7) { 
            currentPhotos.push(newPhotoEntry);
          } else {
            // Optionally, replace the last one or show an error
            currentPhotos[index % 7] = newPhotoEntry; // Example: replace if trying to add beyond limit
            console.warn('Maximum photo limit reached. Replacing an existing photo slot.');
            URL.revokeObjectURL(objectUrl); // Revoke if not actually used due to limit
            return prev; // Or handle error appropriately
          }
        }
        return {
          ...prev,
          photos: currentPhotos
        };
      });
    }
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setProfile(prev => {
      const currentPhotos = prev.photos ? [...prev.photos] : [];
      if (index < 0 || index >= currentPhotos.length) return prev; // Invalid index

      const photoToRemove = currentPhotos[index];
      
      // Revoke object URL if it's a blob URL
      if (photoToRemove && typeof photoToRemove.previewUrl === 'string' && photoToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
      
      return {
        ...prev,
        photos: updatedPhotos
      };
    });
  };
  
  // Initialize from existing profile if in edit mode
  useEffect(() => {
    if (props.existingProfile && props.existingAdditionalInfo) {
      // Ensure photos from props are correctly formatted for component state
      const photosFromProps: ProfilePhoto[] = (props.existingProfile.photos || []).map((photoFromProp: ProfilePhoto) => ({
        id: photoFromProp.id || uuidv4(), // Ensure ID exists
        storageUrl: photoFromProp.storageUrl,
        // Use storageUrl as previewUrl if previewUrl is missing or was a temporary blob
        previewUrl: (photoFromProp.previewUrl && photoFromProp.previewUrl.startsWith('http')) 
                      ? photoFromProp.previewUrl 
                      : photoFromProp.storageUrl,
        file: undefined, // No local file when loading from props
        uploadProgress: photoFromProp.uploadProgress, // Preserve if present
        error: photoFromProp.error, // Preserve if present
      }));
      setProfile({...props.existingProfile, photos: photosFromProps });
      setAdditionalInfo(props.existingAdditionalInfo);
    }
  }, [props.existingProfile, props.existingAdditionalInfo]);

// The ProfilePhoto type from '../../types/user' will be used for photo entries.
// The base64ToBlob function is no longer needed with Firebase direct file uploads.

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

// Utility to remove undefined properties from an object, recursively
const cleanObjectForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) { // Base cases: primitives, null, Date instances
    return obj;
  }

  if (Array.isArray(obj)) {
    // Recursively clean items and then filter out any undefined values from the array
    return obj.map(item => cleanObjectForFirestore(item)).filter(item => item !== undefined);
  }

  // Handle objects
  const cleaned: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = cleanObjectForFirestore(value); // Recurse for nested objects/arrays
      }
    }
  }
  return cleaned;
};

  // Upload photos to Firebase Storage and get their updated ProfilePhoto objects
  const uploadAndGetPhotoUrls = async (photos: ProfilePhoto[], userId: string): Promise<ProfilePhoto[]> => {
    if (!storage || !userId) {
      console.error('Firebase Storage or User ID is not available for photo upload.');
      // Return only photos that already have a storageUrl, marking others as failed implicitly
      return photos.filter(p => p.storageUrl);
    }

    const uploadPromises = photos.map(async (photoEntry) => {
      if (photoEntry.file) {
        const photoIdToUse = photoEntry.id || uuidv4(); // Ensure ID exists
        const fileName = photoEntry.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const photoStorageRef = ref(storage, `users/${userId}/photos/${photoIdToUse}-${fileName}`);
        try {
          console.log(`Uploading ${fileName} to ${photoStorageRef.fullPath}...`);
          const snapshot = await uploadBytesResumable(photoStorageRef, photoEntry.file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return {
            ...photoEntry,
            storageUrl: downloadURL,
            previewUrl: downloadURL, // Update preview to the persistent URL
            file: undefined, // Clear the file object after upload
            error: undefined, // Clear any previous error
            uploadProgress: undefined // Clear progress
          };
        } catch (error: any) {
          console.error(`Error uploading photo ${photoEntry.file.name}:`, error);
          // If upload fails, keep existing storageUrl if present, otherwise mark error
          return {
            ...photoEntry,
            file: undefined, // Clear file even on failure to prevent re-upload attempts of same failed file
            error: error.message || 'Upload failed',
            // Keep existing storageUrl if this was an attempt to replace an existing photo
          };
        }
      } else if (photoEntry.storageUrl) {
        // This photo is already uploaded and not changed, ensure no file object lingers
        return { ...photoEntry, file: undefined, error: undefined, uploadProgress: undefined };
      }
      // If no file and no storageUrl, it's an invalid state or an empty slot, filter out later
      return null;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(photo => photo !== null) as ProfilePhoto[];
  };

  const saveProfile = async () => {
    console.log('[Auth] saveProfile: Attempting to save. firebaseUser:', firebaseUser, 'authLoading:', authLoading);

    if (!firebaseUser) {
      alert("You are not logged in. Please sign in with Google to save your profile.");
      handleFirebaseGoogleSignIn(); // Initiate Firebase Google Sign-In
      return; // Stop further execution, user will need to click save again after sign-in
    }

    // At this point, firebaseUser (from Firebase onAuthStateChanged) is available.
    // Proceed with profile validation and saving.

    const validationErrors = validateProfile();
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get current photos from state, ensure they are ProfilePhoto objects
      const photosToProcess: ProfilePhoto[] = (profile.photos || []).map(p => {
        if (typeof p === 'string') { // Should not happen with proper state management
          console.warn('Found string in profile.photos during save, converting:', p);
          return { id: uuidv4(), previewUrl: p, storageUrl: p, file: undefined };
        }
        return p;
      });

      // 2. Upload photos and get their updated states (with storageUrls, errors, etc.)
      const uploadedPhotoObjects = await uploadAndGetPhotoUrls(photosToProcess, firebaseUser.uid);

      // Update component state with results of uploads (e.g., new URLs, errors)
      setProfile(prev => ({ ...prev, photos: uploadedPhotoObjects }));

      // Filter out photos that failed to upload AND don't have an existing storageUrl
      const successfullyProcessedPhotos = uploadedPhotoObjects.filter(p => p.storageUrl);
      if (uploadedPhotoObjects.some(p => p.error && !p.storageUrl)) {
        alert('Some photos could not be uploaded. Please try again or remove them.');
        // Optionally, do not proceed with saving if critical photos failed
      }

      // 3. Prepare photos for Firestore (clean objects, only essential fields)
      const photosForFirestore = successfullyProcessedPhotos.map(p => ({
        id: p.id,
        storageUrl: p.storageUrl,
        // Ensure previewUrl is a persistent URL, not a blob URL
        previewUrl: (p.previewUrl && p.previewUrl.startsWith('http')) ? p.previewUrl : p.storageUrl,
        // Omit: file, uploadProgress, error from the Firestore object
      }));

      // 4. Prepare the rest of the profile data
      // Clean the profile and additionalInfo objects before spreading
      const cleanedProfile = cleanObjectForFirestore(profile);
      const cleanedAdditionalInfo = cleanObjectForFirestore(additionalInfo);

      const profileDataForFirestore = {
        ...cleanedProfile,
        id: firebaseUser.uid, // Ensure UID from auth user
        photos: photosForFirestore, // Use the cleaned and successfully uploaded/existing photos
        lastActive: new Date(), // Firestore will convert to Timestamp
      };

      // Ensure additionalInfoToSave is also cleaned
      const additionalInfoToSave = cleanedAdditionalInfo;

      // 5. Save to Firestore
      console.log('Data for Firestore - profile:', JSON.stringify(profileDataForFirestore, null, 2));
      console.log('Data for Firestore - additionalInfo:', JSON.stringify(additionalInfoToSave, null, 2));
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        profile: profileDataForFirestore,
        additionalInfo: additionalInfoToSave,
        uid: firebaseUser.uid, // Also store uid at the top level for easier querying if needed
        updatedAt: new Date(), // General timestamp for the record
      }, { merge: true });

      setIsLoading(false);
      alert('Profile saved successfully to Firebase!');

      localStorage.removeItem('userProfile');
      localStorage.removeItem('userAdditionalInfo');

      if (props.onProfileSaved) {
        props.onProfileSaved();
      }

    } catch (error) {
      setIsLoading(false);
      console.error('Error saving profile to Firebase:', error);
      alert(`There was an error saving your profile to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Decide if props.onProfileSaved should be called on error
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
                src={profile.photos[0]?.previewUrl || profile.photos[0]?.storageUrl} 
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
                      src={profile.photos[photoIndex]?.previewUrl || profile.photos[photoIndex]?.storageUrl} 
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
          disabled={authLoading || profileCompletion < 80 || isLoading}
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