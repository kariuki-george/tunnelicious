import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "@/env";

const transport = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: Number(env.MAIL_PORT) === 465,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD,
  },
} as SMTPTransport.Options);

export default transport;
