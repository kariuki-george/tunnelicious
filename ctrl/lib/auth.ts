import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { env } from "@/env";
import { emailVerification, resetPassword } from "./emails/content";
import prisma from "./prisma";
import { passkey } from "@better-auth/passkey";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,

    sendResetPassword: async (data, _request) => {
      const { url, user } = data;
      const { text, html } = await resetPassword(user.name, url);
      console.log(text, html);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async (data, _) => {
      const { url, user } = data;
      const { html, text } = await emailVerification(url, user.name);
      console.log(text, html);
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        returned: true,
      },
    },
  },
  advanced: {
    cookies: {
      session_token: {
        name: "tunnelicious.session.token",
      },
      session_data: {
        name: "tunnelicious.session.data",
      },
    },
  },
  rateLimit: {
    storage: "memory",
    enabled: true,
  },

  socialProviders: {},
  plugins: [
    openAPI({ path: "docs" }),

    passkey({
      // TODO: CHECKOUT FOR TRAILING
      origin: env.BETTER_AUTH_URL.trimEnd(),
      rpName: "Tunnelicious",
      rpID: env.DOMAIN_NAME,
    }),
    nextCookies(), // make sure this plugin is always the last in the array
  ],
});
