const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getMe,
  updateProfile,
  getUserPublicProfile,
  getWishlist,
  toggleWishlist,
  addReview,
  submitIdVerification,
  getMyVerificationStatus,
} = require("../controllers/userController");

router.get("/me", protect, getMe);
router.put("/me", protect, upload.single("profilePicture"), updateProfile);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.post("/verify-id", protect, upload.single("idCard"), submitIdVerification);
router.get("/verify-id/status", protect, getMyVerificationStatus);
router.get("/:id", getUserPublicProfile);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
