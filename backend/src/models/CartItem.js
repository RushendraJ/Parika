import mongoose from "mongoose";

import { cleanJson } from "./plugins.js";

const cartItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1, min: 1, max: 20 },
  },
  { timestamps: true },
);
cartItemSchema.index({ user: 1, product: 1 }, { unique: true });

cleanJson(cartItemSchema);

export const CartItem = mongoose.model("CartItem", cartItemSchema);
