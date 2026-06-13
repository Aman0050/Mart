"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Loader2, MoreHorizontal, ShieldAlert, CheckCircle2, Ban } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const updateStatus = async (userId: string, status: string) => {
    if (!confirm(`Are you sure you want to change this user's status to ${status}?`)) return;
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage platform users, roles, and account statuses.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <form onSubmit={handleSearch} className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search name or email..." 
              className="pl-8 bg-muted/50" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Last Login</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          u.role.includes('admin') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <span className="flex items-center text-green-600 font-medium text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</span>
                        ) : u.status === 'suspended' ? (
                          <span className="flex items-center text-orange-600 font-medium text-xs"><ShieldAlert className="w-3 h-3 mr-1" /> Suspended</span>
                        ) : (
                          <span className="flex items-center text-red-600 font-medium text-xs"><Ban className="w-3 h-3 mr-1" /> Deleted</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{u.lastLoginAt ? format(new Date(u.lastLoginAt), 'MMM dd, yyyy') : 'Never'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {u.status === 'active' && !u.role.includes('admin') && (
                            <Button variant="outline" size="sm" className="text-orange-600 hover:bg-orange-50 border-orange-200" onClick={() => updateStatus(u.id, 'suspended')}>
                              Suspend
                            </Button>
                          )}
                          {u.status === 'suspended' && (
                            <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200" onClick={() => updateStatus(u.id, 'active')}>
                              Reactivate
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
