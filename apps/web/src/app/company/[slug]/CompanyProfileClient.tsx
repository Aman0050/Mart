"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Input } from '@nexmarto/ui';
import { Building2, MapPin, Globe, CheckCircle2, Phone, Mail, FileText, ArrowLeft, Loader2, Package, MessageSquare, ShieldCheck, Factory, Award, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

export default function CompanyProfileClient({ initialCompany, slug }: { initialCompany: any, slug: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!initialCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Building2 className="w-20 h-20 text-muted-foreground mb-6 opacity-50" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">Company Not Found</h1>
        <p className="text-muted-foreground mb-8">This supplier may have been removed or is currently unavailable.</p>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  const company = initialCompany;

  const [error, setError] = useState('');

  const handleQuickContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const subject = `Enquiry from ${formData.get('name')}`;
    const message = `Email: ${formData.get('email')}\n\nMessage:\n${formData.get('message')}`;

    try {
      await apiClient.post('/leads', {
        subject,
        message,
        companyId: company.id,
        source: 'company_profile'
      });
      setIsSent(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setIsSent(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.companyName,
    url: `https://nexmarto.com/company/${company.slug}`,
    logo: company.logoUrl,
    image: company.coverImageUrl,
    description: company.description,
    address: company.addresses?.[0] ? {
      '@type': 'PostalAddress',
      streetAddress: company.addresses[0].street,
      addressLocality: company.addresses[0].city,
      addressRegion: company.addresses[0].state,
      postalCode: company.addresses[0].zipCode,
      addressCountry: company.addresses[0].country
    } : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: company.email,
      telephone: company.phone
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full bg-slate-900 relative">
        {company.coverImageUrl && (
          <Image src={company.coverImageUrl} fill className="object-cover opacity-50 mix-blend-overlay" alt="Company Cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-24">
        
        {/* Header Profile Card */}
        <div className="bg-background rounded-2xl shadow-xl border p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-background bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 relative">
            {company.logoUrl ? (
              <Image src={company.logoUrl} fill className="object-contain p-2" alt={company.companyName} />
            ) : (
              <Building2 className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{company.companyName}</h1>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              {company.verified && (
                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Supplier
                </div>
              )}
              <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex items-center uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 mr-1" /> Trade Assurance
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground capitalize mb-4">
              {company.businessType?.replace('_', ' ') || 'Manufacturer'} • {company.yearEstablished ? `Est. ${company.yearEstablished}` : 'Newly Listed'}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              {company.addresses?.[0] && (
                <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {company.addresses[0].city}, {company.addresses[0].state}
                </div>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:text-primary/80 bg-primary/5 px-3 py-1.5 rounded-full transition-colors">
                  <Globe className="w-4 h-4 mr-2" /> Visit Website
                </a>
              )}
            </div>
          </div>
          
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 mb-6 overflow-x-auto overflow-y-hidden custom-scrollbar">
                <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 text-base">Products</TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 text-base">About Company</TabsTrigger>
                <TabsTrigger value="certifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 text-base">Capabilities & Certs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products">
                {company.products?.length === 0 ? (
                  <div className="bg-background rounded-2xl shadow-sm border p-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No products listed yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.products?.map((prod: any) => (
                      <Link href={`/product/${prod.slug}`} key={prod.id} className="group flex flex-col bg-card border rounded-xl overflow-x-auto hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                        <div className="aspect-[4/3] bg-white border-b relative flex items-center justify-center">
                          {prod.images?.[0]?.imageUrl ? (
                            <Image src={prod.images[0].imageUrl} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" alt={prod.title} sizes="(max-width: 768px) 100vw, 33vw" />
                          ) : (
                            <Package className="w-10 h-10 text-muted-foreground opacity-20" />
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{prod.title}</h3>
                          <div className="mt-auto">
                            <p className="text-xl font-black text-foreground">₹{prod.price?.toLocaleString('en-IN') || 'Ask for Price'}</p>
                            {prod.minimumOrderQuantity && (
                              <p className="text-xs font-medium text-muted-foreground mt-1">Min. Order: {prod.minimumOrderQuantity} pcs</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about">
                <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Company Overview</h2>
                    <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {company.description || "No description provided."}
                    </div>
                  </div>

                  {company.gstNumber && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" /> Verification Details</h3>
                      <div className="flex flex-col gap-2 p-5 bg-green-500/5 rounded-xl border border-green-500/20">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground font-medium">GST Number</span>
                          <span className="font-bold font-mono bg-background px-2 py-1 rounded border shadow-sm">{company.gstNumber}</span>
                        </div>
                        {company.panNumber && (
                          <div className="flex justify-between items-center text-sm border-t border-green-500/10 pt-3 mt-1">
                            <span className="text-muted-foreground font-medium">PAN Number</span>
                            <span className="font-bold font-mono bg-background px-2 py-1 rounded border shadow-sm">{company.panNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="certifications">
                <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8">
                  <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10">
                    <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Certifications & Production Capacity</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This supplier has not uploaded their ISO certifications or production line details yet.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Embedded Contact Form */}
            <div className="bg-background rounded-2xl shadow-xl border overflow-hidden sticky top-24">
              <div className="bg-primary p-6 text-primary-foreground">
                <h3 className="font-bold text-xl mb-1 flex items-center gap-2"><Send className="w-5 h-5" /> Quick Contact</h3>
                <p className="text-sm text-primary-foreground/80">Message {company.companyName} directly</p>
              </div>
              <div className="p-6">
                {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
                <form onSubmit={handleQuickContact} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Name</label>
                    <Input required name="name" placeholder="John Doe" className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input required type="email" name="email" placeholder="john@example.com" className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <textarea 
                      required
                      name="message"
                      placeholder="Hi, I'm interested in your products..." 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20" disabled={isSubmitting || isSent}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isSent ? 'Message Sent!' : 'Send Message'}
                  </Button>
                </form>
              </div>
              <div className="bg-muted/30 p-6 border-t">
                <h4 className="font-semibold text-sm mb-4">Contact Information</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Head Office</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {company.addresses?.[0] ? 
                          `${company.addresses[0].street}, ${company.addresses[0].city}, ${company.addresses[0].state} - ${company.addresses[0].zipCode}` 
                          : 'Address not available'
                        }
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0"><Phone className="w-5 h-5" /></div>
                    <p className="text-sm font-medium text-muted-foreground">Available on Request</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
