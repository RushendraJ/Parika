import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const randomToken = () => crypto.randomBytes(32).toString("hex");
export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
