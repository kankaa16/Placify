import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import Application from "../models/Application.js";
import Notification from '../models/notificationmodel.js';
import PlacementStat from "../models/placementStatsModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import User from "../models/usermodel.js"


import streamifier from "streamifier";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    //  create a new notification in DB for that student
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

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "offerLetters",
      resource_type: isPdf ? "raw" : "image",
      allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    };
  },
});


const upload = multer({ storage: multer.memoryStorage() });
// STUDENT uploads offer letter
router.patch("/:id/upload-offer", verifyToken, upload.single("offerLetter"), async (req, res) => {
  try {
    const { companyName, offeredRole, offeredCTC, offerNote } = req.body;
    const admin = await User.findOne({ role: "admin" });
    const app = await Application.findById(req.params.id).populate("student", "fName lName emailID");

    if (!app) return res.status(404).json({ error: "Application not found" });
    if (String(app.student._id) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const isPdf = req.file.mimetype === "application/pdf";

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "offerLetters",
          resource_type: isPdf ? "raw" : "image",
          type: "upload",
          access_mode: "public",
          use_filename: true,
          public_id: `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`,
          format: isPdf ? "pdf" : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    app.companyName = companyName;
    app.offeredRole = offeredRole;
    app.offeredCTC = offeredCTC;
    app.offerNote = offerNote;
    app.offerLetterUrl = uploadResult.secure_url; // ✅ store full link
    app.status = "offer_uploaded";
    app.uploadedAt = new Date();
    await app.save();

    await Notification.create({
      recipient: app.student._id,
      title: "Offer Uploaded",
      message: `Offer for ${offeredRole} uploaded successfully.`,
      type: "offer",
    });

    if (admin) {
      await Notification.create({
        recipient: admin._id,
        title: "New Offer Uploaded",
        message: `${app.student.fName} ${app.student.lName} uploaded offer for ${companyName} (${offeredCTC} LPA).`,
        type: "offer",
      });
    }

    res.json({ message: "Offer uploaded successfully", app });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});
// Mark student as shortlisted 
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



// Send interview invite
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


// Admin verifies uploaded offer letter
router.patch("/:id/verify-offer", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });

    const { action } = req.body;
    const app = await Application.findById(req.params.id)
      .populate("student", "fName lName emailID dept")
      .populate("company", "name");

    if (!app) return res.status(404).json({ error: "Application not found" });

    if (action === "approve") {
      app.status = "final_verified";
      app.verifiedAt = new Date();
      await app.save();

      // ✅ Automatically add record to PlacementStats
      await PlacementStat.create({
        student: app.student._id,
        companyName: app.companyName || app.company?.name || "Unknown Company",
        offeredRole: app.offeredRole,
        offeredCTC: app.offeredCTC,
        verifiedAt: new Date(),
      });
    } else if (action === "reject") {
      app.status = "interview_accepted";
      await app.save();
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json({ message: `Offer ${action}d successfully`, app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Offer verification failed" });
  }
});

router.get("/offers/pending", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });

    const offers = await Application.find({ status: "offer_uploaded" })
      .populate("student", "fName lName emailID dept")
      .sort({ uploadedAt: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});



export default router;
