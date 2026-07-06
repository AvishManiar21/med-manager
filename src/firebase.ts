import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use environment variables in production, fallback to hardcoded values in development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbEFZD3kjDWzTBuJUzzLrGcY8XBmyZ9vs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "med-manager-3ddd6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "med-manager-3ddd6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "med-manager-3ddd6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "75662515852",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:75662515852:web:3617933cb4b2e12cbca5a9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3KJS1N62E3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
