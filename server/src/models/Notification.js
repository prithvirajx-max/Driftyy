import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['hangout_request', 'hangout_accepted', 'hangout_rejected', 'message', 'system'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    // Dynamic data for the notification (e.g., message content, request details)
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by recipient and read status
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 }); // Sort by most recent

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
