import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import Application from "../models/Application.js";
import Notification from '../models/notificationmodel.js';
const router = express.Router();

//fetch all students 
router.get("/me", verifyToken, async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user.id })
      .populate("company", "name role")
      .sort({ updatedAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to load applications" });
  }
});

// Student marks themselves as selected after final round
// ADMIN shortlists student for next interview round
router.patch("/:id/mark-shortlisted", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const app = await Application.findById(req.params.id)
      .populate("student", "fName lName emailID")
      .populate("company", "name");

    if (!app) return res.status(404).json({ error: "Application not found" });

    app.status = "shortlisted";
    await app.save();

    // Create notification for student
    await Notification.create({
      recipient: app.student._id,
      title: "Shortlisted for Next Round",
      message: `You’ve been shortlisted for the next interview round at ${app.company?.name || "the company"}.`,
      interviewDate: req.body.interviewDate,  interviewLink: req.body.interviewLink,     
      type: "invite",
    });

    res.json({ message: "Student shortlisted successfully", app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while shortlisting student"});
  }
});


// ======================
// ADMIN ROUTES
// ======================

// Admin fetches all pending selections for verification
router.get("/pending-verification", verifyToken, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    const items = await Application.find({ status: "selected_by_student" })
      .populate("student", "fName lName emailID dept")
      .populate("company", "name role");

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending selections" });
  }
});

// Admin verifies or rejects the reported selection
router.patch("/:id/verify", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });

    const { action } = req.body;
    if (action === "approve") {
      app.status = "final_selected";
      app.adminVerifiedAt = new Date();
    } else if (action === "reject") {
      app.status = "shortlisted";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await app.save();
    res.json({ message: `Selection ${action}d successfully`, app });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// ADMIN sends interview invite

router.patch("/:id/send-invite", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "interview_invited" },
      { new: true }
    ).populate("student", "fName lName emailID");

    // ✅ create a new notification in DB for that student
    await Notification.create({
      recipient: app.student._id,
      title: "Interview Invitation",
      message: `Hi ${app.student.fName}, you have been invited for the next interview round for ${app.company?.name || "the company"}. Please check your dashboard for details.`,
      type: "invite",
    });

    res.json({ message: "Interview invite sent and notification created", app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});



// STUDENT accepts invite
router.patch("/:id/accept-invite", verifyToken, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (String(app.student) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    app.status = "interview_accepted";
    await app.save();
    res.json({ message: "Interview accepted", app });
  } catch (err) {
    res.status(500).json({ error: "Could not accept invite" });
  }
});

// STUDENT uploads offer letter
router.patch("/:id/upload-offer", verifyToken, async (req, res) => {
  try {
    const { offeredRole, offeredCTC, offerLetterUrl, offerNote } = req.body;
    const app = await Application.findById(req.params.id);
    if (String(app.student) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    app.status = "offer_uploaded";
    app.offeredRole = offeredRole;
    app.offeredCTC = offeredCTC;
    app.offerLetterUrl = offerLetterUrl;
    app.offerNote = offerNote;
    app.uploadedAt = new Date();

    await app.save();
    res.json({ message: "Offer uploaded successfully", app });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// ADMIN verifies final offer
router.patch("/:id/verify-offer", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const { action } = req.body;
    const app = await Application.findById(req.params.id);

    if (action === "approve") {
      app.status = "final_verified";
      app.verifiedAt = new Date();
    } else if (action === "reject") {
      app.status = "interview_accepted";
    }

    await app.save();
    res.json({ message: `Offer ${action}d`, app });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// --- Admin actions using student ID directly ---

// Mark student as shortlisted (no need for app ID)
router.patch("/by-student/:studentId/send-invite", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const { companyName, role, interviewDate, interviewLink } = req.body;

    const app = await Application.findOne({ student: req.params.studentId })
      .populate("student", "fName lName");

    if (!app)
      return res.status(404).json({ error: "No application found for this student" });

    app.status = "interview_invited";
    await app.save();

    await Notification.create({
      recipient: req.params.studentId,
      title: "Interview Invitation",
      message: `Hi ${app.student.fName}, you’ve been invited for the next interview round at ${companyName || "the company"} for the role of ${role || "N/A"}.`,
      type: "invite",
      companyName,
      role,
      interviewDate,
      interviewLink,
    });

    res.json({ message: "Interview invite sent successfully", app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});



// Send interview invite (by student)
router.patch("/by-student/:studentId/send-invite", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const app = await Application.findOne({ student: req.params.studentId })
      .populate("student", "fName lName")
      .populate("company", "name");

    if (!app) return res.status(404).json({ error: "No application found for this student" });

    app.status = "interview_invited";
    await app.save();

    await Notification.create({
      recipient: req.params.studentId,
      title: "Interview Invitation",
      message: `Hi ${app.student.fName}, you’ve been invited for the next interview round for ${app.company?.name || "the company"}.`,
      type: "invite",
    });

    res.json({ message: "Interview invite sent successfully", app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});



export default router;
