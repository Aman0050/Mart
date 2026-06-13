"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Loader2, ArrowLeft, Send, Save, User, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await apiClient.get(`/leads/${leadId}`);
      setLead(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const updateStatus = async (status: string) => {
    try {
      await apiClient.patch(`/leads/${leadId}/status`, { status });
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await apiClient.post(`/leads/${leadId}/messages`, { message });
      setMessage('');
      fetchLead();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSending(true);
    try {
      await apiClient.post(`/leads/${leadId}/notes`, { note });
      setNote('');
      fetchLead();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!lead) return <div className="p-20 text-center text-muted-foreground">Lead not found</div>;

  const isSeller = user?.role === 'seller';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Lead {lead.leadNumber}</h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
              lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
              lead.status === 'closed' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {lead.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Created on {format(new Date(lead.createdAt), 'PPp')}</p>
        </div>

        {isSeller && (
          <div className="ml-auto flex gap-2">
            {lead.status !== 'closed' && (
              <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus('closed')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Closed
              </Button>
            )}
            {lead.status !== 'rejected' && (
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus('rejected')}>
                <AlertCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Details & Chat */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-lg">Enquiry Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Subject</h4>
                <p className="text-base font-medium">{lead.subject}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Original Message</h4>
                <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap border">
                  {lead.message}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                <div>
                  <span className="text-xs text-muted-foreground">Quantity Needed</span>
                  <p className="font-medium">{lead.quantityRequired || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Target Budget</span>
                  <p className="font-medium">{lead.budget ? `₹${lead.budget.toLocaleString()}` : 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-lg">Conversation Thread</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {lead.messages?.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No replies yet. Send a message to start the conversation.
                </div>
              ) : (
                lead.messages.map((msg: any) => {
                  const isMe = msg.senderId === (user as any)?.sub || msg.senderId === (user as any)?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium">{isMe ? 'You' : msg.sender?.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'p')}</span>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
            <div className="p-4 border-t bg-background">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !message.trim()}>
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: Contact Info & Internal CRM Notes */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center"><User className="w-4 h-4 mr-2 text-primary" /> {isSeller ? 'Buyer Information' : 'Supplier Information'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Name</span>
                <p className="font-medium">{isSeller ? lead.buyer.fullName : lead.seller.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Email</span>
                <p className="font-medium">{isSeller ? lead.buyer.email : lead.seller.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Phone</span>
                <p className="font-medium">{isSeller ? lead.buyer.phone : lead.seller.phone}</p>
              </div>
            </CardContent>
          </Card>

          {lead.product && (
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-semibold flex items-center"><Package className="w-4 h-4 mr-2 text-primary" /> Product Interest</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm">
                <p className="font-medium text-primary">{lead.product.title}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  View product listing
                </div>
              </CardContent>
            </Card>
          )}

          {isSeller && (
            <Card>
              <CardHeader className="pb-3 border-b bg-yellow-50/50">
                <CardTitle className="text-sm font-semibold text-yellow-800">Private Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col max-h-[300px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-yellow-50/20">
                  {lead.notes?.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No internal notes added yet.</p>
                  ) : (
                    lead.notes?.map((n: any) => (
                      <div key={n.id} className="bg-white border shadow-sm rounded-md p-3 text-sm">
                        <p className="text-muted-foreground mb-2">{n.note}</p>
                        <p className="text-[10px] text-muted-foreground text-right">{format(new Date(n.createdAt), 'PPp')}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t bg-background">
                  <form onSubmit={saveNote} className="flex flex-col gap-2">
                    <textarea 
                      placeholder="Add a private note (buyer cannot see this)..." 
                      className="w-full text-sm rounded-md border p-2 bg-muted/30 min-h-[60px]"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                    <Button type="submit" size="sm" variant="secondary" disabled={isSending || !note.trim()}>
                      <Save className="w-3 h-3 mr-2" /> Save Note
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" /> Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="p-4 space-y-4 max-h-[200px] overflow-y-auto">
                {lead.timeline?.map((activity: any, idx: number) => (
                  <div key={activity.id} className="relative pl-6">
                    {idx !== lead.timeline.length - 1 && <div className="absolute left-2 top-2 bottom-[-1rem] w-px bg-border"></div>}
                    <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background"></div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), 'PPp')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
