import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function hasSmtpConfig() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

export async function sendEmail({ to, subject, text, html }) {
  if (!hasSmtpConfig()) {
    return { skipped: true, reason: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false, messageId: info.messageId };
}
