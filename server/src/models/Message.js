import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.chatType === 'private';
    }
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: function() {
      return this.chatType === 'group';
    }
  },
  chatType: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'emoji', 'photo', 'location'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  photoUrl: {
    type: String
  },
  location: {
    lat: Number,
    lng: Number,
    name: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for fast retrieval of conversations
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Method to generate a conversation ID from two user IDs
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Sort to ensure the same conversation ID regardless of sender/receiver order
  return [userId1, userId2].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
