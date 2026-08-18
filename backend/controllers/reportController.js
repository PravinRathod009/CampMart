const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");

// @desc  Submit a report (spam/fake listing/user)
// @route POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const { productId, reportedUserId, reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error("Please provide a reason for the report");
  }

  const report = await Report.create({
    reporter: req.user._id,
    product: productId,
    reportedUser: reportedUserId,
    reason,
  });

  res.status(201).json(report);
});

module.exports = { createReport };
