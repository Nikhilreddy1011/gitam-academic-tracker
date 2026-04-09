const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },

  regNo: { type: String, required: true },
  branch: { type: String, required: true },
  batch: { type: String, required: true },
  semester: {
    type: Number,
    default: 1
  },
  cgpa: {
    type: Number,
    default: 0
  },
  sgpa: {
    type: Number,
    default: 0
  },
  aptitudeScore: {
    type: Number,
    default: 0
  },
  bio: { type: String, default: "" },

  phone: { type: String, default: "" } // optional
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);