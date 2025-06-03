import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

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

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // Allow getting profile of authenticated user or specific user (for admins)
    let userId = req.params.userId || req.user._id;
    
    // Find the user with all profile fields
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        profile: user.profile,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile (handles all profile fields)
export const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received');
    
    // Allow updating the authenticated user (from the token) without providing userId
    let userId = req.body.userId || req.user._id;
    
    if (!userId) {
      console.error('User ID missing from both request body and authentication token');
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Convert string ID to ObjectId if needed
    if (typeof userId === 'string') {
      userId = userId.toString();
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Extract fields from request body
    const { 
      phoneNumber,
      profile,
      displayName
    } = req.body;
    
    // Update basic user fields if provided
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (displayName) user.displayName = displayName;
    
    // Update all profile fields if provided
    if (profile) {
      // Ensure profile object exists
      if (!user.profile) {
        user.profile = {};
      }
      
      // Update basic profile fields
      if (profile.bio) user.profile.bio = profile.bio;
      if (profile.age) user.profile.age = profile.age;
      if (profile.gender) user.profile.gender = profile.gender;
      
      // Update location if provided
      if (profile.location) {
        if (!user.profile.location) {
          user.profile.location = {};
        }
        if (profile.location.city) user.profile.location.city = profile.location.city;
        if (profile.location.state) user.profile.location.state = profile.location.state;
      }
      
      // Update interests if provided
      if (profile.interests && Array.isArray(profile.interests)) {
        user.profile.interests = profile.interests;
      }
      
      // Update photos array if provided
      if (profile.photos && Array.isArray(profile.photos)) {
        user.profile.photos = profile.photos;
      }
      
      // Update preferences if provided
      if (profile.preferences) {
        if (!user.profile.preferences) {
          user.profile.preferences = {};
        }
        if (profile.preferences.minAge) user.profile.preferences.minAge = profile.preferences.minAge;
        if (profile.preferences.maxAge) user.profile.preferences.maxAge = profile.preferences.maxAge;
        if (profile.preferences.gender && Array.isArray(profile.preferences.gender)) {
          user.profile.preferences.gender = profile.preferences.gender;
        }
      }
      
      // Update all additional profile fields
      const additionalFields = [
        'height', 'weight', 'sexuality', 'maritalStatus', 'bodyType', 'skinColor',
        'ethnicity', 'education', 'job', 'jobTitle', 'religion', 'interestsDescription',
        'languagesLearning', 'dreams', 'degree', 'diet', 'sleepSchedule', 'fitnessLevel',
        'workLifeBalance', 'livingSituation', 'travelPreference', 'familyRelationship',
        'financialSituation', 'socialLife', 'drinking', 'smoking'
      ];
      
      additionalFields.forEach(field => {
        if (profile[field] !== undefined) {
          user.profile[field] = profile[field];
        }
      });
      
      // Update array fields
      if (profile.languages && Array.isArray(profile.languages)) {
        user.profile.languages = profile.languages;
      }
      
      if (profile.lookingFor && Array.isArray(profile.lookingFor)) {
        user.profile.lookingFor = profile.lookingFor;
      }
    }
    
    // Save the updated user
    await user.save();
    
    console.log(`Updated profile for user ${userId}`);
    
    res.status(200).json({
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        profile: user.profile
      }
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Create file URL
    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Add to photos array in profile
    if (!user.profile) {
      user.profile = {};
    }
    if (!user.profile.photos) {
      user.profile.photos = [];
    }
    
    user.profile.photos.push(fileUrl);
    
    // If this is the first photo or if photoURL is not set, also set it as the profile picture
    if (!user.photoURL) {
      user.photoURL = fileUrl;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: fileUrl,
      photos: user.profile.photos
    });
    
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Set profile photo as main profile picture
export const setMainProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user._id;
    
    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if the photo exists in the user's photos array
    if (!user.profile?.photos?.includes(photoUrl)) {
      return res.status(400).json({ success: false, message: 'Photo not found in user profile' });
    }
    
    // Set as main profile photo
    user.photoURL = photoUrl;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Main profile photo updated successfully',
      photoURL: user.photoURL
    });
    
  } catch (error) {
    console.error('Error setting main profile photo:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete profile photo
export const deleteProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user._id;
    
    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if photo exists in array
    if (!user.profile?.photos?.includes(photoUrl)) {
      return res.status(400).json({ success: false, message: 'Photo not found in user profile' });
    }
    
    // Remove from photos array
    user.profile.photos = user.profile.photos.filter(photo => photo !== photoUrl);
    
    // If this was the main profile photo, set another one or clear it
    if (user.photoURL === photoUrl) {
      user.photoURL = user.profile.photos.length > 0 ? user.profile.photos[0] : null;
    }
    
    await user.save();
    
    // Attempt to delete the file from the server
    try {
      const filePath = path.join(__dirname, '../..', photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Could not delete photo file:', fileError.message);
      // Continue anyway as the photo was removed from the user profile
    }
    
    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      photos: user.profile.photos,
      photoURL: user.photoURL
    });
    
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
