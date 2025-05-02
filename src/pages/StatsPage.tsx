
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import StatisticsChart from '../components/StatisticsChart';
import { getTestResults } from '../utils/testUtils';
import { useAuth } from '../contexts/AuthContext';
import { TestResult } from '../types';

const StatsPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load test results from localStorage
    const userId = currentUser?.uid || 'anonymous';
    const userResults = getTestResults(userId);
    setResults(userResults);
  }, [currentUser]);

  const handleNewTest = () => {
    navigate('/type');
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Statistics</h1>
            <p className="text-muted-foreground">Track your typing performance over time</p>
          </div>
          <Button onClick={handleNewTest} className="mt-4 sm:mt-0">
            Take New Test
          </Button>
        </div>

        <StatisticsChart results={results} />

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Tests</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">WPM</th>
                    <th className="text-right py-3 px-4">Accuracy</th>
                    <th className="text-right py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results]
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 10)
                    .map((result) => (
                      <tr key={result.id} className="border-b border-border">
                        <td className="py-3 px-4">
                          {new Date(result.date).toLocaleDateString()}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {result.wpm}
                        </td>
                        <td className="text-right py-3 px-4">
                          {result.accuracy.toFixed(0)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          {Math.floor(result.duration / 60)}:{Math.floor(result.duration % 60)
                            .toString()
                            .padStart(2, '0')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
