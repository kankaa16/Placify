import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Fetch platform stats
export const getLeetCode = (username) => API.get(`/leetcode/${username}`).then(res => res.data);
export const getCodeforces = (username) => API.get(`/codeforces/${username}`).then(res => res.data);
export const getCodechef = (username) => API.get(`/codechef/${username}`).then(res => res.data);
export const getHackerRank = (username) => API.get(`/hackerrank/${username}`).then(res => res.data);
export const getAtCoder = (username) => API.get(`/atcoder/${username}`).then(res => res.data);
export const getGitHub = (username) => API.get(`/github/${username}`).then(res => res.data);
export const getHuggingFace = (username) => API.get(`/huggingface/${username}`).then(res => res.data);
