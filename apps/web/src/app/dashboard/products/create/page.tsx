"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardFooter, Progress } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  sku: z.string().optional(),
  shortDescription: z.string().max(200, "Short description must be under 200 chars").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(0).optional(),
  minimumOrderQuantity: z.coerce.number().min(1).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

import { useFeedbackTrigger } from '@/hooks/useFeedbackTrigger';

export default function CreateProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const { showFeedbackIfEligible } = useFeedbackTrigger();

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    // Fetch categories flat list for simplicity in dropdown, ideally we use tree
    const fetchCats = async () => {
      const res = await apiClient.get('/categories');
      setCategories(res.data.data);
    };
    fetchCats();
  }, []);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof ProductForm)[] = [];
    if (step === 1) fieldsToValidate = ['title', 'sku', 'categoryId'];
    if (step === 2) fieldsToValidate = ['shortDescription', 'description'];
    if (step === 3) fieldsToValidate = ['price', 'minimumOrderQuantity'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      // Create product core details
      const res = await apiClient.post('/products', data);
      setCreatedProductId(res.data.data.id);
      setIsSuccess(true);
      toast.success('Product created successfully!');
      
      // Attempt Feedback Trigger
      showFeedbackIfEligible(
        'PRODUCTS_UPLOADED',
        ['How easy was the product upload process?', 'What features are we missing?'],
        'seller'
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error?.message || 'Failed to create product. Please try again.');
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
        <h1 className="text-3xl font-bold tracking-tight mb-4">Product Created Successfully!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your product has been saved as a draft. You can now add images, specifications, and publish it.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Go to Catalog</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/products/${createdProductId}/edit`}>Add Images & Specs <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="p-2 bg-background border rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-1">List your product in the global B2B marketplace.</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Basic Info</span>
          <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Description</span>
          <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>Pricing & MOQ</span>
          <span className={step >= 4 ? "text-primary" : "text-muted-foreground"}>SEO Settings</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6 space-y-6">
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Name *</Label>
                  <Input id="title" placeholder="e.g., Stainless Steel Water Pump" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Model Number</Label>
                  <Input id="sku" placeholder="SS-WP-100" {...register('sku')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <select 
                    id="categoryId" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('categoryId')}
                  >
                    <option value="">Select a category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Summary</Label>
                  <Input id="shortDescription" placeholder="A brief one-sentence pitch for this product" {...register('shortDescription')} />
                  {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <textarea 
                    id="description" 
                    rows={8}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Provide full technical details, features, and applications..."
                    {...register('description')}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Pricing & MOQ */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Unit Price (₹)</Label>
                    <Input id="price" type="number" step="0.01" placeholder="999.00" {...register('price')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderQuantity">Minimum Order Quantity (MOQ)</Label>
                    <Input id="minimumOrderQuantity" type="number" placeholder="10" {...register('minimumOrderQuantity')} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: SEO Settings */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-muted/30 p-4 rounded-xl border mb-4">
                  <p className="text-sm font-medium mb-1">Search Engine Preview</p>
                  <p className="text-xl text-blue-600 hover:underline cursor-pointer truncate">
                    {watch('seoTitle') || watch('title') || 'Product Title'} | Nexmarto
                  </p>
                  <p className="text-sm text-green-700 truncate">https://nexmarto.com/product/your-product-slug</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {watch('seoDescription') || watch('shortDescription') || 'Product description preview on Google...'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Meta Title</Label>
                  <Input id="seoTitle" placeholder="Optimized title for Google" {...register('seoTitle')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Meta Description</Label>
                  <textarea 
                    id="seoDescription" 
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Optimized description for search engines..."
                    {...register('seoDescription')}
                  />
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
            
            {step < 4 ? (
              <Button type="button" onClick={handleNextStep}>
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                Save Draft & Continue <CheckCircle2 className="ml-2 w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
