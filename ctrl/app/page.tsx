"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function Page() {
  return (
    <div className="-mt-16 flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold py-20">tunnelicious</h1>
      <div className="flex gap-2">
        <SignedIn>
          <Button>
            <Link href="/app">Go to app</Link>
          </Button>
        </SignedIn>
        <SignedOut>
          <Button>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </SignedOut>
      </div>
    </div>
  );
}
