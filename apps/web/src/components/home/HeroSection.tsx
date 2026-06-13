import React from "react";
import Link from "next/link";
import { Button } from "@nexmarto/ui";
import { ArrowRight, Zap } from "lucide-react";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary via-background to-transparent blur-3xl animate-pulse duration-1000" />
      </div>

      <div className="container text-center relative z-10">
        {/* Animated Badge */}
        <div className="inline-flex animate-in fade-in slide-in-from-bottom-4 duration-700 items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 ring-1 ring-primary/20 backdrop-blur-md">
          <Zap className="w-4 h-4 text-primary" />
          <span>India's Premium B2B Sourcing Platform</span>
        </div>
        
        {/* Headline */}
        <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[1.1]">
          Source globally.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
            Scale locally.
          </span>
        </h1>
        
        {/* Subheadline */}
        <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium">
          Connect with over 50,000 verified manufacturers and wholesalers. 
          Secure wholesale pricing on millions of premium products worldwide.
        </p>
        
        {/* Search Input Area */}
        <div className="max-w-3xl mx-auto mb-14 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative shadow-2xl rounded-2xl bg-background/80 backdrop-blur-xl ring-1 ring-border/50">
            <GlobalSearchBar />
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:-translate-y-1" asChild>
            <Link href="/products">Browse Catalog <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-muted" asChild>
            <Link href="/register">Become a Supplier</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
