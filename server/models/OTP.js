const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expires: Date
});

module.exports = mongoose.model("OTP", otpSchema);