
import { TestResult, TestStats } from "../types";
import { auth } from "../firebase/config";

// Function to calculate words per minute
export const calculateWPM = (
  correctChars: number,
  elapsedTimeInSeconds: number
): number => {
  // Standard: 5 characters = 1 word
  const words = correctChars / 5;
  // Convert seconds to minutes
  const minutes = elapsedTimeInSeconds / 60;
  
  return minutes > 0 ? Math.round(words / minutes) : 0;
};

// Function to save test result to localStorage and return the result object
export const saveTestResult = (stats: TestStats): TestResult => {
  const user = auth.currentUser;
  const userId = user ? user.uid : 'anonymous';
  
  const result: TestResult = {
    id: Date.now().toString(),
    userId,
    date: Date.now(),
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    duration: stats.elapsedTime,
    wordsTyped: stats.currentWordIndex,
    charsTyped: stats.correctChars + stats.incorrectChars,
    errors: stats.errors
  };
  
  // Get existing results
  const existingResultsJSON = localStorage.getItem('typingResults');
  const existingResults: TestResult[] = existingResultsJSON 
    ? JSON.parse(existingResultsJSON) 
    : [];
  
  // Add new result and save
  existingResults.push(result);
  localStorage.setItem('typingResults', JSON.stringify(existingResults));
  
  return result;
};

// Function to get test results from localStorage
export const getTestResults = (userId?: string): TestResult[] => {
  const resultsJSON = localStorage.getItem('typingResults');
  if (!resultsJSON) return [];
  
  const results: TestResult[] = JSON.parse(resultsJSON);
  
  // Filter by userId if provided
  if (userId) {
    return results.filter(result => result.userId === userId);
  }
  
  return results;
};

// Format seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
