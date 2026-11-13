import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

export function assertEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    console.error("Copy backend/.env.example to backend/.env and fill in the values.");
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminName: process.env.ADMIN_NAME || "Parika Admin",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  upiId: (process.env.UPI_ID || "rushendra1729@okaxis").trim(),
  upiName: (process.env.UPI_NAME || process.env.ADMIN_NAME || "Parika Jewels").trim(),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "Parika <no-reply@parika.example>",
  },
};

export const isProd = env.nodeEnv === "production";
