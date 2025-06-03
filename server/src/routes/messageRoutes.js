import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  sendMessage, 
  getConversation, 
  getUserConversations, 
  markMessagesAsRead,
  markMessagesAsDelivered,
  deleteMessage,
  uploadPhoto,
  upload
} from '../controllers/messageController.js';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Get all conversations for the logged-in user
router.get('/conversations', getUserConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId', getConversation);

// Mark messages as delivered in a conversation
router.put('/conversations/:conversationId/delivered', markMessagesAsDelivered);

// Mark messages as read in a conversation
router.put('/conversations/:conversationId/read', markMessagesAsRead);

// Delete a specific message
router.delete('/messages/:messageId', deleteMessage);

// Upload a photo (separate endpoint for file upload)
router.post('/upload', upload.single('photo'), uploadPhoto);

// Send a message (text, emoji, location)
router.post('/send', sendMessage);

// Send a photo message (combined endpoint with file upload)
router.post('/send-photo', upload.single('photo'), sendMessage);

export default router;
