import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import Notification from "../models/notificationmodel.js";

const router = express.Router();

// Get all notifications for a logged-in user
router.get("/my", verifyToken, async (req, res) => {
  try {
    const notes = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Not found" });
    if (String(note.recipient) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    note.isRead = true;
    await note.save();
    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// Clear all notifications
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: "Cleared all notifications" });
  } catch {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

export default router;
