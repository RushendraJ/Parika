import { env } from "../config/env.js";
import { CartItem } from "../models/CartItem.js";
import { Order } from "../models/Order.js";
import { createRazorpayOrder, isValidSignature, razorpayAvailable } from "../services/razorpay.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { orderTotal } from "../utils/pricing.js";

/** GET /api/orders/payment-config - tells the frontend whether online payment is switched on and returns UPI details. */
export const paymentConfig = (_req, res) =>
  res.json({
    onlineAvailable: razorpayAvailable(),
    upiAvailable: Boolean(env.upiId),
    upiId: env.upiId,
    upiName: env.upiName,
  });

/** POST /api/orders - builds an order from the signed-in user's cart, priced from the database. */
export const placeOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, upiUtr, ...address } = req.body;
  const cart = await CartItem.find({ user: req.user._id }).populate("product");
  const lines = cart.filter((l) => l.product && l.product.inStock);
  if (lines.length === 0) throw ApiError.badRequest("Your cart is empty");

  if (paymentMethod === "online" && !razorpayAvailable()) {
    throw ApiError.badRequest("Online card payment is not available yet");
  }

  const items = lines.map((l) => ({
    product: l.product._id,
    name: l.product.name,
    price: l.product.price,
    quantity: l.quantity,
    imageUrl: l.product.imageUrl,
  }));
  const total = orderTotal(items);

  const initialStatus = paymentMethod === "online" ? "awaiting_payment" : "confirmed";

  const order = await Order.create({
    ...address,
    user: req.user._id,
    items,
    total,
    paymentMethod,
    upiUtr: paymentMethod === "upi" ? upiUtr || null : null,
    status: initialStatus,
  });

  let razorpayOrderId = null;
  if (paymentMethod === "online") {
    try {
      const rp = await createRazorpayOrder(total, order.id);
      razorpayOrderId = rp.id;
      order.razorpayOrderId = rp.id;
      await order.save();
    } catch (err) {
      console.error("Razorpay order error:", err?.message || err);
      await order.deleteOne();
      throw new ApiError(502, "Payment service error, please try again");
    }
  } else {
    // Both COD and UPI orders clear cart upon placement
    await CartItem.deleteMany({ user: req.user._id });
  }

  res.status(201).json({
    orderId: order.id,
    total,
    razorpayOrderId,
    keyId: razorpayOrderId ? env.razorpayKeyId : null,
  });
});

/** POST /api/orders/verify-payment - checks the Razorpay signature, marks the order paid, empties the cart. */
export const verifyPayment = asyncHandler(async (req, res) => {
  if (!razorpayAvailable()) throw ApiError.badRequest("Online payment is not available");
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order || order.razorpayOrderId !== razorpay_order_id) throw ApiError.notFound("Order not found");
  if (!isValidSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    throw ApiError.badRequest("Payment could not be verified");
  }
  order.status = "paid";
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ ok: true });
});

/** GET /api/orders/mine */
export const myOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

/** GET /api/orders (admin) */
export const allOrders = asyncHandler(async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }));
});

/** PATCH /api/orders/:id/status (admin) */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) throw ApiError.notFound("Order not found");
  res.json(order);
});
