import HangoutRequest from '../models/HangoutRequest.js';
import { createNotification } from './notificationController.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';
import { startOfDay, endOfDay } from 'date-fns';

// Create a new hangout request
export const createHangoutRequest = async (req, res) => {
  try {
    const { recipientId, message, location, plannedTime } = req.body;
    const senderId = req.user._id;

    // Validate required fields
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    if (plannedTime && new Date(plannedTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Planned time must be in the future'
      });
    }

    // Check if we're not trying to send a request to ourself
    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send a hangout request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if a pending request already exists
    const existingRequest = await HangoutRequest.findOne({
      sender: senderId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A pending request already exists for this recipient'
      });
    }

    // Check number of requests sent today to this recipient (limit: 2 per day)
    const today = new Date();
    const requestsToday = await HangoutRequest.countDocuments({
      sender: senderId,
      recipient: recipientId,
      createdAt: {
        $gte: startOfDay(today),
        $lte: endOfDay(today)
      }
    });

    if (requestsToday >= 2) {
      return res.status(429).json({
        success: false,
        message: 'You can only send 2 hangout requests to the same person per day',
        requestsRemaining: 0,
        nextRequestTime: new Date(today.setDate(today.getDate() + 1)).toISOString()
      });
    }

    // Create new hangout request
    const hangoutRequest = new HangoutRequest({
      sender: senderId,
      recipient: recipientId,
      message,
      location,
      plannedTime
    });

    const savedRequest = await hangoutRequest.save();

    // Create a notification for the recipient
    await createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'hangout_request',
      data: {
        requestId: savedRequest._id,
        message: message || 'Would like to hang out with you!'
      }
    });

    // Populate sender details for the response
    const populatedRequest = await HangoutRequest.findById(savedRequest._id)
      .populate('sender', 'name photo')
      .populate('recipient', 'name photo');
      
    // Emit socket event for real-time notification
    const io = getIO();
    io.to(`user_${recipientId}`).emit('new_hangout_request', {
      requestId: savedRequest._id,
      sender: {
        _id: req.user._id,
        name: req.user.name,
        photo: req.user.photo
      },
      message: message || 'Would like to hang out with you!',
      createdAt: savedRequest.createdAt
    });

    res.status(201).json({
      success: true,
      message: 'Hangout request sent successfully',
      data: populatedRequest,
      requestsRemaining: 2 - (requestsToday + 1)
    });

  } catch (error) {
    console.error('Error creating hangout request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hangout request',
      error: error.message
    });
  }
};

// Get all hangout requests for the current user
export const getUserHangoutRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'all', type = 'all' } = req.query;

    let query = {};

    // Filter based on whether the user is the sender or recipient
    if (type === 'sent') {
      query.sender = userId;
    } else if (type === 'received') {
      query.recipient = userId;
    } else {
      // 'all' - both sent and received
      query.$or = [{ sender: userId }, { recipient: userId }];
    }

    // Filter by status if provided
    if (status !== 'all') {
      query.status = status;
    }

    const requests = await HangoutRequest.find(query)
      .populate('sender', 'name photo')
      .populate('recipient', 'name photo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching hangout requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hangout requests',
      error: error.message
    });
  }
};

// Update hangout request status (accept or reject)
export const updateHangoutRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    // Find the request and verify the user is the recipient
    const request = await HangoutRequest.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending' // Only pending requests can be updated
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Hangout request not found or already processed'
      });
    }

    // Update request status
    request.status = status;
    const updatedRequest = await request.save();

    // Notify the sender about the status update
    await createNotification({
      recipient: request.sender,
      sender: userId,
      type: `hangout_${status}`,
      data: {
        requestId: request._id,
        message: status === 'accepted' 
          ? 'Your hangout request has been accepted!' 
          : 'Your hangout request has been declined.'
      }
    });

    // Emit real-time update via Socket.io
    const io = getIO();
    if (io) {
      io.to(`user_${request.sender}`).emit('hangout_request_update', {
        requestId: request._id,
        status
      });
    }

    // If accepted, create a chat/conversation and send 'HI' message
    if (status === 'accepted') {
      // Dynamically import Message model to avoid circular deps
      const Message = (await import('../models/Message.js')).default;
      // Generate conversation ID (sorted order)
      const senderId = request.sender.toString();
      const recipientId = request.recipient.toString();
      const conversationId = Message.generateConversationId(senderId, recipientId);
      // Check if any message exists in this conversation
      const existing = await Message.findOne({ conversationId });
      if (!existing) {
        // Create the first "HI" message (from recipient to sender)
        const hiMessage = new Message({
          sender: recipientId,
          receiver: senderId,
          chatType: 'private',
          conversationId,
          messageType: 'text',
          content: 'HI',
          isRead: false,
          isDelivered: false
        });
        await hiMessage.save();
        // Optionally, emit real-time message to both users
        if (io) {
          io.to(`user_${senderId}`).emit('new_message', {
            ...hiMessage.toObject(),
            senderId: recipientId
          });
          io.to(`user_${recipientId}`).emit('new_message', {
            ...hiMessage.toObject(),
            senderId: recipientId
          });
        }
      }
    }

    // Return the updated request with populated fields
    const populatedRequest = await HangoutRequest.findById(updatedRequest._id)
      .populate('sender', 'name photo')
      .populate('recipient', 'name photo');

    res.json({
      success: true,
      message: `Hangout request ${status} successfully`,
      data: populatedRequest
    });

  } catch (error) {
    console.error('Error updating hangout request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hangout request',
      error: error.message
    });
  }
};

// Get all users available for hangouts
export const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { distance, gender } = req.query;
    
    // Base query to exclude the current user
    let query = {
      _id: { $ne: userId },
      'hangout.isAvailable': true
    };
    
    // Apply filters if provided
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // For distance filtering, we would ideally use geospatial queries
    // This is a simplified implementation - in a real app, you would use $near with user's location
    
    const availableUsers = await User.find(query)
      .select('name age gender photo location bio hangout')
      .sort({ 'hangout.lastActiveAt': -1 });
      
    res.json({
      success: true,
      count: availableUsers.length,
      data: availableUsers
    });
    
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available users',
      error: error.message
    });
  }
};

// Update user's hangout availability status
export const updateAvailabilityStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isAvailable, reason, duration } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'hangout.isAvailable': isAvailable,
          'hangout.reason': reason || '',
          'hangout.duration': duration || '',
          'hangout.lastActiveAt': new Date()
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Emit availability update to connected users
    const io = getIO();
    if (io) {
      io.emit('user_availability_update', {
        userId: userId,
        isAvailable,
        reason,
        duration
      });
    }
    
    res.json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        isAvailable: updatedUser.hangout.isAvailable,
        reason: updatedUser.hangout.reason,
        duration: updatedUser.hangout.duration
      }
    });
    
  } catch (error) {
    console.error('Error updating availability status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability status',
      error: error.message
    });
  }
};
