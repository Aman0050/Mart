"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@nexmarto/ui';
import { Input } from '@nexmarto/ui';
import { Label } from '@nexmarto/ui';
import { apiClient } from '../../../lib/api/client';
import { useAuthStore } from '../../../store/auth.store';
import { User, Mail, Lock, ArrowRight, Building2, ShoppingBag } from 'lucide-react';
import { cn } from '@nexmarto/ui';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  identifier: z.string().min(3, "Please enter a valid email or phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['buyer', 'seller']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setErrorMsg(null);
      // Map identifier to either email or phone for backend
      const isEmail = data.identifier.includes('@');
      const payload = {
        fullName: data.fullName,
        phone: !isEmail ? data.identifier : '0000000000', // Backend expects phone currently
        email: isEmail ? data.identifier : undefined,
        password: data.password,
        role: data.role,
      };

      const res = await apiClient.post('/auth/register', payload);
      
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.accessToken);
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
        <p className="text-muted-foreground">
          Join Nexmarto to connect with verified businesses.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMsg && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setValue('role', 'buyer')}
            className={cn(
              "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
              selectedRole === 'buyer' 
                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <ShoppingBag className={cn("w-8 h-8 mb-2", selectedRole === 'buyer' ? "text-primary" : "text-muted-foreground")} />
            <span className="font-semibold">I'm a Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => setValue('role', 'seller')}
            className={cn(
              "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
              selectedRole === 'seller' 
                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <Building2 className={cn("w-8 h-8 mb-2", selectedRole === 'seller' ? "text-primary" : "text-muted-foreground")} />
            <span className="font-semibold">I'm a Seller</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="Rahul Sharma"
                className="pl-10"
                error={!!errors.fullName}
                {...register('fullName')}
              />
            </div>
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="identifier">Email or Phone</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="identifier"
                placeholder="name@company.com or 9876543210"
                className="pl-10"
                error={!!errors.identifier}
                {...register('identifier')}
              />
            </div>
            {errors.identifier && <p className="text-sm text-destructive">{errors.identifier.message}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={!!errors.password}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full group" isLoading={isSubmitting}>
          Create account
          <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
