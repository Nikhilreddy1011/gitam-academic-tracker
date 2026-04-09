const User = require("../models/User");
const Task = require("../models/Task");
const Event = require("../models/Event");
const Aptitude = require("../models/temp");

exports.getDashboard = async (req, res) => {
  try {
    // ✅ FETCH USER
    const user = await User.findById(req.user.id);

    // ✅ FETCH TASKS & EVENTS
    const tasks = await Task.find({ userId: req.user.id });
    const events = await Event.find({ userId: req.user.id });

    // ✅ SAFE DEFAULTS (VERY IMPORTANT)
    const sgpa = user.sgpa || 0;
    const cgpa = user.cgpa || 0;

    const attendance = user.attendance || {
      present: 0,
      absent: 0,
      percentage: 0
    };

    const aptitudeData = await Aptitude.findOne({ userId: req.user.id });
    const aptitudeScore = user.aptitudeScore || aptitudeData?.score || 0;

    // ✅ FINAL RESPONSE
    res.json({
      sgpa,                 // ⭐ USED IN DASHBOARD
      cgpa,
      attendance,
      aptitudeScore,
      tasks,
      events
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ msg: "Error loading dashboard" });
  }
};