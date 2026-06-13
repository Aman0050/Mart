"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building2, PackageOpen, MessageSquareText, ShieldAlert, Settings, FileText, Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@nexmarto/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Basic RBAC check
  if (user && !['admin', 'super_admin', 'operations_admin', 'support_admin'].includes(user.role)) {
    router.push('/dashboard');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Companies', icon: Building2, href: '/admin/companies' },
    { label: 'Products', icon: PackageOpen, href: '/admin/products' },
    { label: 'Leads & Enquiries', icon: MessageSquareText, href: '/admin/leads' },
    { label: 'Audit Logs', icon: ShieldAlert, href: '/admin/audit-logs' },
    { label: 'Reports', icon: FileText, href: '/admin/reports' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950/50">
          <Link href="/admin" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-500" /> Nexmarto OS
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Management</div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
          <button 
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link href="/" target="_blank" className="text-sm font-medium text-blue-600 hover:underline hidden sm:block">
              View Marketplace
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
