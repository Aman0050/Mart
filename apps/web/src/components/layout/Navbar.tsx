"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Sheet, SheetContent, SheetTrigger } from "@nexmarto/ui";
import { Menu, Search, Package, ShoppingCart, User, Globe2 } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              N
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              Nexmarto
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Categories
            </Link>
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
            <Link
              href="/suppliers"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Suppliers
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground mr-4 cursor-pointer hover:text-foreground transition-colors">
            <Globe2 className="w-4 h-4 mr-1" />
            EN / USD
          </div>
          
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="hidden sm:flex shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              Sign Up
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="font-bold text-lg">
                  Nexmarto
                </Link>
                <div className="h-px bg-border my-2" />
                <Link href="/products" className="text-muted-foreground hover:text-foreground py-2">
                  All Categories
                </Link>
                <Link href="/products" className="text-muted-foreground hover:text-foreground py-2">
                  Explore Products
                </Link>
                <Link href="/suppliers" className="text-muted-foreground hover:text-foreground py-2">
                  Verified Suppliers
                </Link>
                <div className="h-px bg-border my-2" />
                <Link href="/login" className="w-full">
                  <Button className="w-full justify-start mt-2">Sign In</Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button variant="outline" className="w-full justify-start">Create Account</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
