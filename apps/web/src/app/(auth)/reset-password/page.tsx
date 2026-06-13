"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label } from '@nexmarto/ui';
import { apiClient } from '../../../lib/api/client';
import { Lock, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setErrorMsg("Invalid or missing reset token.");
      return;
    }

    try {
      setErrorMsg(null);
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password
      });
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || "Failed to reset password. The token might be expired.");
    }
  };

  if (isSuccess) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Password Reset!</h1>
        <p className="text-muted-foreground mb-8">
          Your password has been changed successfully. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Set new password</h1>
        <p className="text-muted-foreground">
          Must be at least 8 characters.
        </p>
      </div>

      {!token && (
        <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          Missing reset token. Please check your email link again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMsg && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={!!errors.password}
                {...register('password')}
                disabled={!token}
              />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
                disabled={!token}
              />
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!token}>
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-xl" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
