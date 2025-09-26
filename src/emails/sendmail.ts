'use server'

import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { MailType, OtpMailContext, SubscriptionExpiryMailContext, UpdateMailContext, SuccessPurchaseMailContext } from "./types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Configure Handlebars
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      partialsDir: path.resolve("./src/emails/templates/partials"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/emails/templates"),
    extName: ".hbs",
  })
);

type MailContext =
  | { template: 'otp'; context: OtpMailContext }
  | { template: 'serviceUpdate'; context: UpdateMailContext }
  | { template: 'subscriptionExpiry'; context: SubscriptionExpiryMailContext }
  | { template: 'successPurchase'; context : SuccessPurchaseMailContext };


export async function sendMail({
  to,
  subject,
  template,
  context,
}: {
  to: string;
  subject: string;
}& MailContext) {
  await transporter.sendMail({
    from: "Legacis <noreply@legaciscapital.com>",
    to,
    subject,
    template, 
    context,  
  } as any );
}



export async function sendSimpleMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: "Legacis <noreply@legaciscapital.com>",
    to,
    subject,
    html,
  });
}