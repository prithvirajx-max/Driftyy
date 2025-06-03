import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.user': 1 });

// Method to check if a user is a member of the group
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if a user is an admin of the group
groupSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.role === 'admin'
  ) || this.creator.toString() === userId.toString();
};

// Method to add a user to the group
groupSchema.methods.addMember = async function(userId, role = 'member') {
  // Check if user is already a member
  if (this.isMember(userId)) {
    return false;
  }
  
  // Add the user to members
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  await this.save();
  return true;
};

// Method to remove a user from the group
groupSchema.methods.removeMember = async function(userId) {
  // Check if user is a member
  if (!this.isMember(userId)) {
    return false;
  }
  
  // Remove the user from members
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  await this.save();
  return true;
};

const Group = mongoose.model('Group', groupSchema);

export default Group;
