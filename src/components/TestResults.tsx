// src/components/TestResults.tsx (modified)
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestStats } from '../types';
import { useAuth } from '../hooks/useauth';
import { toast } from '@/components/ui/use-toast';

interface TestResultsProps {
  stats: TestStats;
  onReset: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ stats, onReset }) => {
  const { wpm, accuracy, correctChars, incorrectChars, elapsedTime } = stats;
  const { currentUser, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Save test result to stats API
    const saveStats = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      try {
        // Get API URL from a variable that works in your environment
        // For Vite:
        const API_URL = 'http://localhost:5003/api';
        // For Create React App:        
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        // Save WPM stat
        await fetch(`${API_URL}/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `Typing Speed: ${wpm} WPM`,
            value: wpm,
            unit: 'wpm',
            category: 'speed',
            icon: 'activity',
            color: '#3498db'
          })
        });
        
        // Save accuracy stat
        await fetch(`${API_URL}/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `Typing Accuracy: ${accuracy.toFixed(0)}%`,
            value: accuracy,
            unit: 'accuracy',
            category: 'accuracy',
            icon: 'check-circle',
            color: '#2ecc71'
          })
        });
        
        // Save words typed count
        await fetch(`${API_URL}/stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `Total Characters: ${correctChars + incorrectChars}`,
            value: correctChars + incorrectChars,
            unit: 'count',
            category: 'progress',
            icon: 'type',
            color: '#9b59b6'
          })
        });
        
      } catch (error) {
        console.error('Error saving stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your test results',
          variant: 'destructive'
        });
      }
    };
    
    saveStats();
  }, [wpm, accuracy, correctChars, incorrectChars, elapsedTime, currentUser, isAuthenticated]);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Rest of the component remains the same */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
        <p className="text-muted-foreground">Here's how you did:</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-primary mb-2">{wpm}</span>
              <span className="text-xl text-muted-foreground">WPM</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold text-primary mb-2">{accuracy.toFixed(0)}%</span>
              <span className="text-xl text-muted-foreground">of characters correct</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="stat-card">
          <p className="stat-label">Characters</p>
          <p className="stat-value">{correctChars + incorrectChars}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Errors</p>
          <p className="stat-value">{incorrectChars}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Time</p>
          <p className="stat-value">
            {Math.floor(elapsedTime / 60)}:{Math.floor(elapsedTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={onReset} className="px-6">Try Again</Button>
      </div>
    </div>
  );
};

export default TestResults;