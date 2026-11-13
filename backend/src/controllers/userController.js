import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/users/me */
export const getProfile = (req, res) => res.json({ user: req.user });

/** PUT /api/users/me */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, city } = req.body;
  Object.assign(req.user, { fullName, phone, city });
  await req.user.save();
  res.json({ user: req.user });
});
