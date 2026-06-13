import { Button } from "@nexmarto/ui";
import { Search, Home, Map } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-muted/30">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <Map className="w-16 h-16 text-primary" />
        </div>
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
          <Link href="/products">
            <Search className="w-4 h-4 mr-2" /> Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
