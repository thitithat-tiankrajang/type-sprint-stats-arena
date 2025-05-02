// src/pages/StatsPage.tsx (enhanced)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Clock, Award, Target, Activity, BarChart2 } from 'lucide-react';
import { useAuth } from '../hooks/useauth';
import { Skeleton } from '@/components/ui/skeleton';
import { statsService } from '../services/statsService';
import { Stat, StatSummary } from '../types/stats';
import { toast } from '@/components/ui/use-toast';

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [speedStats, setSpeedStats] = useState<Stat[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<Stat[]>([]);
  const [progressStats, setProgressStats] = useState<Stat[]>([]);
  const [summary, setSummary] = useState<StatSummary | null>(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch stats summary
        const summaryData = await statsService.getStatsSummary();
        setSummary(summaryData);

        // Fetch speed stats (limit 30)
        const speedData = await statsService.getStats(1, 30, 'speed', 'createdAt:desc');
        setSpeedStats(speedData.stats);

        // Fetch accuracy stats (limit 30)
        const accuracyData = await statsService.getStats(1, 30, 'accuracy', 'createdAt:desc');
        setAccuracyStats(accuracyData.stats);

        // Fetch progress stats (limit 30)
        const progressData = await statsService.getStats(1, 30, 'progress', 'createdAt:desc');
        setProgressStats(progressData.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your statistics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, navigate]);

  const handleNewTest = () => {
    navigate('/type');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Prepare chart data
  const speedChartData = speedStats.slice().reverse().map(stat => ({
    date: formatDate(stat.createdAt),
    wpm: stat.value
  }));

  const accuracyChartData = accuracyStats.slice().reverse().map(stat => ({
    date: formatDate(stat.createdAt),
    accuracy: stat.value
  }));

  const progressChartData = progressStats.slice().reverse().map(stat => ({
    date: formatDate(stat.createdAt),
    characters: stat.value
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Stats distribution data
  const distributionData = [
    { name: 'Speed Tests', value: speedStats.length },
    { name: 'Accuracy Tests', value: accuracyStats.length },
    { name: 'Progress Metrics', value: progressStats.length }
  ];

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Statistics</h1>
            <p className="text-muted-foreground">Track your typing performance over time</p>
          </div>
          <Button onClick={handleNewTest} className="mt-4 sm:mt-0">
            Take New Test
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="speed">Speed</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
            <TabsTrigger value="progress" className="hidden md:inline-flex">Progress</TabsTrigger>
            <TabsTrigger value="achievements" className="hidden md:inline-flex">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                      <Skeleton className="h-4 w-3/4 mx-auto mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-xl">
                        <Activity className="h-5 w-5 mr-2 text-blue-500" />
                        Top Speed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-5xl font-bold text-blue-500">
                        {summary?.topSpeed?.value.toFixed(0) || 0}
                      </div>
                      <div className="text-muted-foreground mt-2">Words Per Minute</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-xl">
                        <Target className="h-5 w-5 mr-2 text-green-500" />
                        Top Accuracy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-5xl font-bold text-green-500">
                        {summary?.topAccuracy?.value.toFixed(0) || 0}%
                      </div>
                      <div className="text-muted-foreground mt-2">Character Accuracy</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-xl">
                        <Award className="h-5 w-5 mr-2 text-purple-500" />
                        Tests Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-5xl font-bold text-purple-500">
                        {summary?.totalStats || 0}
                      </div>
                      <div className="text-muted-foreground mt-2">Total Typing Tests</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest typing test results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary?.recentStats && summary.recentStats.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Type</th>
                              <th className="text-right py-3 px-4">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.recentStats.map((stat) => (
                              <tr key={stat._id} className="border-b">
                                <td className="py-3 px-4">
                                  {new Date(stat.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 capitalize">
                                  {stat.category}
                                </td>
                                <td className="text-right py-3 px-4 font-medium">
                                  {stat.unit === 'accuracy' 
                                    ? `${stat.value.toFixed(0)}%` 
                                    : stat.value.toFixed(0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activity found. Take a typing test to see your stats!
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Distribution Chart */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Stats Distribution</CardTitle>
                    <CardDescription>Breakdown of your typing statistics by category</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} tests`, 'Count']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Speed Tab */}
          <TabsContent value="speed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speed Progress</CardTitle>
                <CardDescription>Your typing speed (WPM) over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : speedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={speedChartData}
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
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }} 
                      />
                      <Line
                        type="monotone"
                        dataKey="wpm"
                        name="Words Per Minute"
                        stroke="#0088FE"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No speed data available. Take a typing test to track your progress!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Speed Stats Table */}
            {!loading && speedStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Speed History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-right py-3 px-4">WPM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speedStats.map((stat) => (
                          <tr key={stat._id} className="border-b">
                            <td className="py-3 px-4">
                              {new Date(stat.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {stat.title}
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              {stat.value.toFixed(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Accuracy Tab */}
          <TabsContent value="accuracy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Progress</CardTitle>
                <CardDescription>Your typing accuracy (%) over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : accuracyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={accuracyChartData}
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
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        domain={[Math.max(0, Math.min(...accuracyChartData.map(d => d.accuracy)) - 5), 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }} 
                        formatter={(value) => {
                          const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                          return [`${numValue.toFixed(2)}%`, 'Accuracy'];
                        }}                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        name="Accuracy"
                        stroke="#00C49F"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No accuracy data available. Take a typing test to track your progress!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accuracy Stats Table */}
            {!loading && accuracyStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-right py-3 px-4">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accuracyStats.map((stat) => (
                          <tr key={stat._id} className="border-b">
                            <td className="py-3 px-4">
                              {new Date(stat.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {stat.title}
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              {stat.value.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          // src/pages/StatsPage.tsx (continued)
          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Character Count Progress</CardTitle>
                <CardDescription>Total characters typed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : progressChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={progressChartData}
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
                      <Legend />
                      <Bar 
                        dataKey="characters" 
                        name="Characters Typed" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No progress data available. Take a typing test to track your progress!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cumulative Progress */}
            {!loading && progressStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Total Progress</CardTitle>
                  <CardDescription>Your cumulative typing statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">
                        {progressStats.reduce((sum, stat) => sum + stat.value, 0).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Total Characters</div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(progressStats.reduce((sum, stat) => sum + stat.value, 0) / 5).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Estimated Words</div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">
                        {progressStats.length}
                      </div>
                      <div className="text-muted-foreground">Tests Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Milestones you've reached in your typing journey</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Speed Achievement */}
                    <div className={`p-4 rounded-lg border flex items-center ${speedStats.some(s => s.value >= 40) ? 'bg-blue-950/20 border-blue-500/30' : 'bg-muted/30 border-muted'}`}>
                      <div className={`rounded-full p-3 mr-4 ${speedStats.some(s => s.value >= 40) ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                        <Activity className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Speed Demon</h3>
                        <p className="text-sm text-muted-foreground">Achieve 40+ WPM in a typing test</p>
                      </div>
                      <div className="ml-4">
                        {speedStats.some(s => s.value >= 40) ? (
                          <div className="text-green-500 font-medium">Unlocked</div>
                        ) : (
                          <div className="text-muted-foreground">Locked</div>
                        )}
                      </div>
                    </div>

                    {/* Accuracy Achievement */}
                    <div className={`p-4 rounded-lg border flex items-center ${accuracyStats.some(s => s.value >= 95) ? 'bg-green-950/20 border-green-500/30' : 'bg-muted/30 border-muted'}`}>
                      <div className={`rounded-full p-3 mr-4 ${accuracyStats.some(s => s.value >= 95) ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Precision Master</h3>
                        <p className="text-sm text-muted-foreground">Achieve 95%+ accuracy in a typing test</p>
                      </div>
                      <div className="ml-4">
                        {accuracyStats.some(s => s.value >= 95) ? (
                          <div className="text-green-500 font-medium">Unlocked</div>
                        ) : (
                          <div className="text-muted-foreground">Locked</div>
                        )}
                      </div>
                    </div>

                    {/* Consistency Achievement */}
                    <div className={`p-4 rounded-lg border flex items-center ${progressStats.length >= 10 ? 'bg-purple-950/20 border-purple-500/30' : 'bg-muted/30 border-muted'}`}>
                      <div className={`rounded-full p-3 mr-4 ${progressStats.length >= 10 ? 'bg-purple-500/20 text-purple-500' : 'bg-muted text-muted-foreground'}`}>
                        <BarChart2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Dedicated Typist</h3>
                        <p className="text-sm text-muted-foreground">Complete 10+ typing tests</p>
                      </div>
                      <div className="ml-4">
                        {progressStats.length >= 10 ? (
                          <div className="text-green-500 font-medium">Unlocked</div>
                        ) : (
                          <div className="text-muted-foreground">{`${progressStats.length}/10`}</div>
                        )}
                      </div>
                    </div>

                    {/* Marathon Achievement */}
                    <div className={`p-4 rounded-lg border flex items-center ${progressStats.reduce((sum, stat) => sum + stat.value, 0) >= 5000 ? 'bg-yellow-950/20 border-yellow-500/30' : 'bg-muted/30 border-muted'}`}>
                      <div className={`rounded-full p-3 mr-4 ${progressStats.reduce((sum, stat) => sum + stat.value, 0) >= 5000 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Word Marathon</h3>
                        <p className="text-sm text-muted-foreground">Type 5,000+ total characters</p>
                      </div>
                      <div className="ml-4">
                        {progressStats.reduce((sum, stat) => sum + stat.value, 0) >= 5000 ? (
                          <div className="text-green-500 font-medium">Unlocked</div>
                        ) : (
                          <div className="text-muted-foreground">
                            {`${(progressStats.reduce((sum, stat) => sum + stat.value, 0) / 5000 * 100).toFixed(0)}%`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatsPage;