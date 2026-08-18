const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Platform takes a small service fee on every in-app "Buy Now" payment.
// Adjust this to whatever commission % makes sense for your business.
const PLATFORM_FEE_PERCENT = 5; // 5%
const RESERVATION_MINUTES = 10; // how long a checkout hold lasts before the item is released back

// @desc  Create a Razorpay order for a product (buyer initiates payment)
// @route POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // First, release any of this product's stale reservations (previous abandoned checkouts)
  await Product.updateOne(
    { _id: productId, status: "Reserved", reservedUntil: { $lt: new Date() } },
    { $set: { status: "Available" }, $unset: { reservedBy: "", reservedUntil: "" } }
  );

  // Atomically reserve the product ONLY if it's still Available.
  // This is the critical step: if two buyers click "Buy Now" at the same instant,
  // MongoDB guarantees only ONE of these updates succeeds — the other gets null back.
  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
  const product = await Product.findOneAndUpdate(
    { _id: productId, status: "Available" },
    { $set: { status: "Reserved", reservedBy: req.user._id, reservedUntil } },
    { new: true }
  );

  if (!product) {
    // Either the product doesn't exist, or someone else has already reserved/bought it
    res.status(409); // 409 Conflict — correct status code for "someone beat you to it"
    throw new Error("This item was just reserved or sold by another buyer. Please check back or browse similar items.");
  }

  if (product.seller.toString() === req.user._id.toString()) {
    // Roll back the reservation before rejecting
    await Product.findByIdAndUpdate(product._id, {
      $set: { status: "Available" },
      $unset: { reservedBy: "", reservedUntil: "" },
    });
    res.status(400);
    throw new Error("You cannot buy your own listing");
  }

  const itemPrice = product.price;
  const platformFee = Math.round((itemPrice * PLATFORM_FEE_PERCENT) / 100);
  const totalAmount = itemPrice + platformFee;
  const sellerPayout = itemPrice;

  const amountInPaise = Math.round(totalAmount * 100);

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${product._id}_${Date.now()}`,
      notes: { productId: product._id.toString(), buyerId: req.user._id.toString() },
    });
  } catch (err) {
    // Razorpay failed — release the reservation so the item doesn't get stuck
    await Product.findByIdAndUpdate(product._id, {
      $set: { status: "Available" },
      $unset: { reservedBy: "", reservedUntil: "" },
    });
    throw err;
  }

  const order = await Order.create({
    product: product._id,
    buyer: req.user._id,
    seller: product.seller,
    amount: totalAmount,
    itemPrice,
    platformFee,
    sellerPayout,
    razorpayOrderId: razorpayOrder.id,
  });

  res.status(201).json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    dbOrderId: order._id,
    productTitle: product.title,
    itemPrice,
    platformFee,
    totalAmount,
    reservedUntil: product.reservedUntil,
  });
});

// @desc  Verify Razorpay payment signature after checkout completes
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing payment verification fields");
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    order.status = "Failed";
    await order.save();
    // Release the reservation so someone else can buy it
    await Product.findByIdAndUpdate(order.product, {
      $set: { status: "Available" },
      $unset: { reservedBy: "", reservedUntil: "" },
    });
    res.status(400);
    throw new Error("Payment verification failed");
  }

  order.status = "Paid";
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();

  // Finalize the sale: Reserved -> Sold. Guarded by the reservedBy check so a stray
  // request can't mark someone else's already-sold-elsewhere item as sold.
  await Product.findOneAndUpdate(
    { _id: order.product, reservedBy: order.buyer },
    { $set: { status: "Sold" }, $unset: { reservedBy: "", reservedUntil: "" } }
  );

  res.json({ message: "Payment verified successfully", order });
});

// @desc  Release a reservation if the buyer abandons/cancels checkout
// @route POST /api/payments/release/:productId
const releaseReservation = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, reservedBy: req.user._id, status: "Reserved" },
    { $set: { status: "Available" }, $unset: { reservedBy: "", reservedUntil: "" } },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("No active reservation found for this item under your account");
  }

  res.json({ message: "Reservation released", product });
});

// @desc  Get orders where I'm the buyer
// @route GET /api/payments/my-purchases
const getMyPurchases = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id, status: "Paid" })
    .populate("product", "title images price")
    .populate("seller", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc  Get orders where I'm the seller
// @route GET /api/payments/my-sales
const getMySales = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req.user._id, status: "Paid" })
    .populate("product", "title images price")
    .populate("buyer", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc  Platform revenue analytics (admin only — wire up admin/admin middleware on the route)
// @route GET /api/payments/platform-revenue
const getPlatformRevenue = asyncHandler(async (req, res) => {
  const paidOrders = await Order.find({ status: "Paid" });

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.platformFee, 0);
  const totalGMV = paidOrders.reduce((sum, o) => sum + o.itemPrice, 0); // gross merchandise value
  const pendingPayouts = paidOrders
    .filter((o) => o.payoutStatus === "Pending")
    .reduce((sum, o) => sum + o.sellerPayout, 0);

  res.json({
    totalOrders: paidOrders.length,
    totalRevenue,   // what the platform earned
    totalGMV,        // total value of goods sold through Buy Now
    pendingPayouts,  // money owed to sellers, not yet settled
  });
});

// @desc  Get a single order (used for the payment receipt/confirmation page)
// @route GET /api/payments/order/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("product", "title images price")
    .populate("buyer", "name email")
    .populate("seller", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only the buyer, the seller, or an admin can view this receipt
  const isParticipant =
    order.buyer._id.toString() === req.user._id.toString() ||
    order.seller._id.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

module.exports = { createOrder, verifyPayment, releaseReservation, getMyPurchases, getMySales, getPlatformRevenue, getOrderById };
