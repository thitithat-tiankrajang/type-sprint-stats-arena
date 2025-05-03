// src/services/statsService.ts (fixed)
import { TestResult, DashboardData } from '../types/stats';

// Use environment variable or a safe default
const API_URL = 'http://localhost:5003/api';

// Get auth token
const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

// Save test result in a single API call
export const saveTestResult = async (testData: {
  wpm: number;
  accuracy: number;
  duration: number;
  characterCount: number;
  correctChars: number;
  errorCount: number;
}): Promise<TestResult> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save test result');
  }

  const data = await response.json();
  return data.data;
};

// Get user's test history
export const getTestHistory = async (
  page = 1,
  limit = 10
): Promise<{
  tests: TestResult[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/tests?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch test history');
  }

  const data = await response.json();
  
  return {
    tests: data.data,
    pagination: {
      current: page,
      total: Math.ceil((data.count || 0) / limit),
      hasNext: !!data.pagination?.next,
      hasPrev: !!data.pagination?.prev
    }
  };
};

// Get dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/tests/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch dashboard data');
  }

  const data = await response.json();
  return data.data;
};

export const statsService = {
  saveTestResult,
  getTestHistory,
  getDashboardData
};