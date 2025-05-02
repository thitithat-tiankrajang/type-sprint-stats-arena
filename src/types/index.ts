
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface TestResult {
  id: string;
  userId: string;
  date: number; // timestamp
  wpm: number;
  accuracy: number;
  duration: number; // seconds
  wordsTyped: number;
  charsTyped: number;
  errors: number;
}

export interface TestStats {
  wpm: number;
  accuracy: number;
  progress: number; // 0-100
  errors: number;
  correctChars: number;
  incorrectChars: number;
  currentWordIndex: number;
  totalWords: number;
  elapsedTime: number;
}

export interface ChartData {
  date: string;
  wpm: number;
  accuracy: number;
}
