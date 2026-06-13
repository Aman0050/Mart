"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Label } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, UploadCloud, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CompanyGalleryPage() {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get('/companies/my-company');
      setCompany(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setErrorMsg(null);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        // 1. Get presigned URL
        const { data } = await apiClient.post('/upload/presigned-url', {
          fileName: file.name,
          fileType: file.type,
          folder: `companies/${company.id}/gallery`
        });

        // 2. Upload file directly to S3
        await fetch(data.data.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // 3. Save to database
        await apiClient.post(`/companies/${company.id}/gallery`, {
          imageUrl: data.data.fileUrl,
        });
      }
      
      // Refresh gallery
      await fetchCompany();
    } catch (err) {
      console.error("Failed to upload image", err);
      setErrorMsg("Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await apiClient.delete(`/gallery/${imageId}`);
      fetchCompany();
    } catch (err) {
      setErrorMsg("Failed to delete image.");
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/company" className="p-2 bg-background border rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Gallery</h1>
          <p className="text-muted-foreground mt-1">Upload photos of your office, factory, or team to build trust with buyers.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
              <CardDescription>Supported formats: JPG, PNG, WEBP (Max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`border-2 border-dashed border-input rounded-xl p-8 text-center transition-colors ${isUploading ? 'bg-muted/50' : 'bg-muted/20 hover:bg-muted/50'}`}>
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                )}
                <p className="text-sm font-medium mb-4">
                  {isUploading ? 'Uploading...' : 'Click or drag images'}
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  id="galleryUpload"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <Label 
                  htmlFor="galleryUpload" 
                  className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${isUploading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >
                  Select Files
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full min-h-[400px]">
            <CardHeader>
              <CardTitle>Your Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              {company?.gallery?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">No photos yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">Upload images of your manufacturing unit or office space to show buyers your capabilities.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {company?.gallery?.map((img: any) => (
                    <div key={img.id} className="group relative aspect-square rounded-lg border overflow-hidden bg-muted">
                      <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => deleteImage(img.id)}
                          className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
