import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { cleanJson } from "./plugins.js";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, maxlength: 100, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    // Not set for accounts created through Google sign-in only
    passwordHash: { type: String, select: false },
    googleId: { type: String, index: true, sparse: true },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    city: { type: String, trim: true, maxlength: 60, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.checkPassword = function checkPassword(plain) {
  return this.passwordHash ? bcrypt.compare(plain, this.passwordHash) : Promise.resolve(false);
};

cleanJson(userSchema);

export const User = mongoose.model("User", userSchema);
