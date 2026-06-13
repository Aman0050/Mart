"use client";

import { useEffect } from "react";
import { Button } from "@nexmarto/ui";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center">Something went wrong!</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        We encountered an unexpected error while processing your request. Our team has been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg">
          <RefreshCw className="w-4 h-4 mr-2" /> Try again
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Return to Home
          </Link>
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-muted rounded-md text-left w-full max-w-2xl overflow-auto text-sm text-muted-foreground border">
          <p className="font-bold mb-2">Error Details (Development Only):</p>
          <pre>{error.message}</pre>
        </div>
      )}
    </div>
  );
}
