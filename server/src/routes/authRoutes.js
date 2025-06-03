import express from 'express';
import passport from 'passport';
import { 
  authCallback, 
  getCurrentUser, 
  getAllUsers, 
  logout,
  adminLogin, 
  createAdmin,
  deleteUser,
  updateUserRole
} from '../controllers/authController.js';
import { updateProfile } from '../controllers/profileController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google auth route hit, redirecting to Google');
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'openid'],
    prompt: 'select_account',
    accessType: 'offline'
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google callback route hit');
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/failure?error=google_auth_failed`
  })(req, res, next);
}, authCallback);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth/failure' }),
  authCallback
);

// Admin auth routes
router.post('/admin/login', adminLogin);
router.post('/admin/register', protect, adminOnly, createAdmin); // Requires existing admin to create new admin

// User management routes
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:userId', protect, adminOnly, deleteUser);
router.patch('/users/:userId/role', protect, adminOnly, updateUserRole);

// Logout
router.get('/logout', logout);

// Profile update (for phone verification)
router.post('/update-profile', protect, updateProfile);

// Auth status route - useful for validating tokens
router.get('/status', protect, (req, res) => {
  res.json({ 
    status: 'authenticated', 
    user: { 
      id: req.user._id,
      role: req.user.role 
    } 
  });
});

export default router;
