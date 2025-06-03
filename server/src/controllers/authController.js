import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.TOKEN_EXPIRY || '7d' }
  );
};

// Handle successful OAuth authentication
export const authCallback = (req, res) => {
  try {
    if (!req.user) {
      console.error('Auth callback received no user');
      return res.redirect(`${process.env.CLIENT_URL}/auth/failure?error=authentication_failed`);
    }
    
    console.log('Auth callback successful for user:', req.user.email);
    console.log('User details:', JSON.stringify(req.user, null, 2));
    
    // Generate JWT token including all necessary user data
    const token = generateToken(req.user);
    
    // Ensure the CLIENT_URL is correct
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    console.log('Using client URL:', clientUrl);
    
    // Create a redirect URL to the auth success page with the token
    const redirectUrl = `${clientUrl}/auth/success?token=${token}`;
    console.log('Redirecting to:', redirectUrl);
    
    // Set CORS headers to ensure redirect works properly
    res.header('Access-Control-Allow-Origin', clientUrl);
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Redirect to frontend with token
    // The frontend will handle the token and redirect to the homepage
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/failure?error=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
};

// Admin login
export const adminLogin = async (req, res, next) => {
  passport.authenticate('admin-login', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ message: info ? info.message : 'Invalid credentials' });
    }
    
    // Generate JWT token for admin
    const token = generateToken(user);
    
    // Return user data and token
    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        photoURL: user.photoURL
      }
    });
  })(req, res, next);
};

// Register a new admin (this should be properly secured in production)
export const createAdmin = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const admin = new User({
      displayName,
      email,
      password: hashedPassword,
      provider: 'admin', // Using admin as provider to distinguish from OAuth users
      providerId: email, // Using email as providerId for admin users
      role: 'admin',
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
    });
    
    await admin.save();
    
    // Generate token
    const token = generateToken(admin);
    
    res.status(201).json({
      token,
      user: {
        _id: admin._id,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
        photoURL: admin.photoURL
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const searchQuery = search 
      ? {
          $or: [
            { displayName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { provider: { $regex: search, $options: 'i' } },
          ]
        } 
      : {};
      
    const users = await User.find(searchQuery)
      .select('-__v')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
      
    const total = await User.countDocuments(searchQuery);
    
    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Prevent changing your own role
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-__v');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
