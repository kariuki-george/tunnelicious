import { env } from "@/env";
import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { ipAddress } from "@vercel/functions";

const ALLOWED_IPS =
  env.NODE_ENV === "development"
    ? ["127.0.0.1", "::1"]
    : env.ALLOWED_PROXY_IPS?.split(",") || [];

export async function GET(req: NextRequest) {
  let ip = ipAddress(req);
  console.log("[IP] Address: ", ip);

  if (!ip && env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Access denied: IP not allowed" },
      { status: 403 }
    );
  }
  ip = "127.0.0.1";
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const apiKey = req.headers.get("x-api-key");

  //  Check if IP is allowed
  if (!ALLOWED_IPS.includes(ip)) {
    return NextResponse.json(
      { error: "Access denied: IP not allowed" },
      { status: 403 }
    );
  }

  // Check proxy authorization
  if (!authHeader || authHeader !== `Bearer ${env.PROXY_AUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized proxy" }, { status: 401 });
  }
  if (!apiKey) {
    // Validate API key for the tunnel
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  const tunnel = await prisma.tunnels.findFirst({ where: { apiKey } });

  if (!tunnel) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  // Example response
  return NextResponse.json({
    message: "Proxy connection accepted",
    tunnel: {
      tunnelId: tunnel.id,
    },
  });
}
