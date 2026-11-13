import mongoose from "mongoose";

import { cleanJson } from "./plugins.js";

const wishlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true },
);
wishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });

cleanJson(wishlistItemSchema);

export const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);
