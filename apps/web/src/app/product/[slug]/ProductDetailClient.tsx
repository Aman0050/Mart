"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/utils/analytics';
import { Button, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexmarto/ui';
import { Building2, MapPin, Globe, CheckCircle2, Package, MessageSquare, ArrowLeft, ShieldCheck, Star, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { EnquiryModal } from '@/components/leads/EnquiryModal';

export default function ProductDetailClient({ initialProduct, slug }: { initialProduct: any, slug: string }) {
  const router = useRouter();
  
  const [activeImage, setActiveImage] = useState<string | null>(
    initialProduct?.images?.length > 0 ? initialProduct.images[0].imageUrl : null
  );
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      trackEvent('view_item', {
        item_id: initialProduct.id,
        item_name: initialProduct.title,
        item_category: initialProduct.category?.name || 'Uncategorized',
        value: initialProduct.price || 0,
        currency: 'INR'
      });
    }
  }, [initialProduct]);

  if (!initialProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Package className="w-20 h-20 text-muted-foreground mb-6 opacity-50" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">This product may have been removed or is currently unavailable.</p>
        <Button onClick={() => router.push('/products')}>Browse Catalog</Button>
      </div>
    );
  }

  const product = initialProduct;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.[0]?.imageUrl,
    description: product.description || product.shortDescription,
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: `https://nexmarto.com/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price || 0,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.company?.companyName
      }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-muted/10 min-h-screen pb-32 lg:pb-24 pt-8">
        <div className="container">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar">
            <Link href="/" className="hover:text-primary transition-colors"><Home className="w-4 h-4" /></Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-primary">{product.category?.name || 'Uncategorized'}</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.title}</span>
          </nav>

          <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Product Gallery */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border flex items-center justify-center relative group">
                  {activeImage ? (
                    <>
                      <Image src={activeImage} alt={product.title} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" priority sizes="(max-width: 1024px) 100vw, 50vw" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-600 border flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" /> Trade Assurance
                      </div>
                    </>
                  ) : (
                    <Package className="w-24 h-24 text-muted-foreground opacity-20" />
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {product.images.map((img: any, i: number) => (
                      <button 
                        key={img.id || i} 
                        onClick={() => setActiveImage(img.imageUrl)}
                        className={`aspect-square rounded-lg border overflow-hidden bg-white relative ${activeImage === img.imageUrl ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/50 transition-colors'}`}
                      >
                        <Image src={img.imageUrl} alt="Thumbnail" fill className="object-contain p-1" sizes="20vw" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                  {product.title}
                </h1>
                
                {product.shortDescription && (
                  <p className="text-lg text-muted-foreground mb-6">
                    {product.shortDescription}
                  </p>
                )}

                <div className="bg-muted/30 border rounded-xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
                  <p className="text-sm text-muted-foreground mb-1 uppercase font-semibold">Wholesale Price</p>
                  <p className="text-4xl font-black text-foreground mb-2">
                    {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Ask for Price'}
                  </p>
                  {product.minimumOrderQuantity && (
                    <div className="flex items-center gap-2 mt-4 text-sm font-medium">
                      <span className="bg-background border text-foreground px-3 py-1.5 rounded-lg shadow-sm">MOQ: {product.minimumOrderQuantity} Pieces</span>
                    </div>
                  )}
                </div>

                <div className="hidden lg:flex flex-col sm:flex-row gap-4 mt-auto">
                  <Button size="lg" className="flex-1 text-lg shadow-xl shadow-primary/30 hover:-translate-y-1 transition-transform bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary animate-pulse-subtle" onClick={() => setIsEnquiryModalOpen(true)}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Send Enquiry Now
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1 text-lg hover:-translate-y-1 transition-transform border-primary/20 hover:bg-primary/5" asChild>
                    <Link href={`/company/${product.company?.slug}`}>
                      <Building2 className="w-5 h-5 mr-2" /> Visit Supplier
                    </Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
                  <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 text-base font-medium">Overview</TabsTrigger>
                  <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 text-base font-medium">Specifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6">Product Description</h2>
                    <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {product.description || "No detailed description provided."}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="mt-6">
                  <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
                    {product.specifications?.length > 0 ? (
                      <div className="border rounded-xl overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <tbody>
                            {product.specifications.map((spec: any, idx: number) => (
                              <tr key={spec.id || idx} className={idx % 2 === 0 ? 'bg-muted/30' : 'bg-background hover:bg-muted/10 transition-colors'}>
                                <td className="px-6 py-4 font-semibold text-muted-foreground w-1/3 border-r">{spec.specName}</td>
                                <td className="px-6 py-4 text-foreground font-medium">{spec.specValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-8 border border-dashed rounded-xl">
                        <p className="text-muted-foreground italic">No technical specifications listed.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              {/* Supplier Card */}
              <div className="bg-background rounded-2xl shadow-sm border overflow-hidden sticky top-24">
                <div className="h-24 bg-muted w-full relative">
                  {product.company?.coverImageUrl && (
                    <Image src={product.company.coverImageUrl} fill className="object-cover" alt="Cover" sizes="33vw" />
                  )}
                  <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl border-4 border-background bg-white flex items-center justify-center overflow-hidden shadow-sm relative">
                    {product.company?.logoUrl ? (
                      <Image src={product.company.logoUrl} fill className="object-contain p-1" alt="Logo" sizes="64px" />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <div className="pt-12 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg leading-tight">{product.company?.companyName}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {product.company?.status === 'active' && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    <span className="flex items-center text-yellow-500 text-sm font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" /> 4.9
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground capitalize mb-6 border-b pb-4">
                    {product.company?.businessType?.replace('_', ' ') || 'Supplier'}
                  </p>
                  
                  <ul className="space-y-3 mb-6 text-sm">
                    {product.company?.addresses?.[0] && (
                      <li className="flex items-start gap-2 text-muted-foreground font-medium">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary" /> 
                        <span>{product.company.addresses[0].city}, {product.company.addresses[0].state}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2 text-muted-foreground font-medium">
                      <ShieldCheck className="w-4 h-4 mt-0.5 text-green-500" />
                      <span>Trade Assurance Enabled</span>
                    </li>
                    {product.company?.website && (
                      <li className="flex items-center gap-2 text-primary hover:underline font-medium">
                        <Globe className="w-4 h-4" /> <a href={product.company.website} target="_blank" rel="noreferrer">Visit External Website</a>
                      </li>
                    )}
                  </ul>
                  
                  <Button variant="outline" className="w-full hover:bg-muted" asChild>
                    <Link href={`/company/${product.company?.slug}`}>View Company Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Universal Sticky Action Bar (Desktop + Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 flex justify-center animate-in slide-in-from-bottom-full">
        <div className="container max-w-4xl flex gap-4 w-full">
          <Button size="lg" className="flex-1 lg:flex-none lg:w-2/3 shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary transition-all hover:scale-[1.02]" onClick={() => setIsEnquiryModalOpen(true)}>
            <MessageSquare className="w-5 h-5 mr-2" /> Quick Enquiry
          </Button>
          <Button size="lg" variant="outline" className="flex-1 lg:flex-none lg:w-1/3 bg-muted/50 border-primary/20 hover:bg-primary/5" asChild>
            <Link href={`/company/${product.company?.slug}`}>
              View Supplier
            </Link>
          </Button>
        </div>
      </div>

      <EnquiryModal 
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        productId={product.id}
        companyId={product.companyId}
        targetName={product.title}
      />
    </>
  );
}
