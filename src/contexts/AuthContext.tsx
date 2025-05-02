// src/contexts/AuthContext.tsx (updated)
import React, { createContext, useContext, useEffect, useState } from 'react';
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

const API_URL = 'http://localhost:5000/api';

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          uid: data.data._id,
          email: data.data.email,
          displayName: data.data.displayName
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      await fetchCurrentUser(data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, displayName })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      await fetchCurrentUser(data.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string): Promise<void> => {
    // This would need to be implemented on the backend
    console.warn('Password reset not yet implemented in the backend');
  };

  const updateUserProfile = async (displayName: string): Promise<void> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Update local user state
      setCurrentUser(prev => prev ? { 
        ...prev, 
        displayName: data.data.displayName 
      } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    // This would need to be implemented on the backend
    console.warn('Email verification not yet implemented in the backend');
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