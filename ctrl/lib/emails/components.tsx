import { EmailTemplate } from "@daveyplate/better-auth-ui/server";
import { env } from "@/env";

export const emailVerificationReact = (name: string, url: string) =>
  EmailTemplate({
    action: "Verify Email",
    content: (
      <>
        <p>{`Hello ${name},`}</p>
        <p>Click the button below to verify your email address.</p>
      </>
    ),
    heading: "Verify Email",
    siteName: "Tunnelicious",
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    url,
  });

export const resetPasswordReact = (name: string, url: string) =>
  EmailTemplate({
    action: "Reset Password",
    content: (
      <>
        <p>{`Hello ${name},`}</p>
        <p>Click the button below to reset your password.</p>
      </>
    ),
    heading: "Rest Password",
    siteName: "Tunnelicious",
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    url,
  });

