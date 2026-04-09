const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User"); // ✅ ADD THIS

/**
 * @swagger
 * tags:
 *   name: SGPA
 *   description: SGPA Calculator APIs
 */

// ✅ GET SGPA (FROM DATABASE)
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      sgpa: user.sgpa || 0
    });

  } catch (err) {
    res.status(500).json({ msg: "Error fetching SGPA" });
  }
});

/**
 * @swagger
 * /api/sgpa/calculate:
 *   post:
 *     summary: Calculate SGPA
 */
router.post("/calculate", auth, async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ msg: "Subjects data required" });
    }

    let totalCredits = 0;
    let weightedSum = 0;

    subjects.forEach(sub => {
      totalCredits += sub.credits;
      weightedSum += sub.credits * sub.grade;
    });

    const sgpa = (weightedSum / totalCredits).toFixed(2);

    // ✅ IMPORTANT: FIND USER
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ✅ SAVE SGPA
    user.sgpa = Number(sgpa);   // 🔥 IMPORTANT: store as number
    await user.save();

    console.log("SGPA SAVED:", user.sgpa); // DEBUG

    res.json({ sgpa: user.sgpa });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error calculating SGPA" });
  }
});


module.exports = router;