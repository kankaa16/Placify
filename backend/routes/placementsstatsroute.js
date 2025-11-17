import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import PlacementStat from "../models/placementStatsModel.js";
import User from '../models/usermodel.js'
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

router.get("/count/students", async (req, res) => {
  const count = await User.countDocuments({ role: "student" });
  res.json({ count });
});


router.get("/stats/placements", async (req, res) => {
  try {
    const offers = await PlacementStat.find();

    const placedCount = offers.length;

    let avg = 0;
    let high = 0;
    let low = 0;

    if (offers.length > 0) {
      const list = offers.map(o => Number(o.offeredCTC));

      const sum = list.reduce((a, b) => a + b, 0);
      avg = sum / list.length;

      high = Math.max(...list);
      low = Math.min(...list);
    }

    res.json({
      placedCount,
      avgPackage: avg.toFixed(2),
      highestPackage: high,
      lowestPackage: low
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to load placement stats" });
  }
});


export default router;
