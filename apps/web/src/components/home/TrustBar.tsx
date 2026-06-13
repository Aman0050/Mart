import React from "react";

export function TrustBar() {
  return (
    <section className="border-y bg-muted/30 relative overflow-hidden">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          <div className="text-center px-4 group">
            <p className="text-4xl md:text-5xl font-black text-foreground mb-2 group-hover:scale-105 transition-transform duration-300">100k+</p>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Products Listed</p>
          </div>
          <div className="text-center px-4 group">
            <p className="text-4xl md:text-5xl font-black text-foreground mb-2 group-hover:scale-105 transition-transform duration-300">50k+</p>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Verified Suppliers</p>
          </div>
          <div className="text-center px-4 group">
            <p className="text-4xl md:text-5xl font-black text-foreground mb-2 group-hover:scale-105 transition-transform duration-300">190+</p>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Countries Served</p>
          </div>
          <div className="text-center px-4 group">
            <p className="text-4xl md:text-5xl font-black text-foreground mb-2 group-hover:scale-105 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">24/7</p>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Trade Assurance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
