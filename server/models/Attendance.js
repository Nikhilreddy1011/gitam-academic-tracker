const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subject: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  totalClasses: {
    type: Number,
    default: 0
  },

  attendedClasses: {
    type: Number,
    default: 0
  }
});

// 🔥 UNIQUE COMBINATION (MOST IMPORTANT)
attendanceSchema.index({ userId: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);