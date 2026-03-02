import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt5YlJ_ZgO0aswJXTtCqBJelwLDQfbc2A",
  authDomain: "acadia-campus-hub.firebaseapp.com",
  projectId: "acadia-campus-hub",
  storageBucket: "acadia-campus-hub.firebasestorage.app",
  messagingSenderId: "178102066314",
  appId: "1:178102066314:web:bd5fa015f3a0a86ec7a173",
  measurementId: "G-EBRTYXV4N4"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, analytics };
