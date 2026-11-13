import { z } from "zod";

import { SECTIONS } from "../models/Product.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const email = z.string().trim().toLowerCase().email("Please enter a valid email").max(255);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name").max(100),
  email,
  password,
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) });
export const googleSchema = z.object({ credential: z.string().min(10) });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(10), password });

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().max(20).regex(/^[+\d\s-]*$/, "Phone can only contain digits, spaces, + and -"),
  city: z.string().trim().max(60),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  description: z.string().trim().max(2000).default(""),
  section: z.enum(SECTIONS),
  category: z.string().trim().min(1),
  price: z.coerce.number().int().positive(),
  // multipart forms send "" for an empty field
  mrp: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().positive().nullable()),
});

export const productPatchSchema = z.object({
  inStock: z.boolean().optional(),
  price: z.coerce.number().int().positive().optional(),
  mrp: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
});

export const productIdBody = z.object({ productId: objectId });
export const quantityBody = z.object({ quantity: z.coerce.number().int().min(0).max(20) });
export const idParam = z.object({ id: objectId });

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone number"),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["cod", "online", "upi"]),
  upiUtr: z.string().trim().max(30).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: objectId,
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
});
