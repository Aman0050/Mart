import React from "react";
import Link from "next/link";
import { Button, Input } from "@nexmarto/ui";
import { Globe2, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                N
              </div>
              <span className="font-bold text-xl tracking-tight">Nexmarto</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              India's premium B2B marketplace. Connect with verified manufacturers, 
              suppliers, and exporters across the globe.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-2" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@nexmarto.com</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Buyers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Browse Products</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">All Categories</Link></li>
              <li><Link href="/suppliers" className="hover:text-primary transition-colors">Verified Suppliers</Link></li>
              <li><Link href="/rfq" className="hover:text-primary transition-colors">Submit RFQ</Link></li>
              <li><Link href="/trust" className="hover:text-primary transition-colors">Trade Assurance</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Suppliers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-primary transition-colors">Sell on Nexmarto</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Membership Plans</Link></li>
              <li><Link href="/seller-success" className="hover:text-primary transition-colors">Seller Success Center</Link></li>
              <li><Link href="/api-docs" className="hover:text-primary transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates on trends, new products, and platform features.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email address" className="bg-background" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nexmarto Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <div className="flex items-center cursor-pointer hover:text-foreground transition-colors">
              <Globe2 className="w-4 h-4 mr-1" />
              English (India)
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
