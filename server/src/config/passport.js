import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Local Strategy for admin login
passport.use('admin-login', new LocalStrategy({
  usernameField: 'email', // This can be either email or username
  passwordField: 'password'
}, async (emailOrUsername, password, done) => {
  try {
    console.log(`Admin login attempt with: ${emailOrUsername}`);
    
    // Check if this is a username or email login
    let admin;
    
    // First try to find by email
    admin = await User.findOne({ 
      email: emailOrUsername, 
      role: 'admin' 
    }).select('+password');
    
    // If not found by email, try with username or providerId (for users created through seedAdmin)
    if (!admin) {
      admin = await User.findOne({
        $or: [
          { username: emailOrUsername },
          { providerId: emailOrUsername }
        ],
        role: 'admin'
      }).select('+password');
    }
    
    if (!admin) {
      console.log('No admin found with provided credentials');
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    // Verify password
    console.log('Admin found, checking password');
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password does not match');
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    console.log('Admin authentication successful');
    return done(null, admin);
  } catch (error) {
    console.error('Admin login error:', error);
    return done(error);
  }
}));

// Google Strategy
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5001/api/auth/google/callback',
  scope: ['profile', 'email', 'openid']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Log OAuth data for debugging
    console.log('Google profile data:', JSON.stringify(profile, null, 2));
    
    // Check if user already exists
    let user = await User.findOne({ 
      providerId: profile.id,
      provider: 'google'
    });

    if (user) {
      // Update last login time and other profile info if needed
      user.lastLogin = Date.now();
      // Update photo URL in case it changed
      if (profile.photos && profile.photos[0] && profile.photos[0].value) {
        user.photoURL = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      displayName: profile.displayName,
      email: profile.emails[0].value,
      providerId: profile.id,
      provider: 'google',
      photoURL: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      oauthData: {
        profile: profile._json
      }
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    console.error('Error in Google strategy:', error);
    return done(error, null);
  }
}));

// Facebook Strategy
passport.use('facebook', new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `http://localhost:${process.env.PORT || 5000}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'photos', 'email', 'gender', 'birthday', 'location']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Log OAuth data for debugging
    console.log('Facebook profile data:', JSON.stringify(profile, null, 2));
    
    // Check if user already exists
    let user = await User.findOne({ 
      providerId: profile.id,
      provider: 'facebook'
    });

    if (user) {
      // Update last login time and other profile info if needed
      user.lastLogin = Date.now();
      // Update photo URL in case it changed
      if (profile.photos && profile.photos[0] && profile.photos[0].value) {
        user.photoURL = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Handle case where Facebook doesn't return email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
    
    // Create new user
    const newUser = new User({
      displayName: profile.displayName,
      email: email,
      providerId: profile.id,
      provider: 'facebook',
      photoURL: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      oauthData: {
        profile: profile._json
      }
    });
    
    // Add additional profile information if available
    if (profile._json) {
      if (profile._json.gender) {
        newUser.profile.gender = profile._json.gender;
      }
      if (profile._json.birthday) {
        // Calculate age from birthday if available
        const birthday = new Date(profile._json.birthday);
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        newUser.profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
      if (profile._json.location && profile._json.location.name) {
        newUser.profile.location = profile._json.location.name;
      }
    }

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    console.error('Error in Facebook strategy:', error);
    return done(error, null);
  }
}));

export default passport;
