const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    college: { type: String, default: "" },
    stream: { type: String, default: "" }, // Engineering, Medical, Pharmacy, etc.
    branch: { type: String, default: "" }, // Computer, Mechanical, Civil, etc.
    academicYear: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpire: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isVerifiedSeller: { type: Boolean, default: false },
    idCardImage: { type: String, default: "" },
    idVerificationStatus: {
      type: String,
      enum: ["NotSubmitted", "Pending", "Approved", "Rejected"],
      default: "NotSubmitted",
    },
    idVerificationSubmittedAt: { type: Date },
    idVerificationReviewedAt: { type: Date },
    idVerificationRejectionReason: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
