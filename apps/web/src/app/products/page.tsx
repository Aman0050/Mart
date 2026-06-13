"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, Sheet, SheetContent, SheetTrigger, Skeleton } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Filter, PackageOpen, ChevronRight, SlidersHorizontal, LayoutGrid, List as ListIcon, ShieldCheck, MapPin } from 'lucide-react';

function ProductsListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const cat = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const catRes = await apiClient.get('/categories');
        setCategories(catRes.data.data);
      } catch (err) {}
    };
    fetchInit();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = `/products?page=${page}&limit=12`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (cat) url += `&category=${cat}`;
        
        const res = await apiClient.get(url);
        setProducts(res.data.data);
        setMeta(res.data.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [q, cat, page]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page'); 
    router.push(`/products?${params.toString()}`);
  };

  const handlePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
        {(q || cat) && (
          <button onClick={() => router.push('/products')} className="text-xs text-muted-foreground hover:text-primary transition-colors">Clear all</button>
        )}
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3">Search</h4>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilters('q', e.currentTarget.value);
            }}
            placeholder="Search keywords..." 
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          <li>
            <button 
              onClick={() => updateFilters('category', '')} 
              className={`text-sm hover:text-primary transition-colors ${!cat ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button 
                onClick={() => updateFilters('category', c.id)} 
                className={`text-sm hover:text-primary transition-colors text-left w-full truncate ${cat === c.id ? 'text-primary font-bold' : 'text-muted-foreground'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Supplier Type</h4>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
          <ShieldCheck className="w-4 h-4 text-green-500" /> Trade Assurance
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground mt-2 cursor-pointer hover:text-foreground">
          <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
          Verified Supplier
        </label>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
          <span>-</span>
          <input type="number" placeholder="Max" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
        </div>
        <Button variant="outline" size="sm" className="w-full mt-2">Apply</Button>
      </div>
    </div>
  );

  return (
    <div className="bg-muted/10 min-h-screen py-8">
      <div className="container">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Global Marketplace</h1>
            <p className="text-muted-foreground mt-2 text-lg">Discover premium products from verified suppliers.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-10 px-4">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode Toggles */}
            <div className="hidden sm:flex border rounded-lg p-1 bg-background">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={`h-11 w-11 ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={`h-11 w-11 ${viewMode === 'list' ? 'shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24 border shadow-sm">
              <CardContent className="p-6">
                <FilterSidebar />
              </CardContent>
            </Card>
          </div>

          {/* Product Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              // Skeletons based on viewMode
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className={`overflow-hidden ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}>
                    <Skeleton className={`${viewMode === 'list' ? 'w-48 h-full rounded-none' : 'w-full aspect-[4/3] rounded-none'}`} />
                    <CardContent className="p-5 flex-1 space-y-3">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <div className="pt-4 mt-auto space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-2xl bg-background/50">
                <PackageOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">No products found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <Button onClick={() => router.push('/products')} variant="outline">Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Showing {products.length} of {meta.total} products</span>
                  <span className="hidden sm:inline">Sort by: <span className="font-semibold text-foreground cursor-pointer">Relevance</span></span>
                </div>
                
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`} className="group h-full">
                      <Card className={`h-full overflow-hidden border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}>
                        <div className={`bg-white relative overflow-hidden flex items-center justify-center shrink-0 ${viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-auto border-b sm:border-b-0 sm:border-r' : 'aspect-[4/3] border-b w-full'}`}>
                          {product.images?.[0] ? (
                            <Image 
                              src={product.images[0].imageUrl} 
                              alt={product.title} 
                              fill
                              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out" 
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <PackageOpen className="w-12 h-12 text-muted-foreground opacity-20" />
                          )}
                          
                          {/* Quick Action Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <Button variant="secondary" size="sm" className="pointer-events-none">View Details</Button>
                          </div>
                        </div>
                        
                        <CardContent className={`p-5 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded">{product.category?.name || 'Uncategorized'}</span>
                            </div>
                            <h3 className={`font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors ${viewMode === 'list' ? 'text-xl' : 'text-base'}`}>
                              {product.title}
                            </h3>
                            {viewMode === 'list' && product.shortDescription && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.shortDescription}</p>
                            )}
                          </div>
                          
                          <div className={`mt-auto ${viewMode === 'list' ? 'flex items-end justify-between' : ''}`}>
                            <div>
                              <p className="text-2xl font-black text-foreground">
                                {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Ask for Price'}
                              </p>
                              {product.minimumOrderQuantity && (
                                <p className="text-xs font-medium text-muted-foreground mt-1">Min. Order: {product.minimumOrderQuantity} Pieces</p>
                              )}
                            </div>
                            
                            <div className={`pt-4 border-t flex flex-col gap-1.5 text-xs text-muted-foreground ${viewMode === 'list' ? 'border-t-0 pt-0 text-right' : 'mt-4'}`}>
                              <span className={`flex items-center font-medium ${viewMode === 'list' ? 'justify-end' : ''}`}>
                                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-500" />
                                {product.company?.companyName}
                              </span>
                              {product.company?.addresses?.[0] && (
                                <span className={`flex items-center ${viewMode === 'list' ? 'justify-end' : ''}`}>
                                  <MapPin className="w-3.5 h-3.5 mr-1" />
                                  {product.company.addresses[0].city}, {product.company.addresses[0].state}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button variant="outline" disabled={meta.page <= 1} onClick={() => handlePage(meta.page - 1)}>
                      Previous
                    </Button>
                    <div className="text-sm font-medium px-4 bg-background border rounded-md h-10 flex items-center">
                      Page {meta.page} of {meta.totalPages}
                    </div>
                    <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => handlePage(meta.page + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductsListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Skeleton className="w-12 h-12 rounded-full" /></div>}>
      <ProductsListingContent />
    </Suspense>
  );
}
