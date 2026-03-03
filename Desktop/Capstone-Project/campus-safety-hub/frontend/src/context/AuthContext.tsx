import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { authAPI } from '../services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_photo?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
        await AsyncStorage.setItem('firebaseToken', idToken);
        setUser({
          id: fbUser.uid,
          full_name: fbUser.displayName || '',
          email: fbUser.email || '',
          profile_photo: fbUser.photoURL || undefined,
        });
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('firebaseToken');
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.log('Error loading auth:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isAcadiaEmail(email)) {
      throw new Error('Only @acadiau.ca emails are allowed');
    }

    // Firebase login
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    await AsyncStorage.setItem('firebaseToken', idToken);
    setToken(idToken);
    setFirebaseUser(result.user);

    // Campus backend login — get backend JWT for API calls
    try {
      const backendResult = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', backendResult.data.token);
      setUser({
        id: backendResult.data.user.id,
        full_name: backendResult.data.user.full_name,
        email: backendResult.data.user.email,
        phone: backendResult.data.user.phone,
        profile_photo: backendResult.data.user.profile_photo,
      });
    } catch {
      setUser({
        id: result.user.uid,
        full_name: result.user.displayName || '',
        email: result.user.email || '',
        profile_photo: result.user.photoURL || undefined,
      });
    }
  };

  const signup = async (data: { full_name: string; email: string; phone: string; password: string }) => {
    if (!isAcadiaEmail(data.email)) {
      throw new Error('Only @acadiau.ca emails are allowed');
    }

    // Firebase signup
    const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(result.user, { displayName: data.full_name });
    const idToken = await result.user.getIdToken();
    await AsyncStorage.setItem('firebaseToken', idToken);
    setToken(idToken);
    setFirebaseUser(result.user);

    // Campus backend signup — get backend JWT for API calls
    try {
      const backendResult = await authAPI.signup(data);
      await AsyncStorage.setItem('token', backendResult.data.token);
      setUser({
        id: backendResult.data.user.id,
        full_name: backendResult.data.user.full_name,
        email: backendResult.data.user.email,
        phone: backendResult.data.user.phone,
      });
    } catch {
      setUser({
        id: result.user.uid,
        full_name: data.full_name,
        email: result.user.email || '',
        phone: data.phone,
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Firebase signOut error:', error);
    }
    await AsyncStorage.removeItem('firebaseToken');
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (firebaseUser) {
      const updateData: { displayName?: string; photoURL?: string } = {};
      if (data.full_name) updateData.displayName = data.full_name;
      if (data.profile_photo) updateData.photoURL = data.profile_photo;
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(firebaseUser, updateData);
      }
      
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await firebaseUser.reload();
      setUser({
        id: firebaseUser.uid,
        full_name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        profile_photo: firebaseUser.photoURL || undefined,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, token, isLoading, login, signup, logout, updateUser, refreshUser }}>
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
