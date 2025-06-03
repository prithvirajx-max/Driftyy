import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Get all notifications for the current user
router.get('/', getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router;
