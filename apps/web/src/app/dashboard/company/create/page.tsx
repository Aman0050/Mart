"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Progress } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Building2, FileText, UploadCloud, MapPin, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  businessType: z.string().min(2, "Business type is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  description: z.string().min(10, "Description must be at least 10 characters"),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  yearEstablished: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.coerce.number().min(1).optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CreateCompanyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  const companyName = watch('companyName');

  useEffect(() => {
    if (companyName && step === 1) {
      const generatedSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const slugInput = document.getElementById('slug') as HTMLInputElement;
      if (slugInput && !slugInput.value) {
        slugInput.value = generatedSlug;
      }
    }
  }, [companyName, step]);

  const handleNextStep = async () => {
    // Validate current step
    let fieldsToValidate: (keyof CompanyForm)[] = [];
    if (step === 1) fieldsToValidate = ['companyName', 'slug', 'businessType'];
    if (step === 2) fieldsToValidate = ['gstNumber', 'panNumber', 'yearEstablished', 'employeeCount'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const onSubmit = async (data: CompanyForm) => {
    try {
      setErrorMsg(null);
      await apiClient.post('/companies', data);
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || "Failed to create company profile.");
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Company Profile Created!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your company is successfully registered. You can now configure your gallery and address.
        </p>
        <Button onClick={() => router.push('/company')} size="lg">
          Go to Company Dashboard <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    );
  }

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Setup your Company</h1>
        <p className="text-muted-foreground mt-2">Create a professional enterprise profile to attract B2B buyers.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Basic Info</span>
          <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Business Details</span>
          <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>Description</span>
        </div>
        <Progress value={progress} />
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {errorMsg}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6 space-y-6">
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input id="companyName" placeholder="Acme Industries Ltd." error={!!errors.companyName} {...register('companyName')} />
                  {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Profile URL Slug *</Label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      nexmarto.com/company/
                    </span>
                    <Input id="slug" className="rounded-l-none" placeholder="acme-industries" error={!!errors.slug} {...register('slug')} />
                  </div>
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <select 
                    id="businessType" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('businessType')}
                  >
                    <option value="">Select type...</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Service Provider">Service Provider</option>
                  </select>
                  {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" error={!!errors.gstNumber} {...register('gstNumber')} />
                    {errors.gstNumber && <p className="text-sm text-destructive">{errors.gstNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input id="panNumber" placeholder="ABCDE1234F" error={!!errors.panNumber} {...register('panNumber')} />
                    {errors.panNumber && <p className="text-sm text-destructive">{errors.panNumber.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input id="yearEstablished" type="number" placeholder="2010" error={!!errors.yearEstablished} {...register('yearEstablished')} />
                    {errors.yearEstablished && <p className="text-sm text-destructive">{errors.yearEstablished.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input id="employeeCount" type="number" placeholder="50" error={!!errors.employeeCount} {...register('employeeCount')} />
                    {errors.employeeCount && <p className="text-sm text-destructive">{errors.employeeCount.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://acme.com" error={!!errors.website} {...register('website')} />
                  {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description *</Label>
                  <textarea 
                    id="description" 
                    rows={8}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe your manufacturing capabilities, history, and major products. A good description builds trust with enterprise buyers."
                    {...register('description')}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6 bg-muted/20">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep}>
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                Save Profile <CheckCircle2 className="ml-2 w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
