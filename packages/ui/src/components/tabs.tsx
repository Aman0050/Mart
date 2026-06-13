"use client"

import * as React from "react"
import { cn } from "../lib/utils"

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null)

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children,
  className
}: { 
  defaultValue?: string; 
  value?: string; 
  onValueChange?: (value: string) => void; 
  children: React.ReactNode;
  className?: string;
}) {
  const [tab, setTab] = React.useState(value || defaultValue || "");

  const handleValueChange = React.useCallback((newValue: string) => {
    setTab(newValue);
    if (onValueChange) onValueChange(newValue);
  }, [onValueChange]);

  React.useEffect(() => {
    if (value !== undefined) setTab(value);
  }, [value]);

  return (
    <TabsContext.Provider value={{ value: tab, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  className, 
  children 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-background text-foreground shadow-sm",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value, 
  className, 
  children 
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in zoom-in-95 duration-200",
        className
      )}
    >
      {children}
    </div>
  )
}
