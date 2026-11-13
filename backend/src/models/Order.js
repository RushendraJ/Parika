import mongoose from "mongoose";

import { cleanJson } from "./plugins.js";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    // Snapshot at purchase time so history survives product edits/deletes
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String, default: null },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "online", "upi"], required: true },
    status: {
      type: String,
      enum: ["pending", "awaiting_payment", "confirmed", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    upiUtr: { type: String, default: null },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { timestamps: true },
);

cleanJson(orderSchema);

export const Order = mongoose.model("Order", orderSchema);
