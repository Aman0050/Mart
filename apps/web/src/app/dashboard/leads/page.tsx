"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Loader2, Filter, MessageSquareText, TrendingUp, CheckCircle2, Clock, Mail, Phone, Calendar, ArrowRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SellerLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await apiClient.get('/leads/seller');
        setLeads(res.data.data.data); 
        if (res.data.data.data.length > 0) {
          setActiveLeadId(res.data.data.data[0].id);
        }
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
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">New</span>;
      case 'contacted': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Contacted</span>;
      case 'quoted': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Quoted</span>;
      case 'closed': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Closed</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const newCount = leads.filter(l => l.status === 'new').length;
  const closedCount = leads.filter(l => l.status === 'closed').length;

  const activeLead = leads.find(l => l.id === activeLeadId);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Management Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage buyer enquiries, send quotes, and track conversions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 shrink-0">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Enquiries</p>
              <div className="text-2xl font-black">{leads.length}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquareText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">New Leads</p>
              <div className="text-2xl font-black text-blue-600">{newCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Converted</p>
              <div className="text-2xl font-black text-green-600">{closedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Win Rate</p>
              <div className="text-2xl font-black">{leads.length > 0 ? Math.round((closedCount / leads.length) * 100) : 0}%</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col md:flex-row shadow-lg border-muted">
        {/* Left List Pane */}
        <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r bg-muted/10 h-[400px] md:h-auto">
          <div className="p-4 border-b bg-background shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search leads..." className="pl-8 bg-muted/50 w-full" />
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              <Button variant="secondary" size="sm" className="h-7 text-xs rounded-full">All</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed">Unread</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed">Quoted</Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No leads found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {leads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => setActiveLeadId(lead.id)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${activeLeadId === lead.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm truncate pr-2">{lead.buyer?.fullName}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(lead.createdAt), 'MMM dd')}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground mb-2 truncate">{lead.product?.title || lead.subject}</p>
                    <div className="flex justify-between items-center">
                      {getStatusBadge(lead.status)}
                      {lead.status === 'new' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="w-full md:w-2/3 flex flex-col bg-background h-[500px] md:h-auto overflow-hidden">
          {activeLead ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b shrink-0 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{activeLead.product?.title || activeLead.subject}</h2>
                    {getStatusBadge(activeLead.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {format(new Date(activeLead.createdAt), 'PPpp')}</span>
                    <span className="flex items-center"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded ml-1">ID: {activeLead.leadNumber}</span></span>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Buyer Card */}
                  <Card className="shadow-sm border-muted">
                    <CardHeader className="bg-muted/20 pb-3">
                      <CardTitle className="text-sm">Buyer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {activeLead.buyer?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{activeLead.buyer?.fullName}</p>
                          <p className="text-xs text-muted-foreground">Registered Buyer</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center text-sm"><Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {activeLead.buyer?.email}</div>
                        <div className="flex items-center text-sm"><Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {activeLead.buyer?.phone || 'Not provided'}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements Card */}
                  <Card className="shadow-sm border-muted">
                    <CardHeader className="bg-muted/20 pb-3">
                      <CardTitle className="text-sm">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {activeLead.product ? (
                        <div className="flex items-start gap-3 mb-3 pb-3 border-b">
                          <div className="w-12 h-12 bg-muted rounded border shrink-0 overflow-hidden flex items-center justify-center">
                            {activeLead.product.images?.[0] ? (
                              <img src={activeLead.product.images[0].imageUrl} alt="Product" className="w-full h-full object-cover" />
                            ) : (
                              <MessageSquareText className="w-6 h-6 text-muted-foreground opacity-20" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-2">{activeLead.product.title}</p>
                            <Link href={`/product/${activeLead.product.slug}`} target="_blank" className="text-xs text-primary hover:underline">View Listing <ArrowRight className="w-3 h-3 inline" /></Link>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Original Message:</p>
                        <div className="p-3 bg-white border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                          {activeLead.message}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Communication Thread Placeholder */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">Communication History</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {/* Event Timeline Element */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                        <MessageSquareText className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-900 text-sm">Lead Created</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(activeLead.createdAt), 'MMM dd, HH:mm')}</div>
                        </div>
                        <div className="text-sm text-slate-600">Buyer initiated enquiry.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t shrink-0 bg-muted/10 flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 shadow-lg">Send Quote / Reply</Button>
                <Button variant="outline" className="flex-1 bg-background">Update Status</Button>
                <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10 bg-background">Reject Lead</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageSquareText className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium text-foreground">Select an enquiry</p>
              <p className="text-sm text-center max-w-sm mt-2">Choose an enquiry from the list to view details, send quotes, and manage the deal.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
