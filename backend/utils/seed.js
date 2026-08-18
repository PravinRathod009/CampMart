// Simple seed script to create an admin user
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();
  const exists = await User.findOne({ email: "admin@campusmart.com" });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }
  await User.create({
    name: "Admin",
    email: "admin@campusmart.com",
    password: "admin123",
    role: "admin",
    isVerified: true,
  });
  console.log("Admin created: admin@campusmart.com / admin123");
  process.exit(0);
};

run();
