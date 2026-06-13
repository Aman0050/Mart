import React from 'react';
import { Skeleton } from "@nexmarto/ui";
import { ChevronRight } from "lucide-react";

export default function ProductLoading() {
  return (
    <div className="bg-muted/10 min-h-screen pb-32 lg:pb-24 pt-8">
      <div className="container">
        
        {/* Breadcrumbs Skeleton */}
        <nav className="flex items-center text-sm mb-6">
          <Skeleton className="h-4 w-4 rounded-full" />
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground opacity-30" />
          <Skeleton className="h-4 w-16" />
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground opacity-30" />
          <Skeleton className="h-4 w-24" />
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground opacity-30" />
          <Skeleton className="h-4 w-48" />
        </nav>

        <div className="bg-background rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Gallery Skeleton */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <Skeleton className="aspect-[4/3] rounded-xl w-full" />
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="aspect-square rounded-lg w-full" />)}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-5/6 mb-6" />
              
              <div className="bg-muted/30 border rounded-xl p-6 mb-8 h-40 flex flex-col justify-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-32 mt-2" />
              </div>

              <div className="hidden lg:flex gap-4 mt-auto">
                <Skeleton className="h-14 flex-1 rounded-md" />
                <Skeleton className="h-14 flex-1 rounded-md" />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
             <Skeleton className="h-12 w-full rounded-md" />
             <Skeleton className="h-64 w-full rounded-2xl" />
           </div>
           <div className="lg:col-span-1">
             <Skeleton className="h-96 w-full rounded-2xl" />
           </div>
        </div>

      </div>
    </div>
  );
}
