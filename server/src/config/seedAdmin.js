import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from './database.js';

dotenv.config();

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if admin exists - using username as the email field
    const username = process.env.ADMIN_EMAIL; // Using the ADMIN_EMAIL env var for username
    const adminExists = await User.findOne({ 
      providerId: username,
      role: 'admin'
    });
    
    if (adminExists) {
      console.log('✅ Admin user already exists');
      mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
    
    // Create a valid email format from the username for the email field
    const emailFromUsername = `${username}@dating-app.com`;
    
    const admin = new User({
      displayName: username,
      email: emailFromUsername, // Use the generated email
      username: username, // Store the username separately (we'll add this field)
      password: hashedPassword,
      providerId: username, // Use the username as providerId
      provider: 'admin',
      role: 'admin',
      photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

// If this script is run directly (not imported)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedAdmin();
}

export default seedAdmin;
