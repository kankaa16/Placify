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

// LeetCode
app.get("/api/leetcode/:username", async (req,res)=>{
    const { username } = req.params;
    try {
        const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
        res.json({
            totalSolved: data?.totalSolved || 0,
            acRate: data?.acRate || 0,
            easySolved: data?.easySolved || 0,
            mediumSolved: data?.mediumSolved || 0,
            hardSolved: data?.hardSolved || 0
        });
    } catch(err){
        console.error("LeetCode fetch failed:", err.message);
        res.json({ totalSolved:0, acRate:0, easySolved:0, mediumSolved:0, hardSolved:0 });
    }
});

// Codeforces
app.get("/api/codeforces/:username", async (req,res)=>{
    const { username } = req.params;
    try{
        const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
        const user = data?.result?.[0] || {};
        res.json({
            handle: user.handle || username,
            rating: user.rating || 0,
            maxRating: user.maxRating || 0,
            rank: user.rank || "N/A",
            maxRank: user.maxRank || "N/A",
            contribution: user.contribution || 0
        });
    } catch(err){
        console.error("Codeforces fetch failed:", err.message);
        res.json({ rating:0, maxRating:0, rank:"N/A", maxRank:"N/A", contribution:0 });
    }
});

// CodeChef (scraping)
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

// Github
app.get("/api/github/:username", async (req,res)=>{
    const { username } = req.params;
    try{
        const { data } = await axios.get(`https://api.github.com/users/${username}`);
        res.json({
            repos: data?.public_repos || 0,
            followers: data?.followers || 0,
            following: data?.following || 0
        });
    } catch(err){
        console.error("GitHub fetch failed:", err.message);
        res.json({ repos:0, followers:0, following:0 });
    }
});

// Huggingface
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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));