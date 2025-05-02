// src/services/testService.ts
import { TestStats, TestResult } from '../types';

// API response type with data field
interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  count?: number;
  error?: string;
}

const API_URL = 'http://localhost:5003/api';

// Setup auth token
const getAuthConfig = (): RequestInit => {
  let token: string | null = null;
  
  // Handle browser vs server environment
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// Type for test result creation
export interface CreateTestResultData {
  wpm: number;
  accuracy: number;
  duration: number;
  wordsTyped: number;
  charsTyped: number;
  errors: number;
}

// Generic fetch wrapper
const fetchApi = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...getAuthConfig(),
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'An unknown error occurred');
  }

  return data.data;
};

// Save test result to the backend
export const saveTestResult = async (testData: CreateTestResultData): Promise<TestResult> => {
  try {
    return await fetchApi<TestResult>(`${API_URL}/tests`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

// Get user's test history with pagination
export const getTestHistory = async (
  page = 1, 
  limit = 10
): Promise<{
  results: TestResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const response = await fetch(
      `${API_URL}/tests?page=${page}&limit=${limit}`, 
      getAuthConfig()
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<TestResult[]> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch test history');
    }

    return {
      results: data.data,
      pagination: data.pagination || {
        page,
        limit,
        total: data.count || 0,
        pages: Math.ceil((data.count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
};

// Get a single test result
export const getTestResult = async (id: string): Promise<TestResult> => {
  try {
    return await fetchApi<TestResult>(`${API_URL}/tests/${id}`);
  } catch (error) {
    console.error('Error fetching test result:', error);
    throw error;
  }
};

// Delete a test result
export const deleteTestResult = async (id: string): Promise<void> => {
  try {
    await fetchApi<void>(`${API_URL}/tests/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting test result:', error);
    throw error;
  }
};

// User statistics type
export interface UserStatsData {
  avgWPM: number;
  maxWPM: number;
  avgAccuracy: number;
  totalTests: number;
  progressData: Array<{
    date: string;
    wpm: number;
    accuracy: number;
  }>;
}

// Get user's statistics
export const getTestStats = async (): Promise<UserStatsData> => {
  try {
    return await fetchApi<UserStatsData>(`${API_URL}/tests/stats`);
  } catch (error) {
    console.error('Error fetching test stats:', error);
    throw error;
  }
};
