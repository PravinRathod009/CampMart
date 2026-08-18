const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Review = require("../models/Review");

// @desc  Get current user profile
// @route GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc  Update profile
// @route PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const fields = ["name", "phone", "college", "stream", "branch", "academicYear"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });

  if (req.file) {
    user.profilePicture = req.file.path;
  }

  const updated = await user.save();
  res.json(updated);
});

// @desc  Get public profile of a user (seller page)
// @route GET /api/users/:id
const getUserPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name profilePicture college stream branch rating numReviews isVerifiedSeller createdAt"
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const reviews = await Review.find({ seller: req.params.id }).populate("reviewer", "name profilePicture");
  res.json({ user, reviews });
});

// @desc  Get wishlist
// @route GET /api/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
});

// @desc  Toggle product in wishlist
// @route POST /api/users/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.findIndex((id) => id.toString() === productId);

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  await user.save();
  res.json(user.wishlist);
});

// @desc  Add review for a seller
// @route POST /api/users/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, product } = req.body;
  const sellerId = req.params.id;

  if (sellerId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot review yourself");
  }

  const review = await Review.create({
    reviewer: req.user._id,
    seller: sellerId,
    product,
    rating,
    comment,
  });

  const reviews = await Review.find({ seller: sellerId });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await User.findByIdAndUpdate(sellerId, {
    rating: avgRating,
    numReviews: reviews.length,
  });

  res.status(201).json(review);
});

// @desc  Submit ID card for seller verification
// @route POST /api/users/verify-id
const submitIdVerification = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a clear photo of your ID card");
  }

  const user = await User.findById(req.user._id);

  user.idCardImage = req.file.path;
  user.idVerificationStatus = "Pending";
  user.idVerificationSubmittedAt = new Date();
  user.idVerificationRejectionReason = "";
  await user.save();

  res.json({
    message: "ID submitted for review. You'll be able to sell once an admin approves it.",
    idVerificationStatus: user.idVerificationStatus,
  });
});

// @desc  Get my own ID verification status
// @route GET /api/users/verify-id/status
const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "idVerificationStatus idVerificationSubmittedAt idVerificationRejectionReason isVerifiedSeller"
  );
  res.json(user);
});

module.exports = {
  getMe,
  updateProfile,
  getUserPublicProfile,
  getWishlist,
  toggleWishlist,
  addReview,
  submitIdVerification,
  getMyVerificationStatus,
};
