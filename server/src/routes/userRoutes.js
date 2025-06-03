import express from 'express';
import { searchUsersByPhone } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Search users by phone number (protected route)
router.get('/search-by-phone', protect, searchUsersByPhone);

export default router;
