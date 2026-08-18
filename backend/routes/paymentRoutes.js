const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  releaseReservation,
  getMyPurchases,
  getMySales,
  getPlatformRevenue,
  getOrderById,
} = require("../controllers/paymentController");
const { admin } = require("../middleware/admin");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/release/:productId", protect, releaseReservation);
router.get("/my-purchases", protect, getMyPurchases);
router.get("/my-sales", protect, getMySales);
router.get("/order/:id", protect, getOrderById);
router.get("/platform-revenue", protect, admin, getPlatformRevenue);

module.exports = router;
