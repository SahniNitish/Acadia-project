import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDt5YlJ_ZgO0aswJXTtCqBJelwLDQfbc2A",
  authDomain: "acadia-campus-hub.firebaseapp.com",
  projectId: "acadia-campus-hub",
  storageBucket: "acadia-campus-hub.firebasestorage.app",
  messagingSenderId: "178102066314",
  appId: "1:178102066314:web:bd5fa015f3a0a86ec7a173",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export const storage = getStorage(app, 'gs://acadia-campus-hub.firebasestorage.app');
export { auth, app };
