"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardFooter, Tabs, TabsList, TabsTrigger, TabsContent } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, Save, UploadCloud, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

const productSchema = z.object({
  title: z.string().min(3),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.coerce.number().optional(),
  minimumOrderQuantity: z.coerce.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(['draft', 'pending', 'active', 'archived']).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

function EditProductContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'info';
  const productId = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [productId]);

  const fetchInitialData = async () => {
    try {
      const [compRes, catRes] = await Promise.all([
        apiClient.get('/companies/my-company'),
        apiClient.get('/categories')
      ]);
      setCompany(compRes.data.data);
      setCategories(catRes.data.data);
      
      const prodRes = await apiClient.get(`/products/company/${compRes.data.data.id}`);
      // find our product
      const targetProd = prodRes.data.data.find((p: any) => p.id === productId);
      if (targetProd) {
        // Need to fetch full product details to get specs (the list might not have specs)
        const fullProdRes = await apiClient.get(`/products/${targetProd.slug}`);
        setProduct(fullProdRes.data.data);
        reset({
          title: fullProdRes.data.data.title,
          sku: fullProdRes.data.data.sku,
          shortDescription: fullProdRes.data.data.shortDescription,
          description: fullProdRes.data.data.description,
          categoryId: fullProdRes.data.data.categoryId || '',
          price: fullProdRes.data.data.price,
          minimumOrderQuantity: fullProdRes.data.data.minimumOrderQuantity,
          seoTitle: fullProdRes.data.data.seoTitle,
          seoDescription: fullProdRes.data.data.seoDescription,
          status: fullProdRes.data.data.status,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitInfo = async (data: ProductForm) => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      await apiClient.patch(`/products/${productId}/${company.id}`, data);
      setSaveMessage({ type: 'success', text: 'Product updated successfully.' });
      fetchInitialData();
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to update product.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const { data } = await apiClient.post('/upload/presigned-url', {
          fileName: file.name,
          fileType: file.type,
          folder: `products/${productId}`
        });

        await fetch(data.data.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        await apiClient.post(`/products/${productId}/images/${company.id}`, {
          imageUrl: data.data.fileUrl,
        });
      }
      fetchInitialData();
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await apiClient.delete(`/images/${imageId}/${company.id}`);
      fetchInitialData();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const addSpec = async () => {
    if (!specName || !specValue) return;
    try {
      await apiClient.post(`/products/${productId}/specifications/${company.id}`, {
        specName,
        specValue
      });
      setSpecName('');
      setSpecValue('');
      fetchInitialData();
    } catch (err) {
      console.error("Spec add error", err);
    }
  };

  const deleteSpec = async (specId: string) => {
    try {
      await apiClient.delete(`/specifications/${specId}/${company.id}`);
      fetchInitialData();
    } catch (err) {
      console.error("Spec delete error", err);
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/products" className="p-2 bg-background border rounded-md hover:bg-accent text-muted-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <p className="text-muted-foreground mt-1">Status: <span className="capitalize font-medium">{product.status}</span></p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/product/${product.slug}`} target="_blank">Preview Product</Link>
        </Button>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 text-sm rounded-md border ${
          saveMessage.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitInfo)}>
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="info">General Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="pending">Submit for Review</option>
                <option value="archived">Archive</option>
              </select>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Details
              </Button>
            </div>
          </div>

          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input {...register('title')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register('categoryId')}
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input {...register('sku')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" step="0.01" {...register('price')} />
                  </div>
                  <div className="space-y-2">
                    <Label>MOQ</Label>
                    <Input type="number" {...register('minimumOrderQuantity')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Input {...register('shortDescription')} />
                </div>

                <div className="space-y-2">
                  <Label>Long Description</Label>
                  <textarea 
                    rows={8}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('description')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <p className="text-sm font-medium mb-1">Google Preview</p>
                  <p className="text-xl text-blue-600 hover:underline cursor-pointer truncate">
                    {watch('seoTitle') || watch('title')} | Nexmarto
                  </p>
                  <p className="text-sm text-green-700 truncate">https://nexmarto.com/product/{product.slug}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {watch('seoDescription') || watch('shortDescription') || watch('description')?.substring(0, 160)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input {...register('seoTitle')} placeholder="Optimize for keywords..." />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <textarea 
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('seoDescription')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* These TabsContent are outside the form because they trigger their own API calls */}
      <Tabs defaultValue={defaultTab} className="w-full -mt-6">
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${isUploading ? 'bg-muted/50 border-input' : 'bg-muted/20 border-input hover:bg-muted/50'} min-h-[160px]`}>
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  )}
                  <input type="file" multiple accept="image/*" className="hidden" id="prodImg" onChange={handleImageUpload} disabled={isUploading} />
                  <Label htmlFor="prodImg" className={`cursor-pointer text-sm font-medium ${isUploading ? 'text-muted-foreground' : 'text-primary hover:underline'}`}>
                    {isUploading ? 'Uploading...' : 'Click to Upload'}
                  </Label>
                </div>
                
                {product.images?.map((img: any) => (
                  <div key={img.id} className="relative aspect-square rounded-xl border overflow-hidden bg-muted group">
                    <img src={img.imageUrl} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => deleteImage(img.id)} className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {product.specifications?.map((spec: any) => (
                  <div key={spec.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{spec.specName}</p>
                      <p className="text-sm font-semibold">{spec.specValue}</p>
                    </div>
                    <button type="button" onClick={() => deleteSpec(spec.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-4">Add Specification</h4>
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Property Name</Label>
                    <Input placeholder="e.g., Material, Voltage, Warranty" value={specName} onChange={e => setSpecName(e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Value</Label>
                    <Input placeholder="e.g., Stainless Steel, 220V, 1 Year" value={specValue} onChange={e => setSpecValue(e.target.value)} />
                  </div>
                  <Button type="button" onClick={addSpec} disabled={!specName || !specValue}>
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <EditProductContent />
    </Suspense>
  );
}
