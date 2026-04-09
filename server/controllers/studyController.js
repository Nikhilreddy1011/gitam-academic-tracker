const Study = require("../models/Study");

// ================= ADD STUDY PLAN =================
exports.addPlan = async (req, res) => {
  try {
    const plan = await Study.create({
      ...req.body,
      userId: req.user.id
    });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: "Error adding study plan" });
  }
};

// ================= GET ALL PLANS =================
exports.getPlans = async (req, res) => {
  try {
    const plans = await Study.find({ userId: req.user.id });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching study plans" });
  }
};

// ================= DELETE PLAN =================
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Study.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ msg: "Plan not found" });
    }

    // 🔐 Ensure user owns the plan
    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Study.findByIdAndDelete(req.params.id);

    res.json({ msg: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting plan" });
  }
};