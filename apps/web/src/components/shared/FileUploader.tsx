"use client";

import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { compressImage } from '@/lib/utils/image-optimization';
import { apiClient } from '@/lib/api/client';
import { Button } from '@nexmarto/ui';

interface FileUploaderProps {
  onUploadSuccess: (fileUrl: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
}

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

export function FileUploader({ 
  onUploadSuccess, 
  folder = 'misc', 
  accept = "image/*,application/pdf", 
  maxSizeMB = 25 
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`File exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    await processAndUpload(selectedFile);
  };

  const processAndUpload = async (fileToUpload: File, retryCount = 0) => {
    try {
      setStatus('compressing');
      // Phase 1: Optimization
      const processedFile = await compressImage(fileToUpload);
      
      setStatus('uploading');
      setProgress(0);

      // 1. Get Pre-signed URL from our backend
      const res = await apiClient.post('/upload/presigned-url', {
        fileName: processedFile.name,
        fileType: processedFile.type,
        folder,
      });
      
      const { presignedUrl, fileUrl } = res.data.data;

      // 2. Upload directly to S3 via PUT (Phase 3: Progress & Retry Logic)
      await uploadToS3(presignedUrl, processedFile, fileUrl);
      
    } catch (error: any) {
      console.error("Upload process failed:", error);
      if (retryCount < 2) {
        // Exponential backoff
        setTimeout(() => processAndUpload(fileToUpload, retryCount + 1), Math.pow(2, retryCount) * 1000);
      } else {
        setStatus('error');
        setErrorMsg('Upload failed after multiple attempts. Network disconnected.');
      }
    }
  };

  const uploadToS3 = async (url: string, file: File, finalUrl: string) => {
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      },
    });

    setStatus('success');
    setProgress(100);
    onUploadSuccess(finalUrl);
  };

  const retryUpload = () => {
    if (file) {
      processAndUpload(file, 0);
    }
  };

  return (
    <div className="w-full border-2 border-dashed rounded-xl p-6 transition-all hover:bg-muted/30 border-muted-foreground/30 relative">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
      />

      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold mb-1">Click or drag file to upload</h3>
          <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to {maxSizeMB}MB</p>
        </div>
      )}

      {(status === 'compressing' || status === 'uploading') && (
        <div className="flex flex-col w-full py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[200px]">{file?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {status === 'compressing' ? 'Optimizing image...' : `Uploading... ${progress}%`}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: \`\${progress}%\` }} 
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center justify-between py-2 border rounded-lg px-4 bg-green-50/50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 truncate max-w-[200px]">{file?.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setFile(null); setStatus('idle'); }} className="text-green-800 hover:text-green-900 hover:bg-green-100">
            Upload Another
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-between py-2 border rounded-lg px-4 bg-red-50/50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-red-800 truncate max-w-[200px]">{file?.name}</span>
              <span className="text-xs text-red-600">{errorMsg}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={retryUpload} className="text-red-800 hover:text-red-900 hover:bg-red-100">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      )}
    </div>
  );
}
