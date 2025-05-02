// src/contexts/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { User } from '../types/index';
import { AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { toast } from '@/components/ui/use-toast';
import { AuthContext } from './authContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
    
    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      if (isAuthenticated) {
        const success = await authService.refreshToken();
        if (!success) {
          // Token refresh failed, log out the user
          signOut();
        }
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);
  
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login(email, password);
      
      // Handle 2FA if required
      if (result.data?.twoFactorRequired) {
        // In a real app, you would redirect to a 2FA verification page
        toast({
          title: "2FA Required",
          description: "Two-factor authentication is required",
        });
        return false;
      }
      
      if (result.success) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          return true;
        }
      } else if (result.error) {
        toast({
          title: "Sign-in Failed",
          description: result.error,
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Sign-in error:', error);
      return false;
    }
  };
  
  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      const result = await authService.register(email, password, displayName);
      if (result.success) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          toast({
            title: "Registration Successful",
            description: "Please verify your email address",
          });
          
          return true;
        }
      } else if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Sign-up error:', error);
      return false;
    }
  };
  
  const signOut = (): void => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email to reset your password",
        });
        return true;
      } else if (result.error) {
        toast({
          title: "Reset Failed",
          description: result.error,
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };
  
  const updateUserProfile = async (displayName: string): Promise<boolean> => {
    try {
      const result = await authService.updateProfile(displayName);
      if (result.success && result.data) {
        setCurrentUser(prev => prev ? {
          ...prev,
          displayName: result.data.displayName
        } : null);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });
        return true;
      } else if (result.error) {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
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
    isAuthenticated
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;