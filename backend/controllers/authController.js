const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @desc  Register new user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college, stream, branch, academicYear } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    college,
    stream,
    branch,
    academicYear,
    verificationToken,
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  // Try to send verification email; don't fail registration if email isn't configured
  try {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your CampusMart account",
      html: `<p>Hi ${user.name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });
  } catch (err) {
    console.warn("Email sending failed:", err.message);
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc  Verify email
// @route GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.json({ message: "Email verified successfully" });
});

// @desc  Login user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("Your account has been banned");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    isVerified: user.isVerified,
    token: generateToken(user._id),
  });
});

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "CampusMart Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc  Reset password
// @route PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});

module.exports = { registerUser, verifyEmail, loginUser, forgotPassword, resetPassword };
