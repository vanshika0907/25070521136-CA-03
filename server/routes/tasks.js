import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import requireAuth from "../middleware/requireAuth.js";
const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try { res.json(await Task.find({ user: req.userId }).sort({ createdAt: -1 })); }
  catch { res.status(500).json({ message: "Could not load tasks." }); }
});

router.post("/", async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ message: "Task title is required." });
    const task = await Task.create({
      title, description: String(req.body.description || "").trim(),
      priority: ["Low", "Medium", "High"].includes(req.body.priority) ? req.body.priority : "Medium",
      dueDate: String(req.body.dueDate || ""), completed: Boolean(req.body.completed), user: req.userId
    });
    res.status(201).json(task);
  } catch { res.status(500).json({ message: "Could not create task." }); }
});

router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const updates = {};
    for (const key of ["title", "description", "priority", "dueDate", "completed"]) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (typeof updates.title === "string") updates.title = updates.title.trim();
    if (updates.title === "") return res.status(400).json({ message: "Task title cannot be empty." });
    if (updates.priority && !["Low", "Medium", "High"].includes(updates.priority)) {
      return res.status(400).json({ message: "Invalid priority." });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, { $set: updates }, { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch { res.status(500).json({ message: "Could not update task." }); }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch { res.status(500).json({ message: "Could not delete task." }); }
});
export default router;
