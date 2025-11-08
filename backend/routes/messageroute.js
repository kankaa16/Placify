import express from "express";
import mongoose from "mongoose";
import verifyToken from "../middlewares/verifyToken.js";
import Message from "../models/Message.js";

const router = express.Router();

// Get all messages for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate("sender", "fName lName role")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// Mark as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(msg);
  } catch {
    res.status(500).json({ error: "Failed to update" });
  }
});

// Admin → Student (Send message)
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;
    const msg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      type
    });
    res.status(201).json(msg);
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
