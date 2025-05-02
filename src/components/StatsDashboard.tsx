// src/components/StatsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Award, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { statsService } from '../services/statsService';
import { StatSummary } from '../types/stats';

interface StatsDashboardProps {
  userId?: string;
  compact?: boolean;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ userId, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const summaryData = await statsService.getStatsSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching stats summary:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'gap-6'} ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/2 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="pt-6 text-center">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No statistics available yet. Take a typing test to start tracking your progress!</p>
        </CardContent>
      </Card>
    );
  }

  // Create chart data from recent stats
  const chartData = summary.recentStats
    .filter(stat => stat.category === 'speed')
    .slice(0, 5)
    .map(stat => ({
      date: new Date(stat.createdAt).toLocaleDateString(),
      wpm: stat.value
    }))
    .reverse();

  return (
    <div className={`space-y-${compact ? '3' : '6'}`}>
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'gap-6'} ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        <Card>
          <CardHeader className={compact ? 'p-4 pb-2' : 'pb-2'}>
            <CardTitle className={`flex items-center ${compact ? 'text-base' : 'text-xl'}`}>
              <Activity className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-blue-500`} />
              Top Speed
            </CardTitle>
          </CardHeader>
          <CardContent className={`text-center ${compact ? 'p-4 pt-0' : ''}`}>
            <div className={`${compact ? 'text-3xl' : 'text-5xl'} font-bold text-blue-500`}>
              {summary.topSpeed?.value.toFixed(0) || 0}
            </div>
            <div className="text-muted-foreground mt-1 text-sm">Words Per Minute</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={compact ? 'p-4 pb-2' : 'pb-2'}>
            <CardTitle className={`flex items-center ${compact ? 'text-base' : 'text-xl'}`}>
              <CheckCircle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-green-500`} />
              Top Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className={`text-center ${compact ? 'p-4 pt-0' : ''}`}>
            <div className={`${compact ? 'text-3xl' : 'text-5xl'} font-bold text-green-500`}>
              {summary.topAccuracy?.value.toFixed(0) || 0}%
            </div>
            <div className="text-muted-foreground mt-1 text-sm">Character Accuracy</div>
          </CardContent>
        </Card>
        
        <Card className={compact ? 'md:col-span-2' : ''}>
          <CardHeader className={compact ? 'p-4 pb-2' : 'pb-2'}>
            <CardTitle className={`flex items-center ${compact ? 'text-base' : 'text-xl'}`}>
              <Award className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-purple-500`} />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent className={`text-center ${compact ? 'p-4 pt-0' : ''}`}>
            <div className={`${compact ? 'text-3xl' : 'text-5xl'} font-bold text-purple-500`}>
              {summary.totalStats || 0}
            </div>
            <div className="text-muted-foreground mt-1 text-sm">Typing Tests Completed</div>
          </CardContent>
        </Card>
      </div>

      {!compact && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent WPM</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar
                  dataKey="wpm"
                  fill="#0088FE"
                  radius={[4, 4, 0, 0]}
                  name="WPM"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsDashboard;