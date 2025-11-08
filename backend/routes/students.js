import express from "express";
import User from "../models/usermodel.js";
import Message from '../models/Message.js'
import verifyToken from "../middlewares/verifyToken.js";
import Notification from '../models/notificationmodel.js'
const router = express.Router();

// 1. Get all students (basic info)
// 🔍 Search students by name, roll number, email, or department
// 1️⃣ Get all students (basic info)
// Get all students
router.get("/all", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("fName lName dept readinessScore emailID");
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching students" });
  }
});


router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query?.trim()) return res.status(400).json({ error: "Search query required" });

  try {
    const regex = new RegExp(query, "i");
    const results = await User.find({
      role: "student",
      $or: [
        { fName: regex },
        { lName: regex },
        { rollNumber: regex },
        { emailID: regex },
        { dept: regex },
        { university: regex },
      ],
    }).select("fName lName dept readinessScore emailID rollNumber");

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error searching students" });
  }
});


// 2. Get single student full profile
router.get("/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// 3. Shortlist or Reject Student and Send Email
router.post("/:id/decision", verifyToken, async (req, res) => {
  const { decision } = req.body; // "shortlisted" or "rejected"

  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const senderId = req.user?.id; // admin's id

    if (decision === "shortlisted") {
      await Message.create({
        sender: senderId,
        receiver: student._id,
        content: "You’ve been shortlisted for the next interview round.",
        type: "interview_invite"
      });

      await Notification.create({
        recipient: student._id,
        title: "Shortlisted for Interview",
        message: `Hi ${student.fName}, you’ve been shortlisted for the next round. Please check your dashboard.`,
        type: "invite"
      });

      res.json({ success: true, message: "Student shortlisted and notified" });
    } 
    else if (decision === "rejected") {
      await Message.create({
        sender: senderId,
        receiver: student._id,
        content: "Unfortunately, you were not shortlisted this time. Keep trying!",
        type: "general"
      });

      await Notification.create({
        recipient: student._id,
        title: "Application Update",
        message: `Dear ${student.fName}, unfortunately you were not shortlisted this time.`,
        type: "general"
      });

      res.json({ success: true, message: "Student rejected and notified" });
    } 
    else {
      res.status(400).json({ error: "Invalid decision" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while processing decision" });
  }
});
// DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});


export default router;
