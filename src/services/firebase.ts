// Import correctly initialized instances from the main config file
import { db, storage, app } from '../firebaseConfig';

// Import utility functions directly from Firebase SDKs
import { doc, setDoc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Enable offline persistence using the correctly initialized db
// This should ideally be done once, where `db` is initialized.
// We're keeping it here assuming this file acts as a configured service layer.
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase (from services/firebase.ts): Persistence failed (multiple tabs).');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase (from services/firebase.ts): Persistence failed (browser unsupported).');
    } else {
      console.error('Firebase (from services/firebase.ts): Persistence failed:', err);
    }
  });

// Export everything that was previously exported, now ensuring db, storage, app are the correct instances
export { db, storage, app, doc, setDoc, getDoc, ref, uploadBytes, getDownloadURL, deleteObject };
