import crypto from "node:crypto";

import { env } from "../config/env.js";

export const razorpayAvailable = () => Boolean(env.razorpayKeyId && env.razorpayKeySecret);

/** Creates a Razorpay order. `amountRupees` is converted to paise. */
export async function createRazorpayOrder(amountRupees, receipt) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt: String(receipt).slice(0, 40) }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Razorpay order API error:", res.status, errorText);
    throw new Error(`Razorpay order creation failed (${res.status}): ${errorText}`);
  }
  return res.json();
}

export function isValidSignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
