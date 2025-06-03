import User from '../models/User.js';

// Search users by phone number (exact match or partial)
export const searchUsersByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    // Allow partial match for flexibility
    const users = await User.find({ phoneNumber: { $regex: phoneNumber, $options: 'i' } }, '-password');
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }
    // Only return safe fields
    const safeUsers = users.map(u => ({
      _id: u._id,
      displayName: u.displayName,
      photoURL: u.photoURL,
      phoneNumber: u.phoneNumber
    }));
    return res.status(200).json({ success: true, users: safeUsers });
  } catch (err) {
    console.error('Error searching users by phone:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
