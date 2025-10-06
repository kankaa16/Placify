import User from "../models/usermodel.js";
import axios from "axios";

// Fetch platform stats
async function fetchLeetCodeStats(username) {
  try {
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }`,
      variables: { username }
    };
    const res = await axios.post("https://leetcode.com/graphql", query, {
      headers: { "Content-Type": "application/json" }
    });
    const stats = res.data.data.matchedUser?.submitStats?.acSubmissionNum || [];
    const totalSolved = stats.reduce((sum, item) => sum + item.count, 0);
    return { platform: "leetcode", solvedProblems: totalSolved, contests: 0, rating: 0 };
  } catch {
    return { platform: "leetcode", solvedProblems: 0, contests: 0, rating: 0 };
  }
}

async function fetchCodeforcesStats(handle) {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    const user = res.data.result[0];
    return { platform: "codeforces", solvedProblems: 0, contests: user.contestCount || 0, rating: user.rating || 0 };
  } catch {
    return { platform: "codeforces", solvedProblems: 0, contests: 0, rating: 0 };
  }
}

async function fetchGitHubStats(username) {
  try {
    const res = await axios.get(`https://api.github.com/users/${username}`);
    return { platform: "github", solvedProblems: res.data.public_repos || 0, contests: 0, rating: 0 };
  } catch {
    return { platform: "github", solvedProblems: 0, contests: 0, rating: 0 };
  }
}

async function fetchCodeChefStats(handle) { return { platform: "codechef", solvedProblems: 0, contests: 0, rating: 0 }; }
async function fetchHackerRankStats(handle) { return { platform: "hackerrank", solvedProblems: 0, contests: 0, rating: 0 }; }

// Calculate readiness
function calculateReadiness(user, stats) {
  let score = 0;
  stats.forEach(p => { score += (p.solvedProblems * 0.5) + (p.contests * 2) + (p.rating * 0.05); });
  if (user.assessments) {
    const avg = user.assessments.reduce((a, b) => a + b.score, 0) / (user.assessments.length || 1);
    score += avg * 0.5;
  }
  score += Math.min((user.skills?.length || 0) * 2, 20);
  return Math.min(100, Math.round(score));
}

// Update readiness and platformStats
export const updateUserReadiness = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const stats = [];
    if (user.socials.leetcode) stats.push(await fetchLeetCodeStats(user.socials.leetcode));
    if (user.socials.codeforces) stats.push(await fetchCodeforcesStats(user.socials.codeforces));
    if (user.socials.github) stats.push(await fetchGitHubStats(user.socials.github));
    if (user.socials.codechef) stats.push(await fetchCodeChefStats(user.socials.codechef));
    if (user.socials.hackerrank) stats.push(await fetchHackerRankStats(user.socials.hackerrank));

    if (user.socials.other) {
      user.socials.other.forEach(d => stats.push({
        platform: d.platformName,
        solvedProblems: d.solvedProblems || 0,
        contests: d.contests || 0,
        rating: d.rating || 0
      }));
    }

    user.platformStats = stats;
    user.readinessScore = calculateReadiness(user, stats);
    user.readinessScoreHistory.push({ score: user.readinessScore });
    await user.save();

    res.json({ readinessScore: user.readinessScore, platformStats: stats });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Fetch user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
