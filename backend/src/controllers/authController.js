import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { sendPasswordResetEmail } from "../services/mailer.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { randomToken, sha256, signToken } from "../utils/token.js";

const roleFor = (email) => (env.adminEmail && email === env.adminEmail ? "admin" : "user");
const session = (user) => ({ token: signToken(user._id), user });

/** POST /api/auth/signup */
export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict("An account with this email already exists");
  const user = new User({ fullName, email, role: roleFor(email) });
  await user.setPassword(password);
  await user.save();
  res.status(201).json(session(user));
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.checkPassword(password))) throw ApiError.unauthorized("Email or password is incorrect");
  res.json(session(user));
});

/** POST /api/auth/google - body: { credential } (Google ID token from Google Identity Services) */
export const googleLogin = asyncHandler(async (req, res) => {
  if (!env.googleClientId) throw ApiError.badRequest("Google sign-in is not configured");
  const client = new OAuth2Client(env.googleClientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: req.body.credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("Google verifyIdToken error:", err?.message || err);
    throw ApiError.unauthorized("Google sign-in failed: " + (err?.message || "Invalid token"));
  }
  if (!payload?.email || !payload.email_verified) throw ApiError.unauthorized("Google account email is not verified");

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, fullName: payload.name || "", googleId: payload.sub, role: roleFor(email) });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }
  res.json(session(user));
});

/** GET /api/auth/me */
export const me = (req, res) => res.json({ user: req.user });

/** POST /api/auth/forgot-password - always answers the same so emails can't be probed. */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const raw = randomToken();
    user.resetTokenHash = sha256(raw);
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const link = `${env.clientUrls[0]}/reset-password?token=${raw}`;
    try {
      await sendPasswordResetEmail(user.email, link);
    } catch (err) {
      console.error("Could not send reset email:", err.message);
    }
  }
  res.json({ message: "If that email has an account, a reset link is on its way." });
});

/** POST /api/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetTokenHash: sha256(req.body.token),
    resetTokenExpires: { $gt: new Date() },
  }).select("+resetTokenHash +resetTokenExpires");
  if (!user) throw ApiError.badRequest("This reset link is invalid or has expired");
  await user.setPassword(req.body.password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json(session(user));
});
