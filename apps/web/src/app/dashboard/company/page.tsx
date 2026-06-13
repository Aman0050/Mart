"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Progress } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Building2, Edit2, UploadCloud, Eye, Plus, ShieldCheck, MapPin, Globe, Loader2, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiClient.get('/companies/my-company');
        setCompany(res.data.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          router.push('/company/create');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) return null;

  // Calculate generic profile completion
  let score = 20; // Base score for having an entity
  if (company.description) score += 20;
  if (company.logoUrl) score += 20;
  if (company.gstNumber) score += 20;
  if (company.addresses?.length > 0) score += 20;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{company.companyName}</h1>
            <div className="flex items-center gap-2 mt-1">
              {company.status === 'active' ? (
                <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Active
                </span>
              ) : (
                <span className="flex items-center text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  Pending Review
                </span>
              )}
              <span className="text-sm text-muted-foreground capitalize">{company.businessType}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/company/${company.slug}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" /> View Public Profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/company/edit">
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">{score}%</div>
            <Progress value={score} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" /> +12% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" /> +4% this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-xl flex items-center justify-between bg-muted/20 hover:bg-muted/50 transition-colors">
              <div>
                <h4 className="font-semibold">Manage Gallery</h4>
                <p className="text-sm text-muted-foreground">Upload photos of your manufacturing unit and office</p>
              </div>
              <Button asChild variant="outline" size="icon">
                <Link href="/company/gallery"><UploadCloud className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="p-4 border rounded-xl flex items-center justify-between bg-muted/20 hover:bg-muted/50 transition-colors">
              <div>
                <h4 className="font-semibold">Manage Addresses</h4>
                <p className="text-sm text-muted-foreground">Add branch offices and factories</p>
              </div>
              <Button asChild variant="outline" size="icon">
                <Link href="/company/edit?tab=addresses"><MapPin className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="p-4 border rounded-xl flex items-center justify-between bg-muted/20 hover:bg-muted/50 transition-colors">
              <div>
                <h4 className="font-semibold">Add New Product</h4>
                <p className="text-sm text-muted-foreground">Expand your product catalog</p>
              </div>
              <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/products/create"><Plus className="w-4 h-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">GST Number</p>
                  <p className="font-medium">{company.gstNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PAN Number</p>
                  <p className="font-medium">{company.panNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year Established</p>
                  <p className="font-medium">{company.yearEstablished || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Website</p>
                  <p className="font-medium">{company.website || 'Not provided'}</p>
                </div>
             </div>
             
             <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-2">Primary Address</p>
                {company.addresses && company.addresses.length > 0 ? (
                  <p className="text-sm font-medium">
                    {company.addresses[0].addressLine1}, {company.addresses[0].city}, {company.addresses[0].state}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No addresses added yet.</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
