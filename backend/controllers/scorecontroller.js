import axios from "axios";
import User from "../models/usermodel.js";

export const saveUserHandles = async (req, res) => {
  try {
    const { userId } = req.params;
    const handles = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.socials = {
      ...user.socials,
      ...handles
    };

    await user.save();

    res.json({ success: true, socials: user.socials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("socials platformStats");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateUserReadiness = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const handles = user.socials || {};

    const baseURL = process.env.BASE_URL || "http://localhost:5000/api";

    const fetchers = {
  leetcode: handles.leetcode && `${baseURL}/leetcode/${handles.leetcode}`,
  github: handles.github && `${baseURL}/github/${handles.github}`,
  codeforces: handles.codeforces && `${baseURL}/codeforces/${handles.codeforces}`,
  hackerrank: handles.hackerrank && `${baseURL}/hackerrank/${handles.hackerrank}`,
  codechef: handles.codechef && `${baseURL}/codechef/${handles.codechef}`,
  atcoder: handles.atcoder && `${baseURL}/atcoder/${handles.atcoder}`,
  huggingface: handles.huggingface && `${baseURL}/huggingface/${handles.huggingface}`,
};


    const results = {};
    await Promise.all(
      Object.entries(fetchers)
        .filter(([_, url]) => url)
        .map(async ([key, url]) => {
          try {
            const { data } = await axios.get(url);
            results[key] = data;
          } catch {
            results[key] = { error: `${key} fetch failed` };
          }
        })
    );

    res.status(200).json({
      cp: {
        leetcode: results.leetcode || null,
        codeforces: results.codeforces || null,
        codechef: results.codechef || null,
        hackerrank: results.hackerrank || null,
        atcoder: results.atcoder || null,
      },
      dev: {
        github: results.github || null,
        huggingface: results.huggingface || null,
      },
    });

const finalScore = score; 

user.readinessScore = finalScore;
user.readinessScoreHistory.push({ score: finalScore });

await user.save();


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const saveReadinessScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { score } = req.body;      // frontend sends score

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.readinessScore = score;

    user.readinessScoreHistory.push({
      score,
      date: new Date()
    });

    await user.save();

    res.json({ success: true, readinessScore: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
