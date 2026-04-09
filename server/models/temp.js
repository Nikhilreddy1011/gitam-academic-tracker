const mongoose = require("mongoose");

const aptitudeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  score: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Aptitude", aptitudeSchema);