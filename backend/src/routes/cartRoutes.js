import { Router } from "express";

import { addToCart, getCart, removeFromCart, setQuantity } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, productIdBody, quantityBody } from "../validations/schemas.js";

const router = Router();
router.use(protect);

router.route("/").get(getCart).post(validate(productIdBody), addToCart);
router.route("/:id")
  .patch(validate(idParam, "params"), validate(quantityBody), setQuantity)
  .delete(validate(idParam, "params"), removeFromCart);

export default router;
