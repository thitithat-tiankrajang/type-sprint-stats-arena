// src/contexts/authContext.ts
import { createContext, useContext } from 'react';
import { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

// Helper hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};