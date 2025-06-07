import User from '../models/User.js'; // Still needed for req.user context from Passport
import multer from 'multer';
import path from 'path'; // Still needed for path.extname
import { bucket, db } from '../config/firebaseAdmin.js'; // Import Firebase bucket AND db (Firestore)
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

// Get directory name in ES modules (optional, may not be needed anymore)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Get user profile from Firestore
export const getProfile = async (req, res) => {
  try {
    // userId comes from the authenticated user (via Passport and Mongoose User ID) or a param
    let userId = req.params.userId || req.user._id.toString(); // Ensure it's a string for Firestore doc ID

    const userDocRef = db.collection('users').doc(userId);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists()) {
      // Optionally, fetch basic info from Mongoose User model if Firestore profile doesn't exist yet
      // This can happen if createOrUpdateUserProfile in frontend service hasn't run yet for an existing Mongoose user
      const mongooseUser = await User.findById(userId);
      if (mongooseUser) {
        // Return a basic profile structure based on Mongoose user, indicating profile might be incomplete
        return res.status(200).json({
          success: true,
          message: 'Basic user info found, full profile may not be set up in Firestore yet.',
          user: {
            id: mongooseUser._id.toString(),
            displayName: mongooseUser.displayName,
            email: mongooseUser.email,
            photoURL: mongooseUser.photoURL, // This might be an old local URL or a Firebase URL if previously set
            // No 'profile' object from Firestore yet
          }
        });
      }
      return res.status(404).json({ success: false, message: 'User profile not found in Firestore' });
    }

    res.status(200).json({
      success: true,
      user: { id: docSnap.id, ...docSnap.data() }
    });

  } catch (error) {
    console.error('Error getting profile from Firestore:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile in Firestore
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id.toString(); // ID of the authenticated user
    const dataToUpdate = req.body; // Expects { displayName, email, phoneNumber, profile: { ...details } }

    // Basic validation
    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided for update' });
    }

    const userDocRef = db.collection('users').doc(userId);

    // Prepare data for Firestore, ensuring we don't overwrite with undefined fields unintentionally
    // The client should send only the fields it wants to update, or the full profile object.
    // Using set with merge: true handles partial updates gracefully.
    const updatePayload = {
      updatedAt: new Date().toISOString(), // Add a timestamp for the update
    };

    if (dataToUpdate.displayName !== undefined) updatePayload.displayName = dataToUpdate.displayName;
    if (dataToUpdate.email !== undefined) updatePayload.email = dataToUpdate.email; // Usually email is fixed, but if changeable
    if (dataToUpdate.phoneNumber !== undefined) updatePayload.phoneNumber = dataToUpdate.phoneNumber;
    // photoURL is managed by photo upload functions

    if (dataToUpdate.profile && typeof dataToUpdate.profile === 'object') {
      updatePayload.profile = dataToUpdate.profile; // This will merge the nested profile object
    }
    
    // If you want to update specific Mongoose User fields (e.g., displayName for other parts of the app)
    // You can do it here, but primary profile source is Firestore.
    // Example: await User.findByIdAndUpdate(userId, { displayName: dataToUpdate.displayName });

    await userDocRef.set(updatePayload, { merge: true });

    const updatedDocSnap = await userDocRef.get();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully in Firestore',
      user: { id: updatedDocSnap.id, ...updatedDocSnap.data() }
    });

  } catch (error) {
    console.error('Error updating profile in Firestore:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Upload profile photo to Firebase Storage
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const userId = req.user._id.toString(); // Ensure string ID for Firestore
    const userDocRef = db.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      // This case should ideally be handled by frontend: profile should exist if user is uploading photos
      // Or, create a basic profile doc here if absolutely necessary.
      return res.status(404).json({ success: false, message: 'User profile not found in Firestore. Cannot upload photo.' });
    }
    let userProfileData = userDocSnap.data();

    // Generate a unique filename for Firebase Storage
    const originalName = req.file.originalname || 'photo';
    const extension = path.extname(originalName);
    const uniqueFilename = `profile-${userId}-${uuidv4()}${extension}`;
    const firebaseFilePath = `profiles/${userId}/${uniqueFilename}`;

    const file = bucket.file(firebaseFilePath);

    // Upload the file buffer to Firebase Storage
    await file.save(req.file.buffer, {
      public: true,
      metadata: { contentType: req.file.mimetype },
    });

    // Get the public URL
    const publicUrl = file.publicUrl();

    // Update Firestore document with the new photo URL
    const newPhotosArray = userProfileData.profile?.photos ? [...userProfileData.profile.photos, publicUrl] : [publicUrl];
    const updatePayload = {
      'profile.photos': newPhotosArray,
      updatedAt: new Date().toISOString(),
    };

    // If this is the first photo or if photoURL is not set, also set it as the profile picture
    if (!userProfileData.photoURL) {
      updatePayload.photoURL = publicUrl;
    }

    await userDocRef.update(updatePayload);
    userProfileData = { ...userProfileData, ...updatePayload }; // Reflect changes locally for response

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully to Firebase Storage',
      photoUrl: publicUrl,
      photos: userProfileData.profile?.photos || [],
    });

  } catch (error) {
    console.error('Error uploading profile photo to Firebase:', error);
    res.status(500).json({ success: false, message: 'Server error during Firebase upload', error: error.message });
  }
};

