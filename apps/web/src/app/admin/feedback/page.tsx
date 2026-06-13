"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Users, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function FeedbackAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/admin/analytics/feedback-analytics');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Feedback Analytics</h2>
        <p className="text-muted-foreground mt-1">Closed Beta user insights and platform satisfaction.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.npsScore}</div>
            <p className="text-xs text-muted-foreground">Net Promoter Score (-100 to 100)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgRating} / 5.0</div>
            <p className="text-xs text-muted-foreground">Global satisfaction across roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Rating</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgSupplierRating} / 5.0</div>
            <p className="text-xs text-muted-foreground">Seller experiences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground">Submitted in Closed Beta</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
