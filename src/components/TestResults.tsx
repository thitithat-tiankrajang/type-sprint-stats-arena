
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestStats } from '../types';

interface TestResultsProps {
  stats: TestStats;
  onReset: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ stats, onReset }) => {
  const { wpm, accuracy, correctChars, incorrectChars, elapsedTime } = stats;
  
  return (
    <div className="space-y-8 animate-fade-in">
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
