import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Check if we have a MongoDB URI in environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dating-app-dev';
    
    // For development/preview purposes - continue even if DB connection fails
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (dbError) {
      console.warn(`Warning: MongoDB connection failed: ${dbError.message}`);
      console.warn('Running in limited functionality mode - authentication features may not work properly');
      // Don't exit process on DB connection failure in development
      return false;
    }
  } catch (error) {
    console.error(`Error in database setup: ${error.message}`);
    return false;
  }
};

export default connectDB;
