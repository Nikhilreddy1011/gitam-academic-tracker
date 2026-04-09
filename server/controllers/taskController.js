const Task = require("../models/Task");


// ➕ CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Create task failed" });
  }
};


// 📥 GET TASKS (ONLY USER TASKS)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Fetch tasks failed" });
  }
};


// ✏️ UPDATE TASK (SECURE)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id   // 🔥 ensure only owner can update
      },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found or not yours" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
};


// ❌ DELETE TASK (SECURE)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id   // 🔥 ensure only owner can delete
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found or not yours" });
    }

    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
};