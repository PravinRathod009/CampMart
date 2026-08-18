const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const {
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
} = require("../controllers/adminController");

router.use(protect, admin);

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanUser);
router.get("/products", getAllProducts);
router.put("/products/:id/approval", setProductApproval);
router.delete("/products/:id", removeProduct);
router.get("/reports", getReports);
router.put("/reports/:id", updateReportStatus);
router.get("/id-verifications", getIdVerifications);
router.put("/id-verifications/:id", reviewIdVerification);

module.exports = router;
