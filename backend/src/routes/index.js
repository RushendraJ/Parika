import { Router } from "express";

import authRoutes from "./authRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import productRoutes from "./productRoutes.js";
import userRoutes from "./userRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);

export default router;
