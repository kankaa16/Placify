import User from "../models/usermodel.js";
import axios from "axios";
import { load } from "cheerio";

// Utility to fetch stats per platform
const fetchPlatformStats = async (socials) => {
  const stats = {};

  try {
    // LeetCode
    if (socials.leetcode) {
  try {
    const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${socials.leetcode}`);
    if (res.data && res.data.status === "success") {
      stats.leetcode = res.data;
    } else {
      stats.leetcode = { error: "fetch failed" };
    }
  } catch (err) {
    console.log("LeetCode fetch error:", err.message);
    stats.leetcode = { error: "fetch failed" };
  }
}


    // Codeforces
    if (socials.codeforces) {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${socials.codeforces}`);
    if (res.data.status === "OK" && res.data.result?.length > 0) {
      const data = res.data.result[0];
      stats.codeforces = {
        rating: data.rating,
        maxRating: data.maxRating,
        rank: data.rank,
        maxRank: data.maxRank,
        contribution: data.contribution
      };
    } else {
      stats.codeforces = { error: "fetch failed" };
    }
  } catch (err) {
    console.log("Codeforces fetch error:", err.message);
    stats.codeforces = { error: "fetch failed" };
  }
}


    // CodeChef (scraping)
if (socials.codechef) {
  try {
    const { data } = await axios.get(`https://www.codechef.com/users/${socials.codechef}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = load(data); // use load, not cheerio.load

    const rating = $(".rating-number").first().text().trim() || "0";
    const maxRating = $(".rating-number").last().text().trim() || "0";
    const stars = $(".rating-star").length || 0;

    const fullySolvedText = $(".rating-data-section .content h5").filter((i, el) => {
      return $(el).text().includes("Fully Solved");
    }).next("p").text().trim();
    const totalSolved = fullySolvedText || "0";

    stats.codechef = { rating, maxRating, stars, totalSolved };
  } catch (err) {
    console.log("CodeChef fetch error:", err.message);
    stats.codechef = { error: "fetch failed", rating: 0, maxRating: 0, stars: 0, totalSolved: 0 };
  }
}



    // HackerRank
    if (socials.hackerrank) {
      const { data } = await axios.get(`https://www.hackerrank.com/rest/hackers/${socials.hackerrank}/profile`);
      stats.hackerrank = {
        reputation: data.model.reputation,
        badges: data.model.badges_count,
        leaderboard_rank: data.model.hacker_rank
      };
    }

    // AtCoder
    if (socials.atcoder) {
      const { data } = await axios.get(`https://atcoder.jp/users/${socials.atcoder}`);
      const $ = load(data);
      const rating = $("table.dl-table tr")
        .filter((i, el) => $(el).find("th").text().includes("Rating"))
        .find("td")
        .text()
        .trim();
      stats.atcoder = { rating };
    }

    // GitHub
    if (socials.github) {
      const { data } = await axios.get(`https://api.github.com/users/${socials.github}`);
      stats.github = {
        repos: data.public_repos,
        followers: data.followers,
        following: data.following
      };
    }

    // HuggingFace
    if (socials.other?.length) {
      const hf = socials.other.find(p => p.platformName.toLowerCase() === "huggingface");
      if (hf) {
        const { data } = await axios.get(`https://huggingface.co/api/users/${hf.handle}`);
        stats.huggingface = {
          name: data.name,
          followers: data.followers,
          repos: data.repositories?.length || 0
        };
      }
    }

  } catch (err) {
    console.log("Error fetching stats:", err.message);
  }

  return stats;
};

// PUT /api/score/readiness/:userId
export const updateUserReadiness = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const stats = await fetchPlatformStats(user.socials);

    // Update platformStats in DB
    user.platformStats = Object.entries(stats).map(([platform, value]) => {
      return {
        platform,
        solvedProblems: value.totalSolved || value.solvedProblems || 0,
        contests: value.contests || 0,
        rating: value.rating || value.maxRating || 0
      };
    });

    // Optional: compute readinessScore
    user.readinessScore = Math.round(user.platformStats.reduce((acc, s) => acc + s.rating, 0) / (user.platformStats.length || 1));

    // Save history
    user.readinessScoreHistory.push({ score: user.readinessScore });

    await user.save();
    res.json({ message: "User readiness updated", stats, readinessScore: user.readinessScore });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/score/:userId
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

