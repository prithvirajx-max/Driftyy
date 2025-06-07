import { db } from '../config/firebase'; // Your Firebase config
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfileLocation {
  city?: string;
  state?: string;
}

export interface UserProfilePreferences {
  minAge?: number;
  maxAge?: number;
  gender?: string[]; // Optional array of strings
}

export interface UserProfileData {
  bio?: string;
  age?: number;
  gender?: string;
  location?: UserProfileLocation;
  interests?: string[];
  photos?: string[]; // Array of photo URLs from Firebase Storage
  preferences?: UserProfilePreferences;
  height?: string;
  weight?: string;
  sexuality?: string;
  maritalStatus?: string;
  bodyType?: string;
  skinColor?: string;
  ethnicity?: string;
  education?: string;
  job?: string;
  jobTitle?: string;
  religion?: string;
  interestsDescription?: string;
  languagesLearning?: string;
  dreams?: string;
  degree?: string;
  diet?: string;
  sleepSchedule?: string;
  fitnessLevel?: string;
  workLifeBalance?: string;
  livingSituation?: string;
  travelPreference?: string;
  familyRelationship?: string;
  financialSituation?: string;
  socialLife?: string;
  drinking?: string;
  smoking?: string;
  languages?: string[];
  lookingFor?: string[];
}

export interface UserProfile {
  uid: string; // Google User ID (sub claim)
  email: string; // From Google profile, can be primary contact
  displayName: string; // From Google profile, user can update this as their main display name
  username?: string; // Optional user-defined unique username
  photoURL?: string; // Main profile picture URL (from Firebase Storage)
  phoneNumber?: string; // Optional phone number
  profile?: UserProfileData; // Contains all detailed profile information
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Add any other top-level fields that are stored directly in the Firestore user document
  // For example, if fcmTokens or role are managed here from frontend directly
}

const USER_COLLECTION = 'users';

/**
 * Fetches a user's profile from Firestore.
 * Returns null if the profile doesn't exist.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log('No such user profile for ID:', userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error; // Or handle more gracefully
  }
};

/**
 * Creates a new user profile in Firestore or updates basic info if it exists.
 * Typically called after a new user logs in via Google for the first time.
 */
export const createOrUpdateUserProfile = async (
  googleUser: { id: string; email: string | null; name: string | null; picture?: string | null; }
): Promise<UserProfile> => {
  if (!googleUser || !googleUser.id) {
    throw new Error("User ID is required to create or update profile.");
  }

  const userDocRef = doc(db, USER_COLLECTION, googleUser.id);
  const docSnap = await getDoc(userDocRef);

  let userProfileData: UserProfile;

  if (docSnap.exists()) {
    // Profile exists, update basic info if necessary (name, email from Google)
    const existingData = docSnap.data() as UserProfile;
    // Profile exists, update basic info if necessary (displayName, email from Google)
    // Keep existing detailed profile, only update top-level fields from Google if they've changed
    const updatedData: Partial<UserProfile> = {
      displayName: googleUser.name || existingData.displayName || '',
      email: googleUser.email || existingData.email || '',
      photoURL: googleUser.picture && (!existingData.photoURL || existingData.photoURL !== googleUser.picture) 
                       ? googleUser.picture 
                       : existingData.photoURL,
      updatedAt: serverTimestamp() as Timestamp,
    };
    // Ensure 'profile' field exists if it doesn't, to avoid issues with partial updates to nested fields later
    if (!existingData.profile) {
      updatedData.profile = {}; // Initialize with an empty profile object if it's missing
    }
    await setDoc(userDocRef, updatedData, { merge: true });
    const updatedSnap = await getDoc(userDocRef);
    return updatedSnap.data() as UserProfile;

  } else {
    // Profile doesn't exist, create a new one
    // Profile doesn't exist, create a new one with basic info and an empty profile object
    userProfileData = {
      uid: googleUser.id,
      email: googleUser.email || '',
      displayName: googleUser.name || '',
      username: '', // User can set this later
      photoURL: googleUser.picture || '', // Use Google picture if available
      profile: { // Initialize with an empty profile structure
        preferences: {
          gender: [] // Initialize gender preference as an empty array (optional)
        },
        photos: [] // Initialize photos array
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(userDocRef, userProfileData);
    const newSnap = await getDoc(userDocRef);
    return newSnap.data() as UserProfile;
  }
};

/**
 * Updates specific fields of a user's profile.
 */
// dataToUpdate can be a flat object with top-level fields like 'displayName', 'username'
// or it can include a nested 'profile' object: { profile: { bio: 'new bio', age: 30 } }
export const updateUserProfile = async (userId: string, dataToUpdate: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>) => {
  if (!userId) throw new Error("User ID is required to update profile.");

  const userDocRef = doc(db, USER_COLLECTION, userId);
  const updatePayload = {
    ...dataToUpdate,
    updatedAt: serverTimestamp()
  };

  await setDoc(userDocRef, updatePayload, { merge: true });
  console.log("Profile updated for user:", userId);
  const updatedSnap = await getDoc(userDocRef);
  return updatedSnap.data() as UserProfile;
};
