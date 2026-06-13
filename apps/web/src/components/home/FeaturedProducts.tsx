import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Badge } from "@nexmarto/ui";
import { Star, ShieldCheck, ArrowRight } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: 'Industrial CNC Lathe Machine', price: '$12,500.00', moq: '1 Unit', supplier: 'TechCorp Heavy Industries', rating: 4.9, image: 'https://picsum.photos/seed/cnc/800/600' },
  { id: 2, name: 'Wholesale Organic Cotton Rolls', price: '$4.50 / kg', moq: '500 kg', supplier: 'Global Textiles Ltd', rating: 4.8, image: 'https://picsum.photos/seed/cotton/800/600' },
  { id: 3, name: 'Commercial Solar Panel Kits 500W', price: '$85.00', moq: '50 Units', supplier: 'EcoEnergy Solutions', rating: 5.0, image: 'https://picsum.photos/seed/solar/800/600' },
  { id: 4, name: 'Automotive Injection Molds', price: '$3,200.00', moq: '2 Units', supplier: 'Precision Plastics', rating: 4.7, image: 'https://picsum.photos/seed/mold/800/600' },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Trending Wholesale Products</h2>
            <p className="text-muted-foreground text-lg">High-margin products requested by top buyers</p>
          </div>
          <Button variant="outline" className="group" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <Link 
              key={product.id} 
              href={`/product/product-${product.id}`} 
              className="group flex flex-col bg-card rounded-2xl border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 hover:border-primary/20 transition-all duration-300"
            >
              <div className="relative h-56 w-full bg-muted overflow-hidden">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <Badge className="absolute top-3 right-3 bg-white/90 text-yellow-600 hover:bg-white backdrop-blur-md shadow-sm gap-1 border-0">
                  <Star className="w-3 h-3 fill-current" /> {product.rating}
                </Badge>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug text-foreground">
                  {product.name}
                </h3>
                <div className="mt-auto">
                  <p className="text-2xl font-black text-foreground">{product.price}</p>
                  <p className="text-sm font-medium text-muted-foreground mb-4">MOQ: {product.moq}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                    <span className="truncate flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" /> 
                      {product.supplier}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
