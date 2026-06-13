import React from "react";
import Link from "next/link";
import { Button } from "@nexmarto/ui";
import { FileText, ShieldCheck, Clock, ArrowRight } from "lucide-react";

export function RfqSection() {
  return (
    <section className="py-24 bg-muted/50 border-y">
      <div className="container">
        <div className="bg-card border rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          
          {/* Left Side: Content */}
          <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
            <Badge className="w-fit mb-6 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">
              Request For Quotation
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              One Request, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Multiple Quotes.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find exactly what you're looking for? Submit an RFQ and let verified suppliers come to you with customized proposals.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="font-medium">Get responses within 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-medium">Connect with strictly verified suppliers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium">Compare quotes and negotiate easily</span>
              </div>
            </div>

            <Button size="lg" className="w-fit h-14 px-8 text-base shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform" asChild>
              <Link href="/rfq">Submit RFQ Now <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </div>

          {/* Right Side: Visual */}
          <div className="lg:w-1/2 bg-primary relative overflow-hidden flex items-center justify-center min-h-[400px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 w-full max-w-md bg-background/95 backdrop-blur shadow-2xl rounded-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-primary/20 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-24 w-full bg-muted rounded animate-pulse"></div>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="h-10 w-32 bg-primary rounded animate-pulse"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Ensure Badge is imported correctly at the top, adding it here for standalone usage if needed
import { Badge } from "@nexmarto/ui";
