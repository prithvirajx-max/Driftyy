// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC6JqftUrkqafSpvI4iZ0GDTKrAtjnedws",
  authDomain: "driftyy-c8fe9.firebaseapp.com",
  projectId: "driftyy-c8fe9",
  storageBucket: "driftyy-c8fe9.firebasestorage.app",
  messagingSenderId: "691501262337",
  appId: "1:691501262337:web:a9b50724ef83590b174200",
  measurementId: "G-4K157NSSE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, app };
