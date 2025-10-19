"use client";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import Link from "next/link";
import { useRouter } from "next/navigation";

import auth from "@/lib/auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={auth}
        navigate={router.push}
        persistClient={false}
        replace={router.replace}
        onSessionChange={() => router.refresh()}
        Link={Link}
        emailVerification={true}
        apiKey={false}
        account={{
          basePath: "/profile",
          viewPaths: { SETTINGS: "/" },
        }}
        passkey={true}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}
