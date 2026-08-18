require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const Product = require("./models/Product");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "CampusMart API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Safety-net background job: every 2 minutes, release any product reservations
// that expired because a buyer abandoned checkout without retrying or cancelling.
setInterval(async () => {
  try {
    const result = await Product.updateMany(
      { status: "Reserved", reservedUntil: { $lt: new Date() } },
      { $set: { status: "Available" }, $unset: { reservedBy: "", reservedUntil: "" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Released ${result.modifiedCount} expired product reservation(s)`);
    }
  } catch (err) {
    console.error("Reservation cleanup job failed:", err.message);
  }
}, 2 * 60 * 1000);
