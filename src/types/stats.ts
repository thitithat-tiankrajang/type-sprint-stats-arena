// src/types/stats.ts
export interface Stat {
    _id: string;
    userId: string;
    title: string;
    value: number;
    unit: 'wpm' | 'accuracy' | 'time' | 'count' | 'custom';
    category: 'speed' | 'accuracy' | 'progress' | 'achievement' | 'custom';
    icon?: string;
    color?: string;
    isPublic: boolean;
    createdAt: string;
  }
  
  export interface StatSummary {
    topSpeed: Stat | null;
    topAccuracy: Stat | null;
    totalStats: number;
    recentStats: Stat[];
  }