"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification link.');
      return;
    }

    const verify = async () => {
      try {
        await apiClient.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Your email has been successfully verified.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error?.message || 'Verification failed. The link might be expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="mb-6 flex justify-center">
        {status === 'loading' && (
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        )}
        {status === 'success' && (
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        )}
        {status === 'error' && (
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-4">
        {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
      </h1>
      
      <p className="text-muted-foreground mb-8">
        {message}
      </p>

      {status !== 'loading' && (
        <Button asChild className="w-full">
          <Link href="/login">Continue to Log in</Link>
        </Button>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-xl" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
