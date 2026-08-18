const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Open", "Reviewed", "Dismissed"], default: "Open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
