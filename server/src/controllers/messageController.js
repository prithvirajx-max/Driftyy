import Message from '../models/Message.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { deleteFile, getFilenameFromUrl } from '../utils/fileManager.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Only accept images
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

// Controller functions
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, groupId, messageType, content, location, replyToId } = req.body;
    const senderId = req.user.id;
    let chatType = 'private';
    let targetId;
    let conversationId;

    // Validate messageType is one of the allowed types
    const validMessageTypes = ['text', 'emoji', 'photo', 'location'];
    if (!validMessageTypes.includes(messageType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid message type. Must be one of: ${validMessageTypes.join(', ')}`
      });
    }

    // Type-specific validation
    if (messageType === 'text' || messageType === 'emoji') {
      if (!content || content.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'Text and emoji messages must have content'
        });
      }
    } else if (messageType === 'photo') {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Photo message must include an image file'
        });
      }
    } else if (messageType === 'location') {
      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({
          status: 'error',
          message: 'Location message must include valid lat and lng coordinates'
        });
      }
      
      // Validate location coordinates are valid numbers
      if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return res.status(400).json({
          status: 'error',
          message: 'Location coordinates must be valid numbers'
        });
      }
      
      // Validate location has a name
      if (!location.name || typeof location.name !== 'string') {
        location.name = 'Shared Location'; // Default if missing
      }
    }

    // Determine if this is a private or group message
    if (groupId) {
      // Group message
      chatType = 'group';
      targetId = groupId;
      
      // Check if group exists and user is a member
      const Group = (await import('../models/Group.js')).default;
      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({
          status: 'error',
          message: 'Group not found'
        });
      }
      
      if (!group.isMember(senderId)) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a member of this group'
        });
      }
      
      // Use the group's conversationId
      conversationId = group.conversationId;
    } else if (receiverId) {
      // Private message
      chatType = 'private';
      targetId = receiverId;
      
      // Generate conversation ID for private chat
      conversationId = Message.generateConversationId(senderId, receiverId);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Either receiverId or groupId is required'
      });
    }

    // Create message object with basic fields
    const messageData = {
      sender: senderId,
      chatType,
      conversationId,
      messageType,
      content: content || '', // Default to empty string if no content
      
      // Add reply information if replying to a message
      replyTo: replyToId || null
    };

    // Add recipient information based on chat type
    if (chatType === 'private') {
      messageData.receiver = targetId;
    } else {
      messageData.group = targetId;
    }

    // Add location data if present and validated
    if (messageType === 'location' && location) {
      messageData.location = {
        lat: location.lat,
        lng: location.lng,
        name: location.name
      };
    }

    // Add photo URL if it's a photo message
    if (messageType === 'photo' && req.file) {
      const photoUrl = `/uploads/${req.file.filename}`;
      messageData.photoUrl = photoUrl;
    }

    // Create and save the message
    const message = new Message(messageData);
    await message.save();

    // Populate sender info before sending response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'displayName photoURL')
      .populate('replyTo');
      
    // Further populate the replyTo message with sender info if it exists
    if (populatedMessage.replyTo) {
      await populatedMessage.populate('replyTo.sender', 'displayName photoURL');
    }
      
    // Populate receiver or group info depending on chat type
    if (chatType === 'private') {
      await populatedMessage.populate('receiver', 'displayName photoURL');
    } else {
      await populatedMessage.populate('group', 'name photoURL');
    }

    // Send push notification to recipient (for private messages) or group members (for group messages)
    try {
      if (chatType === 'private') {
        // Import notification utilities
        const { sendNewMessageNotification } = await import('../utils/notifications.js');
        const senderUser = await User.findById(senderId, 'displayName photoURL');
        
        // Send notification to recipient
        sendNewMessageNotification(targetId, populatedMessage, senderUser);
      } else if (chatType === 'group') {
        // For group messages, we'll handle notifications via socket.io to avoid spamming
        // This is handled in the socket.io implementation
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the API call if notifications fail
    }

    res.status(201).json({
      status: 'success',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to send message'
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Find messages for this conversation, ordered by most recent first
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sender', 'displayName photoURL')
      .populate('receiver', 'displayName photoURL');

    // Get total count for pagination
    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      status: 'success',
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get conversation'
    });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate to get the latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === userId
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

        // Lookup other user in conversation
        const userLookup = await Message.populate(conv, {
          path: 'lastMessage.sender lastMessage.receiver',
          select: 'displayName photoURL'
        });

        return {
          conversationId: conv._id,
          otherUser: conv.lastMessage.sender.toString() === userId
            ? userLookup.lastMessage.receiver
            : userLookup.lastMessage.sender,
          lastMessage: userLookup.lastMessage
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: conversationsWithUsers
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get user conversations'
    });
  }
};

// Delete a message and clean up any associated media files
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message first to check ownership and get photoUrl if exists
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Security: Only allow deletion of messages the user sent
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete messages you sent'
      });
    }

    // If it's a photo message, delete the associated media file
    if (message.messageType === 'photo' && message.photoUrl) {
      const filename = getFilenameFromUrl(message.photoUrl);
      if (filename) {
        const deleteResult = await deleteFile(filename);
        if (deleteResult) {
          console.log(`Deleted file: ${filename}`);
        } else {
          console.warn(`Failed to delete file: ${filename}`);
        }
      }
    }

    // Delete the message from the database
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete message'
    });
  }
};

// Mark messages as delivered when user receives them
export const markMessagesAsDelivered = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Only mark messages as delivered if user is the recipient
    const updatedMessages = await Message.updateMany(
      { 
        conversationId, 
        receiver: userId,
        isDelivered: false
      },
      { 
        $set: { 
          isDelivered: true,
          deliveredAt: new Date() 
        } 
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        marked: updatedMessages.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as delivered:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark messages as delivered'
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Update all unread messages in this conversation where user is the receiver
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        updated: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark messages as read'
    });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Return the file path to be used in a subsequent sendMessage call
    const photoUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        photoUrl
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload photo'
    });
  }
};
