const User = require("../models/User");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching profile" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, cgpa, sgpa } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bio, cgpa, sgpa },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error updating profile" });
  }
};

// UPDATE ACADEMIC
exports.updateAcademic = async (req, res) => {
  try {
    const { regNo, branch, batch, semester, cgpa, sgpa } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { regNo, branch, batch, semester, cgpa, sgpa },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error updating academic details" });
  }
};