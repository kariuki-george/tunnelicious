import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { TunneliciousAuthView } from "./view";

export function generateStaticParams() {
  return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;

  return <TunneliciousAuthView pathname={pathname} />;
}
