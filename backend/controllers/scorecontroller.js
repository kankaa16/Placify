import axios from "axios";
import User from "../models/usermodel.js";

export const saveUserHandles = async (req, res) => {
  try {
    const { userId } = req.params;
    const handles = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.platformHandles = handles;
    await user.save();

    res.status(200).json({ message: "Handles saved successfully", handles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save handles" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("fName lName platformHandles");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserReadiness = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const handles = user.platformHandles || {};
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
