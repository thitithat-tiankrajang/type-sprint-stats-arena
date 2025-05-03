import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import WordsDisplay from './WordDisplay';
import TestResults from './TestResults';
import { generateWords, calculateAccuracy } from '../utils/wordUtils';
import { calculateWPM, saveTestResult, formatTime } from '../utils/testUtils';
import { TestStats } from '../types';

const WORD_COUNT = 5;
const TEST_DURATION = 10; // seconds

const TypingTest: React.FC = () => {
  const [words, setWords] = useState<string[]>([]);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [stats, setStats] = useState<TestStats>({
    wpm: 0,
    accuracy: 0,
    progress: 0,
    errors: 0,
    correctChars: 0,
    incorrectChars: 0,
    currentWordIndex: 0,
    totalWords: WORD_COUNT,
    elapsedTime: 0
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Initialize test with random words
  useEffect(() => {
    resetTest();
  }, []);
  
  // Define endTest with useCallback to prevent recreation on each render
  const endTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!isTestActive) return;
    
    setIsTestActive(false);
    setIsTestComplete(true);
    
    // Save test results
    saveTestResult(stats);
  }, [isTestActive, stats]);
  
  // Timer effect
  useEffect(() => {
    if (isTestActive && startTime !== null) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        
        setElapsedTime(elapsed);
        
        // Calculate progress
        const progress = Math.min((elapsed / TEST_DURATION) * 100, 100);
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          progress,
          elapsedTime: elapsed
        }));
        
        // End test if time is up
        if (elapsed >= TEST_DURATION) {
          endTest();
        }
      }, 100);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTestActive, startTime, endTest]);

  // Focus on input when test starts
  useEffect(() => {
    if (isTestActive) {
      inputRef.current?.focus();
    }
  }, [isTestActive]);
  
  // Calculate WPM and accuracy on each update
  useEffect(() => {
    if (isTestActive && elapsedTime > 0) {
      const wpm = calculateWPM(stats.correctChars, elapsedTime);
      const accuracy = stats.correctChars + stats.incorrectChars > 0
        ? (stats.correctChars / (stats.correctChars + stats.incorrectChars)) * 100
        : 0;
      
      setStats(prevStats => ({
        ...prevStats,
        wpm,
        accuracy
      }));
    }
  }, [stats.correctChars, stats.incorrectChars, elapsedTime, isTestActive]);
  
  const startTest = () => {
    setStartTime(Date.now());
    setIsTestActive(true);
    setIsTestComplete(false);
    setCurrentWordIndex(0);
    setTypedWords([]);
    setCurrentInput('');
    setStats(prev => ({
      ...prev,
      wpm: 0,
      accuracy: 0,
      progress: 0,
      errors: 0,
      correctChars: 0,
      incorrectChars: 0,
      currentWordIndex: 0,
      elapsedTime: 0
    }));
  };
  
  const resetTest = () => {
    setWords(generateWords(WORD_COUNT));
    setTypedWords([]);
    setCurrentInput('');
    setCurrentWordIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setIsTestActive(false);
    setIsTestComplete(false);
    setStats({
      wpm: 0,
      accuracy: 0,
      progress: 0,
      errors: 0,
      correctChars: 0,
      incorrectChars: 0,
      currentWordIndex: 0,
      totalWords: WORD_COUNT,
      elapsedTime: 0
    });
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestActive || isTestComplete) return;
    
    const value = e.target.value;
    
    // Start counting if this is the first character
    if (!startTime && value.length === 1) {
      setStartTime(Date.now());
    }
    
    // Space was pressed, move to next word
    if (value.endsWith(' ')) {
      // Calculate accuracy for the completed word
      const wordToCompare = words[currentWordIndex];
      const typedWord = value.trim();
      
      // Update typed words
      const newTypedWords = [...typedWords];
      newTypedWords[currentWordIndex] = typedWord;
      setTypedWords(newTypedWords);
      
      // Count correct and incorrect characters
      let correctChars = 0;
      let incorrectChars = 0;
      
      for (let i = 0; i < typedWord.length; i++) {
        if (i < wordToCompare.length && typedWord[i] === wordToCompare[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }
      
      // Count missing characters as errors
      if (typedWord.length < wordToCompare.length) {
        incorrectChars += wordToCompare.length - typedWord.length;
      }
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        correctChars: prevStats.correctChars + correctChars,
        incorrectChars: prevStats.incorrectChars + incorrectChars,
        currentWordIndex: currentWordIndex + 1
      }));
      
      // Move to next word
      setCurrentWordIndex(prevIndex => prevIndex + 1);
      setCurrentInput('');
      
      // End test if all words are typed
      if (currentWordIndex === words.length - 1) {
        endTest();
      }
      
      return;
    }
    
    setCurrentInput(value);
  };
  
  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Tab from changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
    }
    
    // Handle Escape key to reset test
    if (e.key === 'Escape') {
      resetTest();
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {isTestComplete ? (
        <TestResults stats={stats} onReset={resetTest} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h2 className="text-3xl font-bold">Typing Test</h2>
              <p className="text-muted-foreground">
                Type the words below as quickly and accurately as possible
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={isTestActive ? "outline" : "default"}
                onClick={isTestActive ? endTest : startTest}
              >
                {isTestActive ? "End Test" : "Start Test"}
              </Button>
              <Button
                variant="outline"
                onClick={resetTest}
                disabled={isTestActive && !isTestComplete}
              >
                Reset
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-label">WPM</p>
              <p className="stat-value">{stats.wpm}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Accuracy</p>
              <p className="stat-value">{stats.accuracy.toFixed(0)}%</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Time</p>
              <p className="stat-value">{formatTime(isTestActive ? elapsedTime : TEST_DURATION)}</p>
            </div>
          </div>
          
          <div>
            <Progress value={stats.progress} className="h-2" />
          </div>
          
          <WordsDisplay
            words={words}
            typedWords={typedWords}
            currentWordIndex={currentWordIndex}
          />
          
          <div>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!isTestActive || isTestComplete}
              placeholder={isTestActive ? "Type here..." : "Press Start to begin"}
              className="w-full p-3 bg-muted border border-border rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTest;