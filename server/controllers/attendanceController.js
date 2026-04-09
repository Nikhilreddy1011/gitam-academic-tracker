const Attendance = require("../models/Attendance");

// ➕ ADD or UPDATE (UPSERT)
exports.addAttendance = async (req, res) => {
  try {
    const { subject, totalClasses = 0, attendedClasses = 0 } = req.body;

    const data = await Attendance.findOneAndUpdate(
      {
        userId: req.user.id,
        subject: subject.trim().toUpperCase()
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
    res.status(500).json({ msg: "Server error" });
  }
};

// 📥 GET ALL
exports.getAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({ userId: req.user.id });
    res.json(data);
  } catch {
    res.status(500).json({ msg: "Fetch error" });
  }
};

// ✏️ MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ msg: "Not found" });
    }

    const { type } = req.body;

    if (type === "present") {
      record.attendedClasses += 1;
      record.totalClasses += 1;
    } else if (type === "absent") {
      record.totalClasses += 1;
    }

    await record.save();

    res.json(record);
  } catch {
    res.status(500).json({ msg: "Update error" });
  }
};

// ❌ DELETE
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ msg: "Deleted" });
  } catch {
    res.status(500).json({ msg: "Delete error" });
  }
};