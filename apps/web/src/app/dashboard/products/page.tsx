"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Skeleton } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, Eye, PackageOpen, Loader2 } from 'lucide-react';

export default function ProductsDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const compRes = await apiClient.get('/companies/my-company');
      setCompany(compRes.data.data);
      
      const prodRes = await apiClient.get(`/products/company/${compRes.data.data.id}`);
      setProducts(prodRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}/${company.id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-10 w-64 mb-2" /><Skeleton className="h-5 w-96" /></div>
          <Skeleton className="h-11 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Card>
          <div className="p-4 border-b bg-muted/20 flex justify-between"><Skeleton className="h-9 w-72" /><Skeleton className="h-9 w-24" /></div>
          <div className="p-6 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-muted/20">
        <PackageOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Create a Company First</h2>
        <p className="text-muted-foreground mb-6">You must set up your supplier profile before adding products.</p>
        <Button asChild><Link href="/company/create">Setup Company Profile</Link></Button>
      </div>
    );
  }

  const activeCount = products.filter(p => p.status === 'active').length;
  const draftCount = products.filter(p => p.status === 'draft').length;
  const pendingCount = products.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory, pricing, and product SEO.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/create"><Plus className="w-4 h-4 mr-2" /> Add Product</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{products.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active (Published)</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-yellow-600">{pendingCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-muted-foreground">{draftCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 flex items-center justify-between border-b bg-muted/20">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search products..." className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <PackageOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">Start building your catalog by adding your first product to Nexmarto.</p>
                    <Button asChild>
                      <Link href="/dashboard/products/create"><Plus className="w-4 h-4 mr-2" /> Add Product</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0].imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>
                    {product.price ? `₹${product.price}` : 'TBD'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${product.status === 'active' ? 'bg-green-100 text-green-700' : 
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/product/${product.slug}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/products/${product.id}/edit`}><Edit2 className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
