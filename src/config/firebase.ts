import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration (from your project settings)
const firebaseConfig = {
  apiKey: "AIzaSyC6JqftUrkqafSpvI4iZ0GDTKrAtjnedws",
  authDomain: "driftyy-c8fe9.firebaseapp.com",
  projectId: "driftyy-c8fe9",
  storageBucket: "driftyy-c8fe9.firebasestorage.app",
  messagingSenderId: "691501262337",
  appId: "1:691501262337:web:a9b50724ef83590b174200",
  measurementId: "G-4K157NSSE5" // Optional for Firebase JS SDK v7.20.0 and later
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth Providers (optional, if you plan to use them)
// Make sure you have enabled these sign-in methods in your Firebase console
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Example: Configure Google provider to always prompt for account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, storage, googleProvider, facebookProvider };
