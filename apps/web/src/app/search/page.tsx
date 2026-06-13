"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, Skeleton } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Search, Loader2, Filter, PackageOpen, Building2, FolderTree, ChevronRight } from 'lucide-react';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'products'; // products, suppliers, categories
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [globalData, setGlobalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (type === 'global') {
          const res = await apiClient.get(`/search?q=${encodeURIComponent(q)}`);
          setGlobalData(res.data.data);
        } else {
          const res = await apiClient.get(`/search/${type}?q=${encodeURIComponent(q)}&page=${page}`);
          setResults(res.data.data.data || res.data.data); // depending on backend structure
          setMeta(res.data.data.meta);
        }
      } catch (err) {
        console.error("Search Error", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q, type, page]);

  const changeType = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', newType);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const renderProductCard = (product: any) => (
    <Link key={product.id} href={`/product/${product.slug}`} className="group h-full flex flex-col">
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-lg border-muted">
        <div className="aspect-[4/3] bg-white relative overflow-hidden flex items-center justify-center border-b">
          {product.images?.[0] ? (
            <img src={product.images[0].imageUrl} alt={product.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <PackageOpen className="w-12 h-12 text-muted-foreground opacity-20" />
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.title}</h3>
          <div className="mt-auto">
            <p className="text-lg font-bold text-foreground">
              {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Ask for Price'}
            </p>
            <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate pr-2 font-medium">{product.company?.companyName}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderSupplierCard = (supplier: any) => (
    <Link key={supplier.id} href={`/company/${supplier.slug}`} className="group h-full flex flex-col">
      <Card className="h-full flex flex-row overflow-hidden transition-shadow hover:shadow-md border-muted p-4 gap-4 items-center">
        <div className="w-20 h-20 rounded-lg border bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {supplier.logoUrl ? (
            <img src={supplier.logoUrl} alt={supplier.companyName} className="w-full h-full object-contain p-2" />
          ) : (
            <Building2 className="w-8 h-8 text-muted-foreground opacity-50" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{supplier.companyName}</h3>
          <p className="text-sm text-muted-foreground capitalize">{supplier.businessType || 'Supplier'}</p>
          {supplier.addresses?.[0] && (
            <p className="text-xs text-muted-foreground mt-1">{supplier.addresses[0].city}, {supplier.addresses[0].state}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-muted/10 py-8">
      <div className="container">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Search Results for "{q}"</h1>
        </div>

        <div className="flex gap-4 mb-8 border-b pb-4 overflow-x-auto">
          <Button variant={type === 'products' ? 'default' : 'outline'} onClick={() => changeType('products')}>
            <PackageOpen className="w-4 h-4 mr-2" /> Products
          </Button>
          <Button variant={type === 'suppliers' ? 'default' : 'outline'} onClick={() => changeType('suppliers')}>
            <Building2 className="w-4 h-4 mr-2" /> Suppliers
          </Button>
          <Button variant={type === 'categories' ? 'default' : 'outline'} onClick={() => changeType('categories')}>
            <FolderTree className="w-4 h-4 mr-2" /> Categories
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-6">
                <h3 className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
                <p className="text-sm text-muted-foreground">More advanced filters coming soon to refine your search.</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-full flex flex-col overflow-hidden border-muted">
                    <Skeleton className="w-full aspect-[4/3] rounded-none" />
                    <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="mt-auto space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed rounded-xl bg-background">
                <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">No {type} found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">We couldn't find any exact matches for "{q}".</p>
              </div>
            ) : (
              <>
                {meta && (
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    Found {meta.total} results
                  </p>
                )}

                {type === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {results.map(renderProductCard)}
                  </div>
                )}

                {type === 'suppliers' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {results.map(renderSupplierCard)}
                  </div>
                )}

                {/* Categories view */}
                {type === 'categories' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {results.map(cat => (
                      <Link key={cat.id} href={`/products?category=${cat.id}`} className="p-4 border rounded-xl hover:border-primary hover:shadow-md transition-all bg-background text-center">
                        <FolderTree className="w-8 h-8 mx-auto text-primary/50 mb-2" />
                        <h4 className="font-medium text-sm">{cat.name}</h4>
                      </Link>
                    ))}
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
