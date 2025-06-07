import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// Construct the path to the service account key JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'firebase-service-account-key.json');

// Your Firebase project's storage bucket name (e.g., 'your-project-id.appspot.com')
// This should match the bucket name found in your Firebase console -> Storage.
const BUCKET_NAME = 'driftyy-c8fe9.appspot.com';

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: BUCKET_NAME
  });
  console.log('✅ Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  if (error.code === 'ENOENT' || error.message.includes('service-account-key.json')) {
    console.error('Ensure firebase-service-account-key.json is in server/src/config/ and the path is correct.');
  }
  if (error.message.includes('storageBucket')) {
    console.error(`Verify the BUCKET_NAME ('${BUCKET_NAME}') is correct for your Firebase project.`);
  }
}

const db = admin.firestore(); // If you plan to use Firestore from backend later
const auth = admin.auth(); // If you plan to use Firebase Auth from backend later
const bucket = admin.storage().bucket();

export { admin, db, auth, bucket };
