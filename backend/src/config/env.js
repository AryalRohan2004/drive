import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  throw new Error(
    "Missing required environment variable: DATABASE_URL ",
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigin: (() => {
    const originStr = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173";
    return originStr.includes(',') ? originStr.split(',').map(s => s.trim()) : originStr;
  })(),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom:
    process.env.EMAIL_FROM ||
    "SANOS Driving School <no-reply@sanosdriving.com.au>",
  adminNotifyEmail:
    process.env.ADMIN_NOTIFY_EMAIL || "info@sanosdriving.com.au",
  allowGuestBookings:
    String(process.env.ALLOW_GUEST_BOOKINGS || "true") === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: process.env.STRIPE_CURRENCY || "aud",
};
