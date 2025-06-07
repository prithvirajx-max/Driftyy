import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, Storage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const storage: Storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence failed: The current browser does not support all of the features required to enable persistence.');
    } else {
      console.error('Firebase persistence failed:', err);
    }
  });

export { db, storage, app, doc, setDoc, getDoc, ref, uploadBytes, getDownloadURL, deleteObject };
