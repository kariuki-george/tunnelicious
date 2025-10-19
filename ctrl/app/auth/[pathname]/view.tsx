"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

export function TunneliciousAuthView({ pathname }: { pathname: string }) {
  return (
    <main className="container flex grow flex-col items-center justify-center gap-3 self-center p-6 md:p-6">
      <AuthView redirectTo="/app" pathname={pathname} />
    </main>
  );
}
