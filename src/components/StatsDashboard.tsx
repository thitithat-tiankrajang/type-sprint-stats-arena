import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, Target, Keyboard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardData } from '../types/stats';

interface StatsDashboardProps {
  dashboardData?: DashboardData;
  compact?: boolean;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ dashboardData, compact = false }) => {
  const [loading, setLoading] = useState(!dashboardData);
  const [data, setData] = useState<DashboardData | null>(dashboardData || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If dashboardData is already provided, use it and skip loading
    if (dashboardData) {
      setData(dashboardData);
      setLoading(false);
      return;
    }

    // Otherwise load the data from API
    const fetchDashboardData = async () => {
      try {
        const API_URL = 'http://localhost:5003/api';
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/tests/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const responseData = await response.json();
        setData(responseData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'gap-6'} ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse bg-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/2 mx-auto bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-red-900 border-red-700 text-red-50">
        <CardContent className="pt-6 text-center">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-gray-100">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300">No statistics available yet. Take a typing test to start tracking your progress!</p>
        </CardContent>
      </Card>
    );
  }

  const { recentTests, personalBests, averages, trends, skillLevel } = data;
  
  // Prepare chart data - only if not in compact mode
  const chartData = !compact && recentTests?.length > 0 ? 
    recentTests.map(test => ({
      date: new Date(test.date).toLocaleDateString(),
      wpm: test.wpm,
      accuracy: test.accuracy
    })).reverse() : [];
  
  // Calculate skill progress
  const getSkillProgress = (wpm: number) => {
    if (wpm >= 80) return 100;
    if (wpm >= 60) return 75;
    if (wpm >= 40) return 50;
    if (wpm >= 20) return 25;
    return Math.max(5, Math.min(100, wpm / 80 * 100));
  };
  
  const skillProgress = getSkillProgress(averages?.avgWPM || 0);
  
  // Simplified view for compact mode
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-blue-950 border-blue-700 text-blue-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center text-blue-50">
                <Award className="h-4 w-4 mr-2 text-blue-200" />
                Top Speed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0">
              <div className="text-3xl font-bold text-blue-200">
                {personalBests?.wpm?.wpm || 0}
              </div>
              <div className="text-blue-300 mt-1 text-sm">WPM</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-950 border-green-700 text-green-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center text-green-50">
                <Target className="h-4 w-4 mr-2 text-green-200" />
                Top Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0">
              <div className="text-3xl font-bold text-green-200">
                {personalBests?.accuracy?.accuracy !== undefined
                  ? (typeof personalBests.accuracy.accuracy === 'number'
                    ? personalBests.accuracy.accuracy.toFixed(0)
                    : personalBests.accuracy.accuracy)
                  : 0}%
              </div>
              <div className="text-green-300 mt-1 text-sm">Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2a1038] border-purple-700 text-purple-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center text-purple-50">
                <Keyboard className="h-4 w-4 mr-2 text-purple-200" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0">
              <div className="text-3xl font-bold text-purple-200">
                {averages?.totalTests || 0}
              </div>
              <div className="text-purple-300 mt-1 text-sm">Tests</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Full dashboard view when not in compact mode
  return (
    <div className="space-y-6">
      {/* Skill Level */}
      <Card className="bg-gray-800 border-gray-700 text-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Typing Skill Level</span>
            <Badge variant="outline" className="ml-2 bg-gray-700 text-gray-200 border-gray-600">{skillLevel || 'Beginner'}</Badge>
          </CardTitle>
          <CardDescription className="text-gray-300">
            {averages?.totalTests 
              ? `Based on ${averages.totalTests} test results`
              : 'Take a test to see your skill level'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-200">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
            <Progress value={skillProgress} className="h-2 bg-gray-700" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0 WPM</span>
              <span>20 WPM</span>
              <span>40 WPM</span>
              <span>60 WPM</span>
              <span>80+ WPM</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Personal Bests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-950 border-blue-700 text-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center text-blue-50">
              <Award className="w-5 h-5 mr-2 text-blue-200" />
              Top Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-200">
                {personalBests?.wpm?.wpm || 0}
              </div>
              <div className="text-sm text-blue-300">
                Words Per Minute
              </div>
              {personalBests?.wpm && (
                <div className="text-xs mt-2 text-blue-400">
                  {new Date(personalBests.wpm.date).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-950 border-green-700 text-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center text-green-50">
              <Target className="w-5 h-5 mr-2 text-green-200" />
              Top Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-200">
                {personalBests?.accuracy?.accuracy !== undefined 
                  ? (typeof personalBests.accuracy.accuracy === 'number' 
                    ? personalBests.accuracy.accuracy.toFixed(0) 
                    : personalBests.accuracy.accuracy) 
                  : 0}%
              </div>
              <div className="text-sm text-green-300">
                Accuracy
              </div>
              {personalBests?.accuracy && (
                <div className="text-xs mt-2 text-green-400">
                  {new Date(personalBests.accuracy.date).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#2a1038] border-purple-700 text-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center text-purple-50">
              <Keyboard className="w-5 h-5 mr-2 text-purple-200" />
              Total Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-200">
                  {averages?.totalTests || 0}
                </div>
                <div className="text-xs text-purple-300">
                  Tests
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-200">
                  {(averages?.totalChars || 0).toLocaleString()}
                </div>
                <div className="text-xs text-purple-300">
                  Characters Typed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Trends */}
      {trends && (
        <Card className="bg-gray-800 border-gray-700 text-gray-100">
          <CardHeader>
            <CardTitle className="text-white">Recent Trends</CardTitle>
            <CardDescription className="text-gray-300">
              Compared to your previous test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 rounded-lg bg-gray-700">
                {trends.wpmChange > 0 ? (
                  <TrendingUp className="text-green-300 mr-3 h-6 w-6" />
                ) : (
                  <TrendingDown className="text-red-300 mr-3 h-6 w-6" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-200">Speed</div>
                  <div className={`text-2xl font-bold ${
                    trends.wpmChange > 0 ? 'text-green-300' : 
                    trends.wpmChange < 0 ? 'text-red-300' : 'text-gray-200'
                  }`}>
                    {trends.wpmChange > 0 ? `+${trends.wpmChange.toFixed(0)}` : trends.wpmChange.toFixed(0)} WPM
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-4 rounded-lg bg-gray-700">
                {trends.accuracyChange > 0 ? (
                  <TrendingUp className="text-green-300 mr-3 h-6 w-6" />
                ) : (
                  <TrendingDown className="text-red-300 mr-3 h-6 w-6" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-200">Accuracy</div>
                  <div className={`text-2xl font-bold ${
                    trends.accuracyChange > 0 ? 'text-green-300' : 
                    trends.accuracyChange < 0 ? 'text-red-300' : 'text-gray-200'
                  }`}>
                    {trends.accuracyChange > 0 ? `+${trends.accuracyChange.toFixed(1)}` : trends.accuracyChange.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Results Chart */}
      {chartData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 text-gray-100">
          <CardHeader>
            <CardTitle className="text-white">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#d1d5db" />
                <YAxis yAxisId="left" orientation="left" domain={['dataMin - 5', 'dataMax + 5']} stroke="#d1d5db" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#d1d5db" />
                <Tooltip contentStyle={{ backgroundColor: '#374151', color: '#f3f4f6', borderColor: '#4b5563' }} />
                <Line yAxisId="left" type="monotone" dataKey="wpm" name="WPM" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4, fill: '#60a5fa' }} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsDashboard;