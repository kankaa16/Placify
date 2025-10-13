function safeNumber(v) {
  return typeof v === "number" ? v : parseInt(v) || 0;
}

// ---------- LEETCODE ----------
export function normalizeLeet(raw) {
  const out = { easySolved: 0, mediumSolved: 0, hardSolved: 0, totalSolved: 0, contributionsCalendar: {}, submissions: [] };
  if (!raw) return out;

  out.easySolved = safeNumber(raw.easySolved || raw.easy || 0);
  out.mediumSolved = safeNumber(raw.mediumSolved || raw.medium || 0);
  out.hardSolved = safeNumber(raw.hardSolved || raw.hard || 0);
  out.totalSolved = safeNumber(raw.totalSolved || out.easySolved + out.mediumSolved + out.hardSolved);

  if (raw.contributionsCalendar) out.contributionsCalendar = raw.contributionsCalendar;
  if (raw.submissions) {
    out.submissions = raw.submissions
      .map(s => ({ timestamp: s.timestamp ? s.timestamp : Date.parse(s) }))
      .filter(Boolean);
  }

  return out;
}

// ---------- CODEFORCES ----------
export function normalizeCodeforces(raw) {
  const out = { totalSolved: 0, rating: 0, maxRating: 0, rank: "", contributionsCalendar: {}, submissions: [] };
  if (!raw) return out;

  out.totalSolved = safeNumber(raw.totalSolved || raw.problemsSolved || raw.solvedCount || 0);
  out.rating = safeNumber(raw.rating || 0);
  out.maxRating = safeNumber(raw.maxRating || 0);
  out.rank = raw.rank || raw.title || "";

  if (Array.isArray(raw.submissions)) {
    out.submissions = raw.submissions
      .map(s => ({ timestamp: s.timestamp || Date.parse(s.creationTimeSeconds * 1000) }))
      .filter(Boolean);
  }

  if (Array.isArray(raw.dailyCounts)) {
    raw.dailyCounts.forEach(d => {
      if (d.date && d.count) out.contributionsCalendar[d.date] = Number(d.count);
    });
  }

  return out;
}

// ---------- CODECHEF ----------
export function normalizeCodeChef(raw) {
  const out = { totalSolved: 0, stars: 0, rating: 0, highestRating: 0, contributionsCalendar: {}, submissions: [] };
  if (!raw) return out;

  out.totalSolved = safeNumber(raw.totalSolved || raw.problemsSolvedCount || 0);
  out.stars = safeNumber(raw.ratingStars || raw.stars || 0);
  out.rating = safeNumber(raw.rating || 0);
  out.highestRating = safeNumber(raw.highestRating || 0);
  out.totalSolved = safeNumber(raw.totalSolved || raw.problemsSolvedCount || 0);


  if (Array.isArray(raw.solvedProblems)) {
    out.submissions = raw.solvedProblems
      .map(p => ({ timestamp: p.solvedAt ? Date.parse(p.solvedAt) : p.timestamp }))
      .filter(Boolean);
  }

  if (Array.isArray(raw.dailyCounts)) {
    raw.dailyCounts.forEach(d => {
      if (d.date && d.count) out.contributionsCalendar[d.date] = Number(d.count);
    });
  }

  return out;
}

// ---------- GITHUB ----------
export function normalizeGitHub(raw) {
  const out = {
    repos: 0,
    followers: 0,
    following: 0,
    totalSolved: 0,
    contributionsCalendar: {},
    submissions: []
  };
  if (!raw) return out;

  out.repos = safeNumber(raw.repos);
  out.followers = safeNumber(raw.followers);
  out.following = safeNumber(raw.following);
  out.contributionsCalendar = raw.contributionsCalendar || {};
  out.totalSolved = out.repos;

  // Convert contributionsCalendar to submissions for heatmap
  out.submissions = Object.entries(out.contributionsCalendar).flatMap(([date, count]) =>
    Array.from({ length: count }, () => ({ timestamp: new Date(date).getTime() }))
  );

  return out;
}




// ---------- ATCODER ----------
export function normalizeAtCoder(raw) {
  const out = { totalSolved: 0, rating: 0, maxRating: 0, rank: "", contributionsCalendar: {}, submissions: [] };
  if (!raw) return out;

  out.totalSolved = safeNumber(raw.totalSolved || raw.problemCount || 0);
  out.rating = safeNumber(raw.rating || 0);
  out.maxRating = safeNumber(raw.maxRating || 0);
  out.rank = raw.rank || "";

  if (Array.isArray(raw.submissions)) {
    out.submissions = raw.submissions
      .map(s => ({ timestamp: s.timestamp || Date.parse(s.date) }))
      .filter(Boolean);
  }

  if (Array.isArray(raw.dailyCounts)) {
    raw.dailyCounts.forEach(d => {
      if (d.date && d.count) out.contributionsCalendar[d.date] = Number(d.count);
    });
  }

  return out;
}

// ---------- HUGGINGFACE ----------
export function normalizeHuggingFace(raw) {
  const out = { totalModels: 0, totalSpaces: 0, followers: 0, contributionsCalendar: {}, submissions: [] };
  if (!raw) return out;

  out.totalModels = safeNumber(raw.models || raw.totalModels || 0);
  out.totalSpaces = safeNumber(raw.spaces || raw.totalSpaces || 0);
  out.followers = safeNumber(raw.followers || 0);

  out.contributionsCalendar = raw.contributionsCalendar || {};

  if (Array.isArray(raw.activities)) {
    out.submissions = raw.activities
      .map(a => ({ timestamp: a.timestamp || Date.parse(a.date) }))
      .filter(Boolean);
  }

  return out;
}

// ---------- UNIVERSAL NORMALIZER ----------
export function normalizePlatform(raw, platform) {
  switch ((platform || "").toLowerCase()) {
    case "leetcode":
      return normalizeLeet(raw);
    case "codeforces":
      return normalizeCodeforces(raw);
    case "codechef":
      return normalizeCodeChef(raw);
    case "github":
      return normalizeGitHub(raw);
    case "atcoder":
      return normalizeAtCoder(raw);
    case "huggingface":
      return normalizeHuggingFace(raw);
    default:
      return { totalSolved: 0, contributionsCalendar: {}, submissions: [] };
  }
}

// ---------- SYNTHESIZER (for fallback) ----------
export function synthesizeSubmissions(total) {
  const submissions = [];
  const today = new Date();
  for (let i = 0; i < total; i++) {
    const randomDays = Math.floor(Math.random() * 90);
    const date = new Date(today - randomDays * 24 * 60 * 60 * 1000);
    submissions.push({ timestamp: date.getTime() });
  }
  return submissions;
}
