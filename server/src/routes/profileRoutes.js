import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePhoto, 
  setMainProfilePhoto, 
  deleteProfilePhoto, 
  upload 
} from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All profile routes are protected
router.use(protect);

// Get user profile (own or specific user by ID)
router.get('/', getProfile);
router.get('/:userId', getProfile);

// Update profile
router.put('/update', updateProfile);

// Photo management
router.post('/upload-photo', upload.single('photo'), uploadProfilePhoto);
router.put('/set-main-photo', setMainProfilePhoto);
router.delete('/delete-photo', deleteProfilePhoto);

export default router;
