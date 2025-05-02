// src/services/authService.ts
import { User } from "../types";
import { AuthResult } from "../types/auth";

// Use environment variable or fallback to a default
const API_URL = "http://localhost:5003/api";

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<AuthResult> => {
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || "An error occurred",
    };
  }

  return {
    success: true,
    ...data,
  };
};

// Get token from localStorage with better error handling
const getToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Failed to get token from localStorage:", error);
    return null;
  }
};

// Set token in localStorage with error handling
const setTokens = (
  token: string | undefined,
  refreshToken: string | undefined
): void => {
  try {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  } catch (error) {
    console.error("Failed to set tokens in localStorage:", error);
  }
};

// Remove tokens from localStorage
const removeTokens = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

// Register a new user
export const register = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, displayName }),
    });

    const result = await handleResponse(response);

    if (result.success && result.token && result.refreshToken) {
      setTokens(result.token, result.refreshToken);
    }

    return result;
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Registration failed. Please try again later.",
    };
  }
};

// Login user
export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await handleResponse(response);

    // Check if login was successful and tokens exist before setting them
    if (result.success && result.token) {
      // Handle the case where refreshToken might not be provided
      setTokens(result.token, result.refreshToken || undefined);
    }

    return result;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Login failed. Please try again later.",
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
    const token = getToken();
    
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }
    
    try {
      console.log(`Fetching user from: ${API_URL}/auth/me with token`);
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Response status:", response.status);
      
      const result = await handleResponse(response);
      
      if (result.success && result.data) {
        return {
          uid: result.data._id,
          email: result.data.email,
          displayName: result.data.displayName || null,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      // More descriptive error information
      if (error instanceof TypeError && error.message.includes("NetworkError")) {
        console.error("Network error - Check if server is running and CORS is configured correctly");
      }
      return null;
    }
  };

// Logout user
export const logout = async (): Promise<void> => {
  const token = getToken();

  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Always remove tokens even if API call fails
  removeTokens();
};

// Update user profile
export const updateProfile = async (
  displayName: string
): Promise<AuthResult> => {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ displayName }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again later.",
    };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Failed to send reset password email. Please try again later.",
    };
  }
};

// Refresh token
export const refreshToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await handleResponse(response);

    if (result.success && result.token && result.refreshToken) {
      setTokens(result.token, result.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Refresh token error:", error);
    return false;
  }
};

// Verify 2FA token
export const verify2FA = async (
  userId: string,
  token: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-2fa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, token }),
    });

    const result = await handleResponse(response);

    if (result.success && result.token && result.refreshToken) {
      setTokens(result.token, result.refreshToken);
    }

    return result;
  } catch (error) {
    console.error("2FA verification error:", error);
    return {
      success: false,
      error: "Failed to verify 2FA token. Please try again.",
    };
  }
};

export const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  resetPassword,
  refreshToken,
  verify2FA,
};
