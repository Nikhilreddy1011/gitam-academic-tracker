const User = require("../models/User");

// ✅ CALCULATE + SAVE SGPA
exports.calculateSGPA = async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ msg: "No subjects provided" });
    }

    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach((s) => {
      totalCredits += s.credits;
      totalPoints += s.credits * s.grade;
    });

    const sgpa = (totalPoints / totalCredits).toFixed(2);

    // ✅ SAVE TO USER
    const user = await User.findById(req.user.id);

    user.sgpa = sgpa;
    await user.save();

    res.json({
      msg: "SGPA calculated and saved",
      sgpa,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ GET SGPA
exports.getSGPA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      sgpa: user.sgpa || 0,
    });

  } catch (err) {
    res.status(500).json({ msg: "Error fetching SGPA" });
  }
};