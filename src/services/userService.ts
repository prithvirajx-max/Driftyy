import { db } from '../config/firebase'; // Your Firebase config
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string; // From Google profile
  name: string; // From Google profile, user can update
  username?: string; // User-defined, should be unique
  bio?: string;
  profilePictureUrl?: string;
  website?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
    const updatedData: Partial<UserProfile> = {
      name: googleUser.name || existingData.name || '',
      email: googleUser.email || existingData.email || '',
      // Preserve existing username and bio unless explicitly changed elsewhere
      // profilePictureUrl will be updated if Google's picture is newer or not set
      profilePictureUrl: googleUser.picture && (!existingData.profilePictureUrl || existingData.profilePictureUrl !== googleUser.picture) 
                         ? googleUser.picture 
                         : existingData.profilePictureUrl,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(userDocRef, updatedData, { merge: true });
    const updatedSnap = await getDoc(userDocRef);
    return updatedSnap.data() as UserProfile;

  } else {
    // Profile doesn't exist, create a new one
    userProfileData = {
      uid: googleUser.id,
      email: googleUser.email || '',
      name: googleUser.name || '',
      username: '', // User can set this later
      bio: '',
      profilePictureUrl: googleUser.picture || '', // Use Google picture if available
      website: '',
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
export const updateUserProfile = async (userId: string, dataToUpdate: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => {
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
