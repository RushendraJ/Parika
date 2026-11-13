import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_QTY = 20;

async function cartFor(userId) {
  const items = await CartItem.find({ user: userId }).sort({ createdAt: 1 }).populate("product");
  // Drop lines whose product no longer exists
  return items.filter((i) => i.product).map((i) => ({ id: i.id, quantity: i.quantity, product: i.product }));
}

/** GET /api/cart */
export const getCart = asyncHandler(async (req, res) => res.json(await cartFor(req.user._id)));

/** POST /api/cart - body: { productId } adds one (or increments) */
export const addToCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) throw ApiError.notFound("Product not found");
  if (!product.inStock) throw ApiError.badRequest("This item is out of stock");

  const existing = await CartItem.findOne({ user: req.user._id, product: product._id });
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, MAX_QTY);
    await existing.save();
  } else {
    await CartItem.create({ user: req.user._id, product: product._id });
  }
  res.status(201).json(await cartFor(req.user._id));
});

/** PATCH /api/cart/:id - body: { quantity }; quantity 0 removes the line */
export const setQuantity = asyncHandler(async (req, res) => {
  const item = await CartItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw ApiError.notFound("Cart item not found");
  if (req.body.quantity < 1) await item.deleteOne();
  else {
    item.quantity = Math.min(req.body.quantity, MAX_QTY);
    await item.save();
  }
  res.json(await cartFor(req.user._id));
});

/** DELETE /api/cart/:id */
export const removeFromCart = asyncHandler(async (req, res) => {
  await CartItem.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json(await cartFor(req.user._id));
});
