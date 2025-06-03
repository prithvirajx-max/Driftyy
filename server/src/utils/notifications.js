import admin from '../config/firebase.js';
import User from '../models/User.js';

/**
 * Send a push notification to a specific user
 * @param {string} userId - The ID of the user to notify
 * @param {object} notification - The notification payload
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {object} data - Additional data to send with the notification
 * @returns {Promise<object>} - The notification result
 */
export const sendPushNotification = async (userId, notification, data = {}) => {
  try {
    // Find the user to get their FCM tokens
    const user = await User.findById(userId);
    
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return { success: false, error: 'No FCM tokens found' };
    }
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        ...data,
        // Convert any non-string values to strings
        // FCM requires all data values to be strings
        ...Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
      },
      tokens: user.fcmTokens,
      // Configure Android notification channel for proper delivery
      android: {
        priority: 'high',
        notification: {
          channelId: 'messages',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      // Configure Apple specific options
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      }
    };
    
    // Send the notification
    const response = await admin.messaging().sendMulticast(message);
    
    // Handle token cleanup if any tokens are invalid
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(user.fcmTokens[idx]);
        }
      });
      
      // Remove invalid tokens from user's FCM tokens
      if (invalidTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { fcmTokens: { $in: invalidTokens } }
        });
      }
    }
    
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a new message notification
 * @param {string} userId - The ID of the user to notify
 * @param {object} message - The message data
 * @param {object} sender - The sender data
 * @returns {Promise<object>} - The notification result
 */
export const sendNewMessageNotification = async (userId, message, sender) => {
  // Don't send notifications for media messages that might be large
  const notificationBody = message.messageType === 'text' || message.messageType === 'emoji'
    ? message.content.substring(0, 100) // Truncate long messages
    : message.messageType === 'photo'
      ? '📷 Photo'
      : message.messageType === 'location'
        ? '📍 Location'
        : 'New message';
  
  return sendPushNotification(
    userId,
    {
      title: `New message from ${sender.displayName || 'Someone'}`,
      body: notificationBody
    },
    {
      type: 'new_message',
      messageId: message._id.toString(),
      senderId: sender._id.toString(),
      conversationId: message.conversationId,
      messageType: message.messageType
    }
  );
};

/**
 * Register a FCM token for a user
 * @param {string} userId - The user ID
 * @param {string} token - The FCM token to register
 * @returns {Promise<boolean>} - Success status
 */
export const registerFcmToken = async (userId, token) => {
  try {
    // Add token if not already registered
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: token } },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};