// Set profile photo as main profile picture
export const setMainProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user._id.toString(); // Ensure string ID for Firestore
    
    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }
    
    const userDocRef = db.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      return res.status(404).json({ success: false, message: 'User profile not found in Firestore' });
    }
    const userProfileData = userDocSnap.data();

    // Check if the photo exists in the user's photos array
    if (!userProfileData.profile?.photos?.includes(photoUrl)) {
      return res.status(400).json({ success: false, message: 'Photo not found in user profile. Cannot set as main.' });
    }

    // Set as main profile photo in Firestore
    await userDocRef.update({
      photoURL: photoUrl,
      updatedAt: new Date().toISOString(),
    });
    
    res.status(200).json({
      success: true, 
      message: 'Main profile photo updated successfully',
      photoURL: photoUrl // Return the new main photo URL
    });
    
  } catch (error) {
    console.error('Error setting main profile photo:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete profile photo from Firebase Storage and MongoDB
export const deleteProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user._id.toString(); // Ensure string ID for Firestore

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }

    const userDocRef = db.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      return res.status(404).json({ success: false, message: 'User profile not found in Firestore' });
    }
    let userProfileData = userDocSnap.data();

    // Check if photo exists in array
    if (!userProfileData.profile?.photos?.includes(photoUrl)) {
      return res.status(400).json({ success: false, message: 'Photo not found in user profile' });
    }

    // Attempt to delete the file from Firebase Storage
    try {
      // Extract object path from public URL. Example: https://storage.googleapis.com/BUCKET_NAME/OBJECT_PATH
      // The BUCKET_NAME is available in firebaseAdmin.js if needed, or can be parsed if consistent.
      // Assuming the URL structure is consistent and bucket name is known or part of the URL.
      const urlParts = new URL(photoUrl);
      const objectPath = urlParts.pathname.substring(urlParts.pathname.indexOf('/', 1) + 1); // Skips leading '/' and bucket name
      
      if (objectPath) {
        await bucket.file(objectPath).delete();
        console.log(`Successfully deleted ${objectPath} from Firebase Storage.`);
      } else {
        console.warn('Could not parse object path from photo URL:', photoUrl);
      }
    } catch (storageError) {
      console.error('Error deleting photo from Firebase Storage:', storageError.message);
      // Decide if you want to proceed if Firebase deletion fails. For now, we'll log and continue.
      // You might want to return an error here in a production system if Firebase deletion is critical.
    }

    // Remove from photos array in Firestore
    const updatedPhotosArray = userProfileData.profile.photos.filter(photo => photo !== photoUrl);
    const updatePayload = {
      'profile.photos': updatedPhotosArray,
      updatedAt: new Date().toISOString(),
    };

    // If this was the main profile photo, set another one or clear it
    if (userProfileData.photoURL === photoUrl) {
      updatePayload.photoURL = updatedPhotosArray.length > 0 ? updatedPhotosArray[0] : null;
    }

    await userDocRef.update(updatePayload);
    // For the response, reflect the changes
    userProfileData.profile.photos = updatedPhotosArray;
    if (userProfileData.photoURL === photoUrl) {
      userProfileData.photoURL = updatePayload.photoURL;
    }

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully from profile and Firebase Storage',
      photos: userProfileData.profile.photos,
      photoURL: userProfileData.photoURL,
    });

  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ success: false, message: 'Server error during photo deletion', error: error.message });
  }
};
