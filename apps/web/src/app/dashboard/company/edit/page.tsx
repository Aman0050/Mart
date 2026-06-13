"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardFooter, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Building2, Save, ArrowLeft, Loader2, MapPin, Map } from 'lucide-react';
import Link from 'next/link';

const companySchema = z.object({
  companyName: z.string().min(2),
  businessType: z.string().min(2),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  yearEstablished: z.coerce.number().optional(),
  employeeCount: z.coerce.number().optional(),
});

const addressSchema = z.object({
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default('India'),
});

type CompanyForm = z.infer<typeof companySchema>;
type AddressForm = z.infer<typeof addressSchema>;

function EditCompanyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'info';

  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { register, handleSubmit, reset } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  const { register: registerAddr, handleSubmit: handleAddrSubmit, reset: resetAddr, formState: { errors: addrErrors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get('/companies/my-company');
      setCompany(res.data.data);
      reset({
        companyName: res.data.data.companyName,
        businessType: res.data.data.businessType,
        website: res.data.data.website,
        description: res.data.data.description,
        gstNumber: res.data.data.gstNumber,
        panNumber: res.data.data.panNumber,
        yearEstablished: res.data.data.yearEstablished,
        employeeCount: res.data.data.employeeCount,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitInfo = async (data: CompanyForm) => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      await apiClient.patch(`/companies/${company.id}`, data);
      setSaveMessage({ type: 'success', text: 'Company information updated successfully.' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to update company information.' });
    } finally {
      setIsSaving(false);
    }
  };

  const onAddAddress = async (data: AddressForm) => {
    try {
      setIsSaving(true);
      await apiClient.post(`/companies/${company.id}/address`, data);
      setSaveMessage({ type: 'success', text: 'Address added successfully.' });
      resetAddr();
      fetchCompany();
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to add address.' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/addresses/${id}`);
      fetchCompany();
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to delete address.' });
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/company" className="p-2 bg-background border rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public information and addresses.</p>
        </div>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 text-sm rounded-md border ${
          saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="info">General Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="branding">Logos & Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <form onSubmit={handleSubmit(onSubmitInfo)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input {...register('companyName')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register('businessType')}
                    >
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input {...register('gstNumber')} />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN Number</Label>
                    <Input {...register('panNumber')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year Established</Label>
                    <Input type="number" {...register('yearEstablished')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input {...register('website')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    rows={6}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('description')}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {company.addresses?.map((addr: any) => (
                <Card key={addr.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary" /> Address</span>
                      <button 
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <form onSubmit={handleAddrSubmit(onAddAddress)}>
                <CardHeader>
                  <CardTitle>Add New Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input {...registerAddr('addressLine1')} />
                    {addrErrors.addressLine1 && <span className="text-xs text-destructive">Required</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input {...registerAddr('city')} />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input {...registerAddr('state')} />
                    </div>
                    <div className="space-y-2">
                      <Label>PIN Code *</Label>
                      <Input {...registerAddr('postalCode')} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button type="submit" disabled={isSaving}>Add Address</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="mb-4 block">Company Logo</Label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline">Upload New Logo</Button>
                    <p className="text-xs text-muted-foreground mt-2">Recommended size: 500x500px (JPG, PNG)</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-4 block">Cover Image</Label>
                <div className="w-full h-48 rounded-xl border bg-muted flex flex-col items-center justify-center overflow-hidden relative">
                  {company.coverImageUrl ? (
                    <img src={company.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Map className="w-10 h-10 text-muted-foreground mb-2" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary">Upload Cover Photo</Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Recommended size: 1920x400px (JPG, PNG). This appears on your public profile header.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EditCompanyPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <EditCompanyContent />
    </Suspense>
  );
}
