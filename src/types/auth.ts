// src/types/auth.ts
import { User } from './index';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (displayName: string) => Promise<boolean>;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: string;
  error?: string;
  data?: AuthResultData;
  twoFactorRequired?: boolean;
  userId?: string;
}

export interface AuthResultData {
  displayName?: string;
  email?: string;
  _id?: string;
  twoFactorRequired?: boolean;
  userId?: string;
  [key: string]: unknown;
}