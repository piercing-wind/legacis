"use server";
import { db } from "@/lib/db";
import { sendMail, sendSimpleMail } from "@/emails/sendmail";
export async function saveContactMessage({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });
   await sendSimpleMail({
      to: "<info@legaciscapital.com>",
      subject: "New Contact Message",
      html: `
        <p>You have received a new contact message:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Message:</strong> ${message}</li>
        </ul>
      `,
   });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save message." };
  }
}