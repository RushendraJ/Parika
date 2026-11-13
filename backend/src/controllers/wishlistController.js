import { Product } from "../models/Product.js";
import { WishlistItem } from "../models/WishlistItem.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/wishlist */
export const getWishlist = asyncHandler(async (req, res) => {
  const items = await WishlistItem.find({ user: req.user._id }).sort({ createdAt: 1 }).populate("product");
  res.json(items.filter((i) => i.product).map((i) => ({ id: i.id, product: i.product })));
});

/** POST /api/wishlist/toggle - body: { productId } -> { added } */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const existing = await WishlistItem.findOne({ user: req.user._id, product: productId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ added: false });
  }
  if (!(await Product.exists({ _id: productId }))) throw ApiError.notFound("Product not found");
  await WishlistItem.create({ user: req.user._id, product: productId });
  res.status(201).json({ added: true });
});
