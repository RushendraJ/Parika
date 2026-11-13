import { Router } from "express";

import { createProduct, deleteProduct, listProducts, updateProduct } from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { uploadProductImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { idParam, productPatchSchema, productSchema } from "../validations/schemas.js";

const router = Router();

router.get("/", listProducts);
router.post("/", protect, adminOnly, uploadProductImage, validate(productSchema), createProduct);
router.patch("/:id", protect, adminOnly, validate(idParam, "params"), validate(productPatchSchema), updateProduct);
router.delete("/:id", protect, adminOnly, validate(idParam, "params"), deleteProduct);

export default router;
