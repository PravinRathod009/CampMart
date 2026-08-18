const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Books",
        "Notes",
        "Engineering Instruments",
        "Medical Equipment",
        "Drawing Instruments",
        "Lab Equipment",
        "Laptops",
        "Calculators",
        "Hostel Essentials",
        "Others",
      ],
    },
    stream: { type: String, default: "" },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 }, // what the seller originally paid (used for price suggestion)
    purchaseDate: { type: Date }, // used to calculate age-based depreciation
    images: [{ type: String }],
    location: { type: String, required: true },
    status: { type: String, enum: ["Available", "Reserved", "Sold"], default: "Available" },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reservedUntil: { type: Date }, // reservation auto-expires if payment isn't completed in time
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
