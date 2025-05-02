
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  sendVerificationEmail: async () => {},
  isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Convert FirebaseUser to our User type
  const formatUser = (user: FirebaseUser | null): User | null => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const formattedUser = formatUser(user);
      setCurrentUser(formattedUser);
      setIsAuthenticated(!!formattedUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile if display name is provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      // Send verification email
      await sendEmailVerification(userCredential.user);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateUserProfile = async (displayName: string): Promise<void> => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      // Update local user state
      setCurrentUser(prev => prev ? { ...prev, displayName } : null);
    }
  };

  // Send verification email
  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
