const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const { suggestPrice } = require("../utils/priceSuggestion");

// @desc  Create a listing
// @route POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, condition, price, location, stream } = req.body;

  if (!title || !description || !category || !condition || !price || !location) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Only ID-verified sellers can post listings — protects buyers from fake/anonymous sellers.
  if (req.user.idVerificationStatus !== "Approved") {
    res.status(403);
    throw new Error(
      "You need to verify your identity before selling. Please upload your ID card from your Profile page and wait for admin approval."
    );
  }

  const images = req.files ? req.files.map((f) => f.path) : [];

  const product = await Product.create({
    seller: req.user._id,
    title,
    description,
    category,
    condition,
    price,
    originalPrice: req.body.originalPrice || undefined,
    purchaseDate: req.body.purchaseDate || undefined,
    location,
    stream: stream || req.user.stream,
    images,
  });

  res.status(201).json(product);
});

// @desc  Suggest a fair resale price based on original price, age, and condition
// @route POST /api/products/suggest-price
const getSuggestedPrice = asyncHandler(async (req, res) => {
  const { originalPrice, purchaseDate, condition } = req.body;

  if (!originalPrice) {
    res.status(400);
    throw new Error("originalPrice is required");
  }
  if (!condition) {
    res.status(400);
    throw new Error("condition is required");
  }

  const result = suggestPrice(Number(originalPrice), purchaseDate, condition);
  res.json(result);
});

// @desc  Get all products with search/filter/sort/pagination
// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    location,
    condition,
    stream,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { status: "Available", approvalStatus: "Approved" };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (stream) query.stream = stream;
  if (location) query.location = { $regex: location, $options: "i" };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 }; // latest first (default)
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "latest") sortOption = { createdAt: -1 };

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("seller", "name profilePicture rating isVerifiedSeller college")
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc  Get single product + increment view count
// @route GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name profilePicture rating numReviews isVerifiedSeller college phone"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.views += 1;
  await product.save();

  res.json(product);
});

// @desc  Update a listing
// @route PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this listing");
  }

  const fields = ["title", "description", "category", "condition", "price", "location", "status", "stream", "originalPrice", "purchaseDate"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  if (req.files && req.files.length > 0) {
    product.images = [...product.images, ...req.files.map((f) => f.path)];
  }

  const updated = await product.save();
  res.json(updated);
});

// @desc  Delete a listing
// @route DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this listing");
  }

  await product.deleteOne();
  res.json({ message: "Listing removed" });
});

// @desc  Get my listings
// @route GET /api/products/mine/all
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json(products);
});

// @desc  Mark product as sold
// @route PUT /api/products/:id/sold
const markAsSold = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  product.status = "Sold";
  await product.save();
  res.json(product);
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  markAsSold,
  getSuggestedPrice,
};
