import mongoose from "mongoose";

import { cleanJson } from "./plugins.js";

export const SECTIONS = ["jewellery", "ethnic-wear"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: "", maxlength: 2000 },
    section: { type: String, enum: SECTIONS, required: true, index: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 1 },
    mrp: { type: Number, min: 1, default: null },
    // Either a path like "/uploads/abc.jpg" (admin upload) or null (frontend shows the category photo)
    imageUrl: { type: String, default: null },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
);

cleanJson(productSchema);

export const Product = mongoose.model("Product", productSchema);
