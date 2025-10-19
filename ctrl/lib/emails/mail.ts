import transporter from "./transport";

export type ZInput = {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

/** do not provide the from field if no reply is expected*/
const sendEmail = async ({ from, to, subject, text, html }: ZInput) => {
  if (!from) {
    from = "noreply@tunnelicious.kariukigeorge.me";
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

export { sendEmail };
