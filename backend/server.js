import dotenv from "dotenv";
dotenv.config();

import express from "express";
import * as cheerio from "cheerio";
import axios from "axios";
import cors from "cors";
import connectDB from "./config/db.js";
import authroute from "./routes/authroute.js";
import resumeRoutes from "./routes/resumeroute.js";
import scoreroute from "./routes/scoreroute.js";
import User from "./models/usermodel.js";

const app = express();

// connect database
connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// existing routes
app.use("/api/auth", authroute);
app.use("/api/resume", resumeRoutes);
app.use("/api/score", scoreroute);


// Fetch user profile
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (general info or socials)
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update or add a single platform's stats into user document
app.put("/api/profile/:userId/platform", async (req, res) => {
  try {
    const { platform, stats } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.platformStats.findIndex(p => p.platform === platform);
    if (index >= 0) {
      user.platformStats[index] = { platform, ...stats };
    } else {
      user.platformStats.push({ platform, ...stats });
    }

    await user.save();
    res.json(user.platformStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LeetCode
// app.get("/api/leetcode/:username", async (req, res) => {
//   const { username } = req.params;
//   try {
//     // Fetch user stats
//     const statsQuery = {
//       query: `
//       query userProfile($username: String!) {
//         matchedUser(username: $username) {
//           username
//           submitStats {
//             acSubmissionNum {
//               difficulty
//               count
//             }
//           }
//           submitStatsGlobal {
//             timestamp
//           }
//         }
//       }`,
//       variables: { username },
//     };

//     const { data } = await axios.post(
//       "https://leetcode.com/graphql",
//       statsQuery,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const matchedUser = data?.data?.matchedUser;
//     if (!matchedUser) throw new Error("User not found");

//     const acStats = matchedUser.submitStats.acSubmissionNum;
//     const easySolved = acStats.find(d => d.difficulty === "Easy")?.count || 0;
//     const mediumSolved = acStats.find(d => d.difficulty === "Medium")?.count || 0;
//     const hardSolved = acStats.find(d => d.difficulty === "Hard")?.count || 0;
//     const totalSolved = easySolved + mediumSolved + hardSolved;

//     const submissions = (matchedUser.submitStatsGlobal || []).map(ts => ({
//       timestamp: new Date(ts.timestamp * 1000).toISOString()
//     }));

//     // Build contributions calendar
//     const contributionsCalendar = {};
//     submissions.forEach(s => {
//       const date = s.timestamp.slice(0, 10);
//       contributionsCalendar[date] = (contributionsCalendar[date] || 0) + 1;
//     });

//     res.json({
//       easySolved,
//       mediumSolved,
//       hardSolved,
//       totalSolved,
//       submissions,
//       contributionsCalendar
//     });

//   } catch (err) {
//     console.error("LeetCode fetch failed:", err.message);
//     res.json({ 
//       easySolved:0, 
//       mediumSolved:0, 
//       hardSolved:0, 
//       totalSolved:0, 
//       submissions: [], 
//       contributionsCalendar: {} 
//     });
//   }
// });


// Codeforces
app.get("/api/codeforces/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const { data } = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
    const submissions = data.result || [];
    const contributionsCalendar = {};
    submissions.forEach(s => {
      const date = new Date(s.creationTimeSeconds*1000).toISOString().slice(0,10);
      contributionsCalendar[date] = (contributionsCalendar[date] || 0) + 1;
    });
    res.json({ total: submissions.length, contributionsCalendar });
  } catch (err) {
    console.error("Codeforces fetch failed:", err.message);
    res.json({ total: 0, contributionsCalendar: {} });
  }
});

// CodeChef
app.get("/api/codechef/:username", async (req,res)=>{
  const { username } = req.params;
  try{
    const { data } = await axios.get(`https://www.codechef.com/users/${username}`);
    const $ = cheerio.load(data);
    const rating = $(".rating-number").first().text().trim() || "0";
    const maxRating = $(".rating-number").last().text().trim() || "0";
    const stars = $(".rating-star").length || 0;
    res.json({ rating, maxRating, stars });
  } catch(err){
    console.error("CodeChef fetch failed:", err.message);
    res.json({ rating:0, maxRating:0, stars:0 });
  }
});

// HackerRank
app.get("/api/hackerrank/:username", async (req,res)=>{
  const { username } = req.params;
  try{
    const { data } = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/profile`);
    res.json({
      reputation: data?.model?.reputation || 0,
      badges: data?.model?.badges_count || 0,
      leaderboard_rank: data?.model?.hacker_rank || 0
    });
  } catch(err){
    console.error("HackerRank fetch failed:", err.message);
    res.json({ reputation:0, badges:0, leaderboard_rank:0 });
  }
});

// AtCoder
app.get("/api/atcoder/:username", async (req,res)=>{
  const { username } = req.params;
  try{
    const { data } = await axios.get(`https://atcoder.jp/users/${username}`);
    const $ = cheerio.load(data);
    const rating = $("table.dl-table tr")
                    .filter((i,el)=> $(el).find("th").text().includes("Rating"))
                    .find("td").text().trim() || "0";
    res.json({ rating });
  } catch(err){
    console.error("AtCoder fetch failed:", err.message);
    res.json({ rating:0 });
  }
});

// GitHub
// GitHub route
app.get("/api/github/:username", async (req,res) => {
  const { username } = req.params;
  try {
    // Fetch contributions calendar
    const { data: contribData } = await axios.get(`https://github-contributions-api.jogruber.de/v4/${username}`);
    const contributionsCalendar = {};
    (contribData.contributions || []).forEach(d => { contributionsCalendar[d.date] = d.count; });

    // Fetch profile info from GitHub API
    const { data: profileData } = await axios.get(`https://api.github.com/users/${username}`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } // optional if rate-limited
    });

    const stats = {
      contributionsCalendar,
      repos: profileData.public_repos || 0,
      followers: profileData.followers || 0,
      following: profileData.following || 0
    };

    res.json(stats);
  } catch(err){
    console.error("GitHub fetch failed:", err.message);
    res.json({
      contributionsCalendar:{},
      repos:0,
      followers:0,
      following:0
    });
  }
});



