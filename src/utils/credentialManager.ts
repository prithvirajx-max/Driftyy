/**
 * Utility functions for managing user credentials and auto-detection
 */

// Define interfaces for the Credential Management API
interface PasswordCredential extends Credential {
  password?: string;
  name?: string;
  iconURL?: string;
}

interface CredentialRequestOptions {
  password?: boolean;
  mediation?: 'silent' | 'optional' | 'required';
}

/**
 * Attempts to detect the user's email from browser credentials.
 * This uses the Credential Management API if available.
 * 
 * @returns Promise resolving to the detected email or null if none found
 */
export const detectUserEmail = async (): Promise<string | null> => {
  try {
    // Check if Credential Management API is available
    if (window.navigator.credentials && 'get' in window.navigator.credentials) {
      try {
        // Attempt to get saved credentials
        const options: CredentialRequestOptions = {
          password: true,
          mediation: 'silent' // Don't show any UI
        };
        
        const credential = await window.navigator.credentials.get(options) as PasswordCredential | null;
        
        if (credential && credential.type === 'password' && credential.id) {
          // The id field contains the username/email
          return credential.id;
        }
      } catch (e) {
        console.warn('Credential API available but credential retrieval failed:', e);
      }
    }
    
    // Try to get email from localStorage if available (from previous sessions)
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData && userData.email) {
          return userData.email;
        }
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting user email:', error);
    return null;
  }
};

/**
 * Store credentials for future auto-detection.
 * This should be called after successful login/signup.
 * 
 * @param email User's email
 */
export const storeCredentials = async (email: string): Promise<void> => {
  try {
    // Only proceed if the Credential Management API is available
    if (window.navigator.credentials && 'store' in window.navigator.credentials) {
      // Use a fallback approach that works better across browsers
      try {
        // For browsers that fully support the Credential Management API
        if ('PasswordCredential' in window) {
          // @ts-ignore - TypeScript doesn't recognize PasswordCredential constructor
          const credential = new window.PasswordCredential({
            id: email,
            name: email,
            password: 'placeholder' // Need a placeholder value, not used for actual auth
          });
          
          await window.navigator.credentials.store(credential);
          return;
        }
      } catch (e) {
        console.warn('Modern credential API failed, trying alternative:', e);
      }
      
      // Store in localStorage as a fallback
      localStorage.setItem('user_email', email); 
      localStorage.setItem('last_login_email', email);
    }
  } catch (error) {
    console.error('Error storing credentials:', error);
  }
};


