const Event = require("../models/Event");

// ================= ADD EVENT =================
exports.addEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      userId: req.user.id
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: "Error adding event" });
  }
};

// ================= GET EVENTS =================
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id });

    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching events" });
  }
};

// ================= DELETE EVENT =================
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // 🔐 Security check
    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting event" });
  }
};