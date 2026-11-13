import { Router } from "express";

import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { productIdBody } from "../validations/schemas.js";

const router = Router();
router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", validate(productIdBody), toggleWishlist);

export default router;
