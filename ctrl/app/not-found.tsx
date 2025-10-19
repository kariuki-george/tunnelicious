"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="text-9xl font-bold text-primary">404</div>
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>

      <Link href="/">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
