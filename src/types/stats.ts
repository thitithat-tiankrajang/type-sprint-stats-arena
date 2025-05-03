// src/types/stats.ts
export interface TestResult {
    _id: string;
    date: string;
    wpm: number;
    accuracy: number;
    duration: number;
    characterCount: number;
    correctChars: number;
    errorCount: number;
    isPersonalBest?: {
      wpm: boolean;
      accuracy: boolean;
    };
  }
  
  export interface DashboardData {
    recentTests: TestResult[];
    personalBests: {
      wpm: TestResult | null;
      accuracy: TestResult | null;
      totalChars: TestResult | null;
    };
    averages: {
      avgWPM: number;
      avgAccuracy: number;
      totalTests: number;
      totalChars: number;
    };
    trends: {
      wpmChange: number;
      accuracyChange: number;
    } | null;
    skillLevel: string;
  }