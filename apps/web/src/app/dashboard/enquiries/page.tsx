"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Skeleton } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Loader2, Send, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BuyerEnquiriesPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await apiClient.get('/leads/buyer');
        setLeads(res.data.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">Sent</span>;
      case 'contacted': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">Replied</span>;
      case 'quoted': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">Quoted</span>;
      case 'closed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">Deal Closed</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">Track the status of your product and supplier enquiries.</p>
        </div>
        <Button asChild>
          <Link href="/products">Find More Products</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Reply</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Deals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.status === 'closed').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search enquiries..." className="pl-8 bg-muted/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Enquiries Sent</h3>
              <p className="text-muted-foreground max-w-sm mb-6">You haven't contacted any suppliers yet. Explore our catalog to find what you need.</p>
              <Button asChild><Link href="/products">Browse Catalog</Link></Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Supplier</th>
                    <th className="px-6 py-4 font-medium">Product / Subject</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {lead.company?.logoUrl ? (
                            <img src={lead.company.logoUrl} className="w-8 h-8 rounded border object-contain bg-white" alt="Logo" />
                          ) : (
                            <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center">?</div>
                          )}
                          <p className="font-medium text-foreground">{lead.company?.companyName || 'Unknown Supplier'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[300px]">
                        <p className="font-medium truncate">{lead.product?.title || lead.subject}</p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/leads/${lead.id}`}>View Thread</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
