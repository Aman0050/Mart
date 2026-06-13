import React from 'react';
import { Skeleton } from "@nexmarto/ui";

export default function CompanyLoading() {
  return (
    <div className="bg-muted/10 min-h-screen pb-32 pt-0">
      
      {/* Cover Image Skeleton */}
      <Skeleton className="w-full h-64 md:h-80 lg:h-96 rounded-none relative z-0" />

      <div className="container relative z-10 -mt-24 md:-mt-32">
        <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
          
          <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8 border-b pb-8">
            {/* Logo Skeleton */}
            <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-2xl border-4 border-background shadow-sm shrink-0" />
            
            {/* Basic Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4 mt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 md:w-64">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
