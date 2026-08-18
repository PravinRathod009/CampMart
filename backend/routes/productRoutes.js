const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  markAsSold,
  getSuggestedPrice,
} = require("../controllers/productController");

router.route("/")
  .get(getProducts)
  .post(protect, upload.array("images", 6), createProduct);

router.post("/suggest-price", protect, getSuggestedPrice);

router.get("/mine/all", protect, getMyProducts);

router.route("/:id")
  .get(getProductById)
  .put(protect, upload.array("images", 6), updateProduct)
  .delete(protect, deleteProduct);

router.put("/:id/sold", protect, markAsSold);

module.exports = router;
