import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                          path.join(__dirname, '../../firebase-service-account.json');

// Only initialize if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    
    // Initialize with minimal configuration if service account isn't available
    // This allows the server to run even if push notifications are not configured
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.warn('Firebase initialized with default credentials. Push notifications may not work.');
    }
  }
}

export default admin;
