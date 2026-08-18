const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");
const Report = require("../models/Report");

// @desc  Dashboard analytics
// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const soldProducts = await Product.countDocuments({ status: "Sold" });
  const pendingListings = await Product.countDocuments({ approvalStatus: "Pending" });
  const openReports = await Report.countDocuments({ status: "Open" });
  const pendingIdVerifications = await User.countDocuments({ idVerificationStatus: "Pending" });

  res.json({ totalUsers, totalProducts, soldProducts, pendingListings, openReports, pendingIdVerifications });
});

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// @desc  Ban / unban a user
// @route PUT /api/admin/users/:id/ban
const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBanned = !user.isBanned;
  await user.save();
  res.json({ message: `User ${user.isBanned ? "banned" : "unbanned"}`, user });
});

// @desc  Get all listings (any status) for moderation
// @route GET /api/admin/products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("seller", "name email")
    .sort({ createdAt: -1 });
  res.json(products);
});

// @desc  Approve / reject a listing
// @route PUT /api/admin/products/:id/approval
const setProductApproval = asyncHandler(async (req, res) => {
  const { approvalStatus } = req.body; // "Approved" | "Rejected"
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.approvalStatus = approvalStatus;
  await product.save();
  res.json(product);
});

// @desc  Remove a listing (spam)
// @route DELETE /api/admin/products/:id
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Listing removed" });
});

// @desc  Get all reports
// @route GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("reporter", "name email")
    .populate("product", "title")
    .populate("reportedUser", "name email")
    .sort({ createdAt: -1 });
  res.json(reports);
});

// @desc  Update report status
// @route PUT /api/admin/reports/:id
const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  report.status = req.body.status;
  await report.save();
  res.json(report);
});

// @desc  Get all pending ID verification submissions
// @route GET /api/admin/id-verifications
const getIdVerifications = asyncHandler(async (req, res) => {
  const { status } = req.query; // optional filter: Pending | Approved | Rejected
  const query = status ? { idVerificationStatus: status } : { idVerificationStatus: { $ne: "NotSubmitted" } };

  const users = await User.find(query)
    .select("name email college idCardImage idVerificationStatus idVerificationSubmittedAt idVerificationRejectionReason")
    .sort({ idVerificationSubmittedAt: -1 });

  res.json(users);
});

// @desc  Approve or reject a seller's ID verification
// @route PUT /api/admin/id-verifications/:id
const reviewIdVerification = asyncHandler(async (req, res) => {
  const { decision, rejectionReason } = req.body; // decision: "Approved" | "Rejected"

  if (!["Approved", "Rejected"].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'Approved' or 'Rejected'");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.idVerificationStatus !== "Pending") {
    res.status(400);
    throw new Error("This user has no pending ID verification to review");
  }

  user.idVerificationStatus = decision;
  user.idVerificationReviewedAt = new Date();
  user.isVerifiedSeller = decision === "Approved";
  user.idVerificationRejectionReason = decision === "Rejected" ? (rejectionReason || "ID could not be verified") : "";
  await user.save();

  res.json({ message: `Seller ID ${decision.toLowerCase()}`, user });
});

module.exports = {
  getAnalytics,
  getAllUsers,
  toggleBanUser,
  getAllProducts,
  setProductApproval,
  removeProduct,
  getReports,
  updateReportStatus,
  getIdVerifications,
  reviewIdVerification,
};
