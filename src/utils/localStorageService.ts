// src/utils/localStorageService.ts
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  // Add other profile fields as needed
}

const USER_PROFILE_KEY = 'driftly-user-profile';

export const saveUserProfile = (userData: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const clearUserProfile = (): void => {
  localStorage.removeItem(USER_PROFILE_KEY);
};
