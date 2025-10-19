"use client";

import { SignedIn, useAuthenticate, UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import type React from "react";
export default function ({ children }: { children: React.ReactNode }) {
  useAuthenticate();

  return (
    <SignedIn>
      <main className="min-h-screen ">
        <header className="flex items-center justify-between px-8 py-4  shadow-sm border-b">
          {/* Left - Logo */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold ">tunnelicious</h2>
          </div>

          {/* Center - Navigation */}
          <nav className="flex gap-8 text-sm font-medium">
            <Link href="/app" className="hover: transition-colors">
              tunnels
            </Link>
            <Link href="/installation" className="hover: transition-colors">
              installation
            </Link>
            <Link href="/profile" className="hover: transition-colors">
              profile
            </Link>
          </nav>

          {/* Right - Avatar */}
          <div>
            <UserButton size="icon" />
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </SignedIn>
  );
}
