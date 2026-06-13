"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsList, TabsTrigger } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Loader2, Building2, CheckCircle2, AlertCircle, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/admin/companies?status=${statusFilter}`);
      setCompanies(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter]);

  const updateStatus = async (companyId: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status === 'active' ? 'approve' : 'reject'} this company?`)) return;
    try {
      await apiClient.patch(`/admin/companies/${companyId}/status`, { status });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Moderation</h1>
          <p className="text-muted-foreground text-sm mt-1">Review, approve, and verify marketplace suppliers.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="pending_review" className="relative">
                Pending Review
                {statusFilter !== 'pending_review' && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
              </TabsTrigger>
              <TabsTrigger value="active">Approved</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border-b border-dashed mb-4">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No companies found for this status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Owner</th>
                    <th className="px-6 py-4 font-medium">Business Type</th>
                    <th className="px-6 py-4 font-medium">Applied Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt="Logo" className="w-10 h-10 rounded border bg-white object-contain" />
                          ) : (
                            <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center"><Building2 className="w-5 h-5 text-muted-foreground" /></div>
                          )}
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-1">
                              {c.companyName} {c.verified && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground">GST: {c.gstNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{c.owner?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.owner?.email}</p>
                      </td>
                      <td className="px-6 py-4 capitalize">{c.businessType?.replace('_', ' ') || 'Unspecified'}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/company/${c.slug}`} target="_blank"><Eye className="w-4 h-4 mr-2" /> View Profile</Link>
                          </Button>
                          
                          {statusFilter === 'pending_review' && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200" onClick={() => updateStatus(c.id, 'active')}>
                                <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => updateStatus(c.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {statusFilter === 'active' && (
                            <Button variant="outline" size="sm" className="text-orange-600 hover:bg-orange-50 border-orange-200" onClick={() => updateStatus(c.id, 'suspended')}>
                              Suspend
                            </Button>
                          )}
                        </div>
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
