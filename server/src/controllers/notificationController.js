import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

// Get all notifications for the current user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all unread notifications first, then read notifications (limit to last 20)
    const unreadNotifications = await Notification.find({ 
      recipient: userId, 
      read: false 
    })
    .populate('sender', 'name photo')
    .sort({ createdAt: -1 });

    const readNotifications = await Notification.find({ 
      recipient: userId, 
      read: true 
    })
    .populate('sender', 'name photo')
    .sort({ createdAt: -1 })
    .limit(20);

    const notifications = [...unreadNotifications, ...readNotifications];
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: unreadNotifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already deleted'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create notification and emit to socket
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();
    
    // Populate sender details for the socket emission
    const populatedNotification = await Notification.findById(savedNotification._id)
      .populate('sender', 'name photo');
    
    // Emit to the specific recipient via Socket.io
    const io = getIO();
    
    if (io) {
      io.to(`user_${notificationData.recipient}`).emit('new_notification', populatedNotification);
    }
    
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
