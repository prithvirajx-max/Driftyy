import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    sparse: true // Allow null values but enforce uniqueness for non-null
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  providerId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'facebook', 'admin']
  },
  photoURL: {
    type: String
  },
  phoneNumber: {
    type: String,
    sparse: true // Allow null values but enforce uniqueness for non-null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    select: false // Don't include password in queries by default
  },
  fcmTokens: {
    type: [String],
    default: []
  },
  profile: {
    bio: { type: String, default: '' },
    age: { type: Number },
    gender: { type: String },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' }
    },
    interests: [{ type: String }],
    photos: [{ type: String }], // Array of photo URLs
    preferences: {
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 45 },
      gender: [{ type: String }]
    },
    // Additional profile fields
    height: { type: String },
    weight: { type: String },
    sexuality: { type: String },
    maritalStatus: { type: String },
    bodyType: { type: String },
    skinColor: { type: String },
    ethnicity: { type: String },
    education: { type: String },
    job: { type: String },
    jobTitle: { type: String },
    religion: { type: String },
    interestsDescription: { type: String },
    languagesLearning: { type: String },
    dreams: { type: String },
    degree: { type: String },
    diet: { type: String },
    sleepSchedule: { type: String },
    fitnessLevel: { type: String },
    workLifeBalance: { type: String },
    livingSituation: { type: String },
    travelPreference: { type: String },
    familyRelationship: { type: String },
    financialSituation: { type: String },
    socialLife: { type: String },
    drinking: { type: String, default: 'sometimes' },
    smoking: { type: String, default: 'no' },
    languages: [{ type: String }],
    lookingFor: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Additional OAuth user data we might receive
  oauthData: {
    type: mongoose.Schema.Types.Mixed,
    select: false // Don't include OAuth data by default
  },
  hangout: {
    isAvailable: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    duration: { type: String, default: '' },
    lastActiveAt: { type: Date, default: Date.now },
    location: {
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      address: { type: String }
    }
  }
}, { timestamps: true });

// Create a compound index for providerId and provider to ensure uniqueness
userSchema.index({ providerId: 1, provider: 1 }, { unique: true });

// Add index for hangout availability search
userSchema.index({ 'hangout.isAvailable': 1, 'hangout.lastActiveAt': -1 });

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Update lastLogin timestamp method
userSchema.methods.updateLoginTimestamp = async function() {
  this.lastLogin = Date.now();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
