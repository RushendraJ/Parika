import { Router } from "express";

import { getProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../validations/schemas.js";

const router = Router();
router.use(protect);
router.route("/me").get(getProfile).put(validate(profileSchema), updateProfile);

export default router;
