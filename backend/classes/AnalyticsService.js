import fetch from "node-fetch";
import dotenv from "dotenv";
import Company from "../models/companyModel.js";
import HiringRecord from "../models/hiringRecordModel.js";

dotenv.config();

class AnalyticsService {

  // 🔹 Fetch data from API and store it in DB
  static async fetchAndStoreCompanyData(field) {
    try {
      console.log(`🔍 Fetching data for: ${field}`);

      // API URL + headers
      const url = `https://jsearch.p.rapidapi.com/search?query=${field}%20engineer%20jobs%20in%20India&page=1&num_pages=1`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": process.env.RAPID_API_HOST,
        },
      };

      // Step 1: Fetch data from RapidAPI JSearch
      const response = await fetch(url, options);
      const data = await response.json();

      if (!data || !data.data) {
        console.log("❌ No data returned from API");
        return;
      }

      // Step 2: Loop through jobs & process each one
      for (const job of data.data) {
        const companyName = job.employer_name || "Unknown Company";
        const title = job.job_title || "N/A";
        const salary = job.job_min_salary
          ? `${job.job_min_salary} - ${job.job_max_salary || ""}`
          : "Not specified";
        const location = job.job_city || "India";
        const year = new Date().getFullYear();

        // Step 3: Check if company exists in DB
        let company = await Company.findOne({ name: companyName });
        if (!company) {
          company = new Company({
            name: companyName,
            domain: field,
            avgPackage: 0,
            hiringStats: [],
          });
          await company.save();
        }

        // Step 4: Add new hiring record
        const record = new HiringRecord({
          companyId: company._id,
          year,
          package: salary,
          role: title,
          field,
          location,
        });
        await record.save();

        // Step 5: Link record to company
        company.hiringStats.push(record._id);
        await company.save();
      }

      console.log("✅ Data fetched and saved successfully!");

    } catch (err) {
      console.error("Error fetching company data:", err);
    }
  }

  // 🔹 Get analytics data from DB for frontend
  static async getAnalytics(field) {
    try {
      const companies = await Company.find({ domain: field })
        .populate("hiringStats")
        .lean();

      return companies.map((company) => ({
        name: company.name,
        domain: company.domain,
        avgPackage: company.avgPackage,
        hires: company.hiringStats.length,
        records: company.hiringStats.map((rec) => ({
          role: rec.role,
          package: rec.package,
          year: rec.year,
          location: rec.location,
        })),
      }));

    } catch (err) {
      console.error("Error fetching analytics:", err);
      return [];
    }
  }
}

export default AnalyticsService;
