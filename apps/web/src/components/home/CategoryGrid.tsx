import React from "react";
import Link from "next/link";
import { Button } from "@nexmarto/ui";
import { Factory, Zap, CheckCircle2, Package, ShieldCheck, TrendingUp, Globe2, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: 'Industrial Machinery', icon: Factory, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Electronics & IT', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { name: 'Apparel & Fashion', icon: CheckCircle2, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { name: 'Packaging Solutions', icon: Package, color: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'Health & Medical', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10' },
  { name: 'Automotive Parts', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Agriculture', icon: Globe2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Construction', icon: Factory, color: 'text-orange-500', bg: 'bg-orange-500/10' }
];

export function CategoryGrid() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Explore Categories</h2>
            <p className="text-muted-foreground text-lg">Source from our most popular industrial sectors</p>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link href="/products">
              View All Categories 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link 
              key={i} 
              href={`/products?category=${cat.name.toLowerCase()}`} 
              className="group relative overflow-hidden p-6 rounded-2xl border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
            >
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <cat.icon className={`w-32 h-32 ${cat.color}`} />
              </div>
              <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 shadow-sm`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{cat.name}</h3>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center mt-auto">
                Source now <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
