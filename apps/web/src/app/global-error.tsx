"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import * as Sentry from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background flex items-center justify-center p-4`}>
        <div className="bg-card border shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Critical System Error</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            A fatal error occurred. The application could not recover. Our engineering team has been notified.
          </p>
          <button 
            onClick={() => reset()} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
