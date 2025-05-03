// src/components/TestResults.tsx (modified)
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestStats } from '../types';
import { useAuth } from '../hooks/useauth';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Award, LineChart } from 'lucide-react';

interface TestResultsProps {
  stats: TestStats;
  onReset: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ stats, onReset }) => {
  const { wpm, accuracy, correctChars, incorrectChars, elapsedTime } = stats;
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Save test result to database
    const saveTestResult = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      try {
        const API_URL = 'http://localhost:5003/api';
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        // Send all data in a single request
        await fetch(`${API_URL}/tests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            wpm,
            accuracy,
            duration: elapsedTime,
            characterCount: correctChars + incorrectChars,
            correctChars,
            errorCount: incorrectChars
          })
        });
        
        console.log('Test results saved successfully');
      } catch (error) {
        console.error('Error saving test result:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your test results',
          variant: 'destructive'
        });
      }
    };
    
    saveTestResult();
  }, [wpm, accuracy, correctChars, incorrectChars, elapsedTime, currentUser, isAuthenticated]);
  
  const handleViewStats = () => {
    navigate('/stats');
  };
  
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
      
      {/* Add new buttons section */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <Button 
          onClick={onReset} 
          className="px-8 py-4 text-lg"
          size="lg"
        >
          Try Again
        </Button>
        <Button 
          onClick={handleViewStats} 
          variant="outline" 
          className="px-8 py-4 text-lg"
          size="lg"
        >
          <LineChart className="w-5 h-5 mr-2" />
          View Statistics
        </Button>
      </div>
      
      {/* Add optional motivational message */}
      <div className="text-center text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        {wpm > 40 ? 
          "Great speed! Check your stats to see your progress." :
          "Keep practicing! View your stats to track your improvement."
        }
      </div>
    </div>
  );
};

export default TestResults;