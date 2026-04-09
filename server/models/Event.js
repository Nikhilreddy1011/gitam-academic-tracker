const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  userId: String,
  title: String,
  date: Date,
  description: { type: String, default: "" }
});

module.exports = mongoose.model("Event", eventSchema);