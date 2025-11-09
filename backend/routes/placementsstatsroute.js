import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import PlacementStat from "../models/placementStatsModel.js";

const router = express.Router();

router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });

    const stats = await PlacementStat.find()
      .populate("student", "fName lName dept emailID")
      .sort({ verifiedAt: -1 });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;
