import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { WishlistItem } from "../models/WishlistItem.js";
import { removeUpload } from "../middleware/upload.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/products?section=jewellery|ethnic-wear */
export const listProducts = asyncHandler(async (req, res) => {
  const filter = ["jewellery", "ethnic-wear"].includes(req.query.section) ? { section: req.query.section } : {};
  res.json(await Product.find(filter).sort({ createdAt: 1 }));
});

/** POST /api/products (admin, multipart/form-data with optional `image`) */
export const createProduct = asyncHandler(async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const product = await Product.create({ ...req.body, imageUrl });
  res.status(201).json(product);
});

/** PATCH /api/products/:id (admin) */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound("Product not found");
  res.json(product);
});

/** DELETE /api/products/:id (admin) - also clears it from carts and wishlists. */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");
  await Promise.all([
    CartItem.deleteMany({ product: product._id }),
    WishlistItem.deleteMany({ product: product._id }),
  ]);
  removeUpload(product.imageUrl);
  res.status(204).end();
});
