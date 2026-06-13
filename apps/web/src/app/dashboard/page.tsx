"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from '@nexmarto/ui';
import { TrendingUp, Package, Users, ShoppingCart, ArrowRight, Activity, MessageSquare, Bell, Building2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const StoreTrafficChart = dynamic(() => import('./components/StoreTrafficChart'), { ssr: false });

const mockChartData = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 550 },
  { name: 'Thu', views: 450 },
  { name: 'Fri', views: 700 },
  { name: 'Sat', views: 650 },
  { name: 'Sun', views: 800 },
];

const recentActivities = [
  { id: 1, message: "New enquiry received for 'Industrial CNC Lathe Machine'", time: "2 hours ago", type: "lead" },
  { id: 2, message: "Your product 'Solar Panel Kits' reached 1,000 views", time: "5 hours ago", type: "milestone" },
  { id: 3, message: "System updated Trade Assurance policies", time: "1 day ago", type: "system" },
];

import { apiClient } from '@/lib/api/client';

export default function DashboardIndex() {
  const { user } = useAuthStore();
  const [chartData, setChartData] = useState(mockChartData);
  const [activities, setActivities] = useState(recentActivities);

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/admin/analytics/kpis');
        if (res.data?.chartData) setChartData(res.data.chartData);
        if (res.data?.activities) setActivities(res.data.activities);
      } catch (err) {
        // Fallback to mock data if API is not yet sending this format
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</h1>
        <p className="text-muted-foreground mt-2">Here is what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'seller' ? (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1"><TrendingUp className="w-3 h-3 text-green-500 mr-1" /> +2 from last month</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Enquiries</CardTitle>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1 text-red-500 font-medium">2 pending responses</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1"><TrendingUp className="w-3 h-3 text-green-500 mr-1" /> +12% from last week</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.3%</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1"><TrendingUp className="w-3 h-3 text-green-500 mr-1" /> +0.5% from last month</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My RFQs</CardTitle>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">3 quotes received</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saved Products</CardTitle>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">In 3 categories</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {user?.role === 'seller' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Store Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <StoreTrafficChart data={chartData} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8 lg:col-span-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[300px] overflow-y-auto custom-scrollbar">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${activity.type === 'lead' ? 'bg-blue-500' : activity.type === 'milestone' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium leading-snug">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {user?.role === 'seller' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start h-12">
                  <Link href="/dashboard/products/create"><Package className="w-4 h-4 mr-2" /> Add New Product</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start h-12">
                  <Link href="/dashboard/company/edit"><Building2 className="w-4 h-4 mr-2" /> Update Company Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
