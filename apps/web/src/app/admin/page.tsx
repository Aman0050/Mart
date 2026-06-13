"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Users, Building2, PackageOpen, MessageSquareText, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const GrowthChart = dynamic(() => import('./components/GrowthChart'), { ssr: false });

// Mock data for the chart since we don't have historical data generation yet
const generateMockGrowthData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      users: Math.floor(100 + Math.random() * 50 + (30 - i) * 5),
      leads: Math.floor(50 + Math.random() * 30 + (30 - i) * 3),
    });
  }
  return data;
};

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartData = useState(generateMockGrowthData)[0];

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await apiClient.get('/admin/analytics/kpis');
        setKpis(res.data.data);
      } catch (err) {
        console.error("Failed to fetch KPIs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const kpiCards = [
    { title: 'Total Users', value: kpis?.totalUsers || 0, icon: Users, color: 'text-blue-600', trend: '+12%' },
    { title: 'Active Suppliers', value: kpis?.totalSuppliers || 0, icon: Building2, color: 'text-indigo-600', trend: '+5%' },
    { title: 'Active Products', value: kpis?.totalProducts || 0, icon: PackageOpen, color: 'text-violet-600', trend: '+18%' },
    { title: 'Total Leads Generated', value: kpis?.totalLeads || 0, icon: MessageSquareText, color: 'text-emerald-600', trend: '+24%' },
    { title: 'Total RFQs', value: kpis?.totalRfqs || 0, icon: TrendingUp, color: 'text-orange-600', trend: '+42%' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">Welcome to the Nexmarto Command Center.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>System Settings</Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> {card.trend} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* CHART */}
        <Card className="col-span-1 lg:col-span-5">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <GrowthChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        {/* STATS WIDGET */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Conversion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border">
              <span className="text-sm font-medium text-muted-foreground mb-2">Overall Conversion Rate</span>
              <span className="text-5xl font-black text-slate-900">{kpis?.conversionRate}%</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><div className="w-3 h-3 rounded-full bg-blue-100 mr-2 border border-blue-300"></div> New Leads</span>
                <span className="font-medium">{kpis?.newLeads}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><div className="w-3 h-3 rounded-full bg-green-100 mr-2 border border-green-300"></div> Closed Deals</span>
                <span className="font-medium">{kpis?.convertedLeads}</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-auto">View Lead Analytics <ArrowUpRight className="w-4 h-4 ml-2" /></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
