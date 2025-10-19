import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

// Vercel Details

// determine env -> server or client side

let vercelURL = "http://localhost:3000";
if (typeof window === "undefined") {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    vercelURL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
} else {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    vercelURL = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }
}

const NEXT_PUBLIC_BASE_URL = vercelURL;

const BETTER_AUTH_URL = vercelURL;
const DOMAIN_NAME =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "")
    : "localhost";

const server = {
  DATABASE_URL: z.url(),
  DATABASE_DEV_USE_NEON: z.optional(z.string()),
  BETTER_AUTH_SECRET: z.string(),

  BETTER_AUTH_URL: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.number(),

  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  DOMAIN_NAME: z.string(),
  PROXY_AUTH_SECRET: z.string(),
  ALLOWED_PROXY_IPS: z.string(),

  // Added by Vercel
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
};

const client = {};

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  client,
  server,
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_DEV_USE_NEON: process.env.DATABASE_DEV_USE_NEON,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    BETTER_AUTH_URL,
    DOMAIN_NAME,

    NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Added by Vercel
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    MAIL_HOST: "",
    MAIL_PASSWORD: "",
    MAIL_PORT: 1,
    MAIL_USER: "",
    PROXY_AUTH_SECRET: process.env.PROXY_AUTH_SECRET,
    ALLOWED_PROXY_IPS: process.env.ALLOWED_PROXY_IPS,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
