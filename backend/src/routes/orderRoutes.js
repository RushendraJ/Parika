import { Router } from "express";

import {
  allOrders,
  myOrders,
  paymentConfig,
  placeOrder,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema, idParam, orderStatusSchema, verifyPaymentSchema } from "../validations/schemas.js";

const router = Router();

router.get("/payment-config", paymentConfig);

router.use(protect);
router.post("/", validate(checkoutSchema), placeOrder);
router.post("/verify-payment", validate(verifyPaymentSchema), verifyPayment);
router.get("/mine", myOrders);
router.get("/", adminOnly, allOrders);
router.patch("/:id/status", adminOnly, validate(idParam, "params"), validate(orderStatusSchema), updateOrderStatus);

export default router;
