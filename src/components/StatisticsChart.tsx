
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TestResult, ChartData } from '../types';

interface StatisticsChartProps {
  results: TestResult[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ results }) => {
  // No data message
  if (results.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-60">
          <p className="text-muted-foreground">No test data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort results by date
  const sortedResults = [...results].sort((a, b) => a.date - b.date);

  // Format data for chart
  const chartData: ChartData[] = sortedResults.map(result => ({
    date: new Date(result.date).toLocaleDateString(),
    wpm: result.wpm,
    accuracy: result.accuracy
  }));

  // Calculate statistics
  const calculateStats = () => {
    const wpmValues = results.map(r => r.wpm);
    const accuracyValues = results.map(r => r.accuracy);
    
    return {
      avgWPM: Math.round(wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length),
      maxWPM: Math.max(...wpmValues),
      avgAccuracy: Math.round(accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length),
      tests: results.length
    };
  };
  
  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Tests Taken</p>
          <p className="stat-value">{stats.tests}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average WPM</p>
          <p className="stat-value">{stats.avgWPM}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Best WPM</p>
          <p className="stat-value">{stats.maxWPM}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average Accuracy</p>
          <p className="stat-value">{stats.avgAccuracy}%</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date"
                stroke="#888888" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#888888"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#888888"
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }} 
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                name="WPM"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                name="Accuracy (%)"
                stroke="hsl(var(--secondary))"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsChart;
