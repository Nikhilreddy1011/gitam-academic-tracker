const Aptitude = require("../models/Aptitude");
const User = require("../models/User");

// ================= UPDATE SCORE =================
exports.updateScore = async (req, res) => {
  try {
    const { score } = req.body;

    let data = await Aptitude.findOne({ userId: req.user.id });

    if (data) {
      // update existing
      data.score = score;
      await data.save();
    } else {
      // create new
      data = await Aptitude.create({
        userId: req.user.id,
        score
      });
    }

    await User.findByIdAndUpdate(req.user.id, { aptitudeScore: score });

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error updating score" });
  }
};

// ================= GET SCORE =================
exports.getScore = async (req, res) => {
  try {
    const data = await Aptitude.findOne({ userId: req.user.id });

    res.json(data || { score: 0 });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching score" });
  }
};