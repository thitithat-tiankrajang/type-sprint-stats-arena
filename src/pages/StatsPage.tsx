// src/pages/StatsPage.tsx (improved)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../hooks/useauth';
import { toast } from '@/components/ui/use-toast';
import StatsDashboard from '../components/StatsDashboard';
import TestHistoryTable from '../components/TestHistoryTable';
import { DashboardData } from '../types/stats';

const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
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
        
        const data = await response.json();
        setDashboardData(data.data);
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

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const handleNewTest = () => {
    navigate('/type');
  };

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
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : dashboardData ? (
              <StatsDashboard dashboardData={dashboardData} />
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-medium">No statistics data yet</p>
                <p className="text-muted-foreground mb-6">Take a test to start tracking your progress</p>
                <Button onClick={handleNewTest}>Start Your First Test</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : dashboardData?.recentTests?.length > 0 ? (
              <TestHistoryTable tests={dashboardData.recentTests} />
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-medium">No test history found</p>
                <p className="text-muted-foreground mb-6">Take a test to see your history here</p>
                <Button onClick={handleNewTest}>Start Your First Test</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatsPage;