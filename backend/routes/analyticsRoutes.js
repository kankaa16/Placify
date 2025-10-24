import express from "express";
import analyticsController from "../controllers/analyticsController.js";
import Company from "../models/Company.js";

const router = express.Router();

// ✅ Route 1: Fetch & store company data from JSearch API
router.get("/fetch/:field", analyticsController.fetchAndStoreData);

// ✅ Route 2: Get analytics data (summary for frontend charts)
router.get("/get/:field", analyticsController.getAnalytics);

/// ✅ Route 3: Get all available fields
router.get("/fields", async (req, res) => {
  try {
    const fields = await Company.distinct("industry");
    res.json({ fields });
  } catch (err) {
    console.error("❌ Error fetching fields:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Route 4: Get all company names
router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.distinct("name");
    res.json({ companies });
  } catch (err) {
    console.error("❌ Error fetching companies:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET analytics for a single company by name
router.get("/company/:name", analyticsController.getAnalyticsByCompany);


export default router;
