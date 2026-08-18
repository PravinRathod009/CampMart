const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // total amount buyer paid (item price + platform fee)
    itemPrice: { type: Number, required: true }, // original listing price
    platformFee: { type: Number, required: true }, // platform's cut
    sellerPayout: { type: Number, required: true }, // amount owed to seller after fee
    payoutStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["Created", "Paid", "Failed"],
      default: "Created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
