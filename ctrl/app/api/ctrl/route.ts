import { env } from "@/env";
import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
 
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const apiKey = req.headers.get("x-api-key");


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
