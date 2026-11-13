import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;
function getTransporter() {
  if (!env.smtp.host) return null;
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

export async function sendPasswordResetEmail(to, link) {
  const t = getTransporter();
  if (!t) {
    // No SMTP configured yet - print the link so the flow can still be tested in development.
    console.log(`\n[mail disabled] Password reset link for ${to}:\n${link}\n`);
    return;
  }
  await t.sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your Parika password",
    text: `Use this link to set a new password (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: `<p>Use this link to set a new password (valid for 1 hour):</p><p><a href="${link}">Reset password</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
  });
}
