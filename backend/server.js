import dotenv from "dotenv";
dotenv.config();

import express from "express";
import *as cheerio from 'cheerio';
import axios from 'axios';
import cors from "cors";
import connectDB from "./config/db.js"; 
import authroute from "./routes/authroute.js";
import resumeRoutes from './routes/resumeroute.js'
import scoreroute from './routes/scoreroute.js';
const app = express();
const PORT = 5000;

connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

app.use("/api/auth", authroute);
app.use("/api/resume", resumeRoutes);
app.use("/api/score", scoreroute);


app.get("/api/leetcode/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "LeetCode fetch failed" });
  }
});

// Codeforces
app.get("/api/codeforces/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const data = response.data.result[0];
    res.json({
      handle: data.handle,
      rating: data.rating,
      maxRating: data.maxRating,
      rank: data.rank,
      maxRank: data.maxRank,
      contribution: data.contribution,
    });
  } catch (err) {
    res.status(500).json({ error: "Codeforces fetch failed" });
  }
});

// CodeChef (scraping)
app.get("/api/codechef/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const url = `https://www.codechef.com/users/${username}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rating = $(".rating-number").first().text().trim();
    const maxRating = $(".rating-number").last().text().trim();
    const stars = $(".rating-star").length;
    res.json({ rating, maxRating, stars });
  } catch (err) {
    res.status(500).json({ error: "CodeChef fetch failed" });
  }
});

// HackerRank (scraping)
app.get("/api/hackerrank/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const url = `https://www.hackerrank.com/rest/hackers/${username}/profile`;
    const { data } = await axios.get(url);
    res.json({
      reputation: data.model.reputation || 0,
      badges: data.model.badges_count || 0,
      leaderboard_rank: data.model.hacker_rank || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "HackerRank fetch failed" });
  }
});

// AtCoder (scraping)
app.get("/api/atcoder/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const url = `https://atcoder.jp/users/${username}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rating = $("table.dl-table tr")
      .filter((i, el) => $(el).find("th").text().includes("Rating"))
      .find("td")
      .text()
      .trim();
    res.json({ rating });
  } catch (err) {
    res.status(500).json({ error: "AtCoder fetch failed" });
  }
});

// GitHub
app.get("/api/github/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const response = await axios.get(`https://api.github.com/users/${username}`);
    res.json({
      repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
    });
  } catch (err) {
    res.status(500).json({ error: "GitHub fetch failed" });
  }
});

// HuggingFace
app.get("/api/huggingface/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const response = await axios.get(`https://huggingface.co/api/users/${username}`);
    res.json({
      name: response.data.name,
      followers: response.data.followers,
      repos: response.data.repositories?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "HuggingFace fetch failed" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
