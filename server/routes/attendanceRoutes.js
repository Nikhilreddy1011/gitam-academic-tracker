const router = require("express").Router();
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");

// 🔧 helper to normalize subject
const normalize = (s) => s.trim().toUpperCase();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance APIs
 */

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Add or update attendance (UPSERT)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             subject: DBMS
 *             totalClasses: 40
 *             attendedClasses: 30
 *     responses:
 *       200:
 *         description: Attendance saved or updated successfully
 *       400:
 *         description: Subject required or already exists
 */
router.post("/", auth, async (req, res) => {
  try {
    const { subject, totalClasses = 0, attendedClasses = 0 } = req.body;

    if (!subject) {
      return res.status(400).json({ msg: "Subject required" });
    }

    const data = await Attendance.findOneAndUpdate(
      {
        userId: req.user.id,
        subject: normalize(subject)
      },
      {
        $set: {
          totalClasses,
          attendedClasses
        }
      },
      { upsert: true, new: true }
    );

    res.json(data);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Subject already exists" });
    }

    res.status(500).json({ msg: "Error saving attendance" });
  }
});

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records with percentage
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance list
 *         content:
 *           application/json:
 *             example:
 *               - id: 661234abcd1234
 *                 subject: DBMS
 *                 total: 40
 *                 attended: 30
 *                 percentage: 75
 */
router.get("/", auth, async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user.id });

    const result = records.map(r => ({
      id: r._id,
      subject: r.subject,
      total: r.totalClasses,
      attended: r.attendedClasses,
      percentage: r.totalClasses
        ? Number(((r.attendedClasses / r.totalClasses) * 100).toFixed(2))
        : 0
    }));

    res.json(result);

  } catch {
    res.status(500).json({ msg: "Error fetching attendance" });
  }
});

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete a subject attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Attendance ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Attendance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ msg: "Deleted successfully" });

  } catch {
    res.status(500).json({ msg: "Delete error" });
  }
});

module.exports = router;