const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date
});

module.exports = mongoose.model("Token", tokenSchema);