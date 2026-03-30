import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/firestore';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAcadiaEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@acadiau.ca');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            profile = {
              fullName: fbUser.displayName || '',
              email: fbUser.email || '',
              phone: '',
              createdAt: new Date().toISOString(),
            };
            await createUserProfile(fbUser.uid, profile);
          }
          setUser({ id: fbUser.uid, ...profile });
        } catch (err) {
          console.log('Error loading user profile:', err);
          setUser({
            id: fbUser.uid,
            fullName: fbUser.displayName || '',
            email: fbUser.email || '',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isAcadiaEmail(email)) {
      throw new Error('Only @acadiau.ca emails are allowed');
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    setFirebaseUser(result.user);
    let profile = await getUserProfile(result.user.uid);
    if (!profile) {
      profile = {
        fullName: result.user.displayName || '',
        email: result.user.email || '',
        phone: '',
        createdAt: new Date().toISOString(),
      };
      await createUserProfile(result.user.uid, profile);
    }
    setUser({ id: result.user.uid, ...profile });
  };

  const signup = async (data: { full_name: string; email: string; phone: string; password: string }) => {
    if (!isAcadiaEmail(data.email)) {
      throw new Error('Only @acadiau.ca emails are allowed');
    }
    const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(result.user, { displayName: data.full_name });
    // Save profile to Firestore (unverified; will be accessible once verified)
    const profile = {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    await createUserProfile(result.user.uid, profile);
    setFirebaseUser(result.user);
    setUser({ id: result.user.uid, ...profile });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Firebase signOut error:', error);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (firebaseUser) {
      const firebaseUpdate: { displayName?: string; photoURL?: string } = {};
      if (data.fullName) firebaseUpdate.displayName = data.fullName;
      if (data.profilePhoto) firebaseUpdate.photoURL = data.profilePhoto;
      if (Object.keys(firebaseUpdate).length > 0) {
        await updateProfile(firebaseUser, firebaseUpdate);
      }
      const { id, email, ...profileData } = data as any;
      if (Object.keys(profileData).length > 0) {
        await updateUserProfile(firebaseUser.uid, profileData);
      }
    }
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({ id: firebaseUser.uid, ...profile });
        }
      } catch (err) {
        console.log('refreshUser error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
