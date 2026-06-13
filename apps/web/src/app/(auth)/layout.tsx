import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Form content */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 sm:p-12 md:p-16 xl:p-24 justify-center">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl leading-none">N</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">Nexmarto</span>
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right side: Branding/Image (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-muted relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background/0 to-background/0" />
        
        <div className="relative z-20 max-w-lg p-12 text-center text-foreground">
          <div className="mb-8 p-6 bg-background/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl mx-auto w-3/4 aspect-[4/3] flex items-center justify-center overflow-hidden group">
             {/* Abstract Dashboard Mockup */}
             <div className="w-full h-full relative space-y-4 p-4 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-full h-8 bg-muted rounded-md animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-1/3 h-24 bg-muted rounded-md animate-pulse delay-75" />
                  <div className="w-1/3 h-24 bg-muted rounded-md animate-pulse delay-100" />
                  <div className="w-1/3 h-24 bg-muted rounded-md animate-pulse delay-150" />
                </div>
                <div className="w-full h-32 bg-muted rounded-md animate-pulse delay-200" />
             </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-balance">
            The premium B2B marketplace for modern enterprises.
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Connect, negotiate, and scale your business with the most advanced tools designed for buyers and sellers.
          </p>
        </div>
      </div>
    </div>
  );
}
