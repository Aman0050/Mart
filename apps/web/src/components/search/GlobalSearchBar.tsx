"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, PackageOpen, Building2, FolderTree, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{products: any[], suppliers: any[], categories: any[]}>({ products: [], suppliers: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions({ products: [], suppliers: [], categories: [] });
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error("Suggestion error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasSuggestions = suggestions.products.length > 0 || suggestions.suppliers.length > 0 || suggestions.categories.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-50">
      <form onSubmit={handleSearch} className={`relative flex items-center w-full h-12 rounded-full border bg-white shadow-sm overflow-hidden transition-all duration-200 ${isFocused ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/50'}`}>
        <div className="pl-4 pr-2 text-muted-foreground flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products, suppliers, or categories..."
          className="flex-1 h-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
        <button type="submit" className="h-full px-6 bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
            </div>
          ) : hasSuggestions ? (
            <div className="py-2">
              
              {/* Products */}
              {suggestions.products.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</div>
                  {suggestions.products.map(p => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={() => setIsFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <PackageOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="truncate text-sm font-medium">{p.title}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Suppliers */}
              {suggestions.suppliers.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suppliers</div>
                  {suggestions.suppliers.map(s => (
                    <Link key={s.id} href={`/company/${s.slug}`} onClick={() => setIsFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="truncate text-sm font-medium">{s.companyName}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions.categories.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</div>
                  {suggestions.categories.map(c => (
                    <Link key={c.id} href={`/products?category=${c.id}`} onClick={() => setIsFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <FolderTree className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="truncate text-sm font-medium">{c.name}</div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t mt-2 p-2">
                <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={() => setIsFocused(false)} className="flex items-center justify-center w-full py-2 text-sm text-primary font-medium hover:underline">
                  View all results for "{query}"
                </Link>
              </div>

            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
