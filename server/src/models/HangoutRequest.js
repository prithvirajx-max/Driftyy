import mongoose from 'mongoose';

const hangoutRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  location: {
    type: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  plannedTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for efficient querying
hangoutRequestSchema.index({ sender: 1, recipient: 1 });
hangoutRequestSchema.index({ recipient: 1, status: 1 });
hangoutRequestSchema.index({ createdAt: -1 });

// Update the updatedAt field on save
hangoutRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const HangoutRequest = mongoose.model('HangoutRequest', hangoutRequestSchema);

export default HangoutRequest;
