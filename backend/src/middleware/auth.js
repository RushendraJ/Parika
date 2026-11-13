import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/token.js";

function readToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

/** Requires a valid JWT; sets req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized();
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Session expired, please sign in again");
  }
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized();
  req.user = user;
  next();
});

export const adminOnly = (req, _res, next) =>
  req.user?.role === "admin" ? next() : next(ApiError.forbidden("This is for the shop owner only"));