// HuggingFace
app.get("/api/huggingface/:username", async (req,res)=>{
  const { username } = req.params;
  try{
    const { data } = await axios.get(`https://huggingface.co/api/users/${username}`);
    res.json({
      name: data?.name || "-",
      followers: data?.followers || 0,
      repos: data?.repositories?.length || 0
    });
  } catch(err){
    console.error("HuggingFace fetch failed:", err.message);
    res.json({ name:"-", followers:0, repos:0 });
  }
});

app.get("/api/leetcode/:username", async (req, res) => {
  const { username } = req.params;

  const statsQuery = {
    query: `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            submissionCalendar
            totalActiveDays
            streak
          }
        }
      }
    `,
    variables: { username }
  };

  try {
    const { data } = await axios.post(
      "https://leetcode.com/graphql",
      statsQuery,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Referer": `https://leetcode.com/${username}/`
        }
      }
    );

    const matchedUser = data?.data?.matchedUser;
    if (!matchedUser) return res.status(404).json({ error: "LeetCode user not found" });

    const acStats = matchedUser.submitStats?.acSubmissionNum || [];
    const easySolved = acStats.find(d => d.difficulty === "Easy")?.count || 0;
    const mediumSolved = acStats.find(d => d.difficulty === "Medium")?.count || 0;
    const hardSolved = acStats.find(d => d.difficulty === "Hard")?.count || 0;
    const totalSolved = easySolved + mediumSolved + hardSolved;

    // Now we can extract submission calendar safely
    const calendarData = matchedUser.userCalendar?.submissionCalendar
      ? JSON.parse(matchedUser.userCalendar.submissionCalendar)
      : {};

    res.json({
      easySolved,
      mediumSolved,
      hardSolved,
      totalSolved,
      totalActiveDays: matchedUser.userCalendar?.totalActiveDays || 0,
      streak: matchedUser.userCalendar?.streak || 0,
      submissionCalendar: calendarData
    });
  } catch (err) {
    console.error("LeetCode fetch failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch LeetCode stats" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
