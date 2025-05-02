// src/services/statsService.ts
import { Stat, StatSummary } from '../types/stats';

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

// Create a new stat
export const createStat = async (statData: Omit<Stat, 'id' | 'userId' | 'createdAt'>): Promise<Stat> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(statData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create stat');
  }

  const data = await response.json();
  return data.data;
};

// Get all stats with pagination and filtering
export const getStats = async (
  page = 1,
  limit = 10,
  category?: string,
  sortBy?: string
): Promise<{
  stats: Stat[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  let url = `${API_URL}/stats?page=${page}&limit=${limit}`;
  
  if (category) {
    url += `&category=${category}`;
  }
  
  if (sortBy) {
    url += `&sortBy=${sortBy}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch stats');
  }

  const data = await response.json();
  
  return {
    stats: data.data,
    pagination: {
      current: page,
      total: Math.ceil((data.count || 0) / limit),
      hasNext: !!data.pagination?.next,
      hasPrev: !!data.pagination?.prev
    }
  };
};

// Get stat by ID
export const getStatById = async (id: string): Promise<Stat> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/stats/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch stat');
  }

  const data = await response.json();
  return data.data;
};

// Update a stat
export const updateStat = async (id: string, statData: Partial<Stat>): Promise<Stat> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/stats/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(statData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update stat');
  }

  const data = await response.json();
  return data.data;
};

// Delete a stat
export const deleteStat = async (id: string): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/stats/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete stat');
  }
};

// Get stats summary
export const getStatsSummary = async (): Promise<StatSummary> => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/stats/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch stats summary');
  }

  const data = await response.json();
  return data.data;
};

export const statsService = {
  createStat,
  getStats,
  getStatById,
  updateStat,
  deleteStat,
  getStatsSummary
};