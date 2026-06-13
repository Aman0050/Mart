import React from "react";
import Link from "next/link";
import { ShieldCheck, Factory, Globe2, ArrowRight } from "lucide-react";

const SUPPLIERS = [
  { id: 1, name: 'TechCorp Heavy Industries', category: 'Industrial Machinery', location: 'Germany', verified: true, logo: 'TH' },
  { id: 2, name: 'Global Textiles Ltd', category: 'Apparel & Fashion', location: 'India', verified: true, logo: 'GT' },
  { id: 3, name: 'EcoEnergy Solutions', category: 'Electronics', location: 'USA', verified: true, logo: 'EE' },
  { id: 4, name: 'Precision Plastics', category: 'Packaging', location: 'Taiwan', verified: true, logo: 'PP' },
];

export function VerifiedSuppliers() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Partner with Industry Leaders</h2>
          <p className="text-muted-foreground text-lg">
            Our platform rigorously vets every enterprise manufacturer. Source with confidence, backed by our Trade Assurance guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUPPLIERS.map((supplier) => (
            <Link 
              key={supplier.id} 
              href={`/company/supplier-${supplier.id}`} 
              className="group bg-card rounded-2xl border p-6 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black border border-primary/20 shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {supplier.logo}
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {supplier.name}
                  </h3>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </div>
                </div>
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Factory className="w-4 h-4 text-primary/70" /> {supplier.category}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Globe2 className="w-4 h-4 text-primary/70" /> Based in {supplier.location}
                </div>
              </div>
              
              <div className="border-t mt-5 pt-4 flex items-center justify-between text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View Profile <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
