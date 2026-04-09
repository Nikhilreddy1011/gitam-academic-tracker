const mongoose = require("mongoose");

const studySchema = new mongoose.Schema({
  userId: String,
  subject: String,
  examDate: Date,
  dailyHours: Number
});

module.exports = mongoose.model("Study", studySchema);