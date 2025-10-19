import { render } from "@react-email/components";
import {
  emailVerificationReact,
  resetPasswordReact,
} from "./components";

export const emailVerification = async (url: string, name: string) => {
  const html = await render(emailVerificationReact(name, url));
  const text = `
Greetings,

Welcome to Tunnelicious. 

Use the attached url to verify your email address. 

${url}

If you didn't request an email verification, kindly ignore this message.
`;

  return {
    text,
    html,
  };
};

export const resetPassword = async (name: string, url: string) => {
  const html = await render(resetPasswordReact(name, url));
  const text = `
Greetings, 

Use the attached url to reset your password.

${url}

If you didn't request a password change, kindly ignore this message.
`;

  return { text, html };
};
