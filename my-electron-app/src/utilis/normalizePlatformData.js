function safeNumber(v) { return typeof v === "number" ? v : parseInt(v) || 0; }

function normalizeLeet(raw) {
  const out = { easySolved:0, mediumSolved:0, hardSolved:0, totalSolved:0, contributionsCalendar:{}, submissions:[] };
  if (!raw) return out;

  out.easySolved = safeNumber(raw.easySolved || raw.easy || 0);
  out.mediumSolved = safeNumber(raw.mediumSolved || raw.medium || 0);
  out.hardSolved = safeNumber(raw.hardSolved || raw.hard || 0);
  out.totalSolved = safeNumber(raw.totalSolved || out.easySolved + out.mediumSolved + out.hardSolved);

  if (raw.contributionsCalendar) out.contributionsCalendar = raw.contributionsCalendar;
  if (raw.submissions) {
    out.submissions = raw.submissions.map(s => ({
      timestamp: s.timestamp ? s.timestamp : Date.parse(s)
    })).filter(Boolean);
  }

  return out;
}

function normalizeGitHub(raw){
  const out = { easySolved:0, mediumSolved:0, hardSolved:0, totalSolved:0, contributionsCalendar:{}, submissions:[] };
  if(!raw) return out;

  out.totalSolved = raw.totalContributions || raw.public_repos || 0;
  out.contributionsCalendar = raw.contributionsCalendar || {};

  // Always check if commits exists
  const activities = Array.isArray(raw.commits) ? raw.commits : Array.isArray(raw.activities) ? raw.activities : [];
  out.submissions = activities.map(a => ({ timestamp: a.timestamp || Date.parse(a.date) })).filter(Boolean);

  return out;
}


function normalizeCodechef(raw) {
  const out = { easySolved:0, mediumSolved:0, hardSolved:0, totalSolved:0, contributionsCalendar:{}, submissions:[] };
  if (!raw) return out;

  out.totalSolved = safeNumber(raw.totalSolved || raw.problemsSolvedCount || 0);
  if (Array.isArray(raw.solvedProblems)) {
    out.submissions = raw.solvedProblems.map(p => ({ timestamp: p.solvedAt ? Date.parse(p.solvedAt) : p.timestamp })).filter(Boolean);
  }

  if (Array.isArray(raw.dailyCounts)) {
    raw.dailyCounts.forEach(d => { if(d.date && d.count) out.contributionsCalendar[d.date] = Number(d.count); });
  }

  return out;
}

module.exports = {
  normalizeLeet,
  normalizeGitHub,
  normalizeCodechef,
  normalizePlatform(raw, platform) {
    switch((platform||"").toLowerCase()){
      case "leetcode": return normalizeLeet(raw);
      case "github": return normalizeGitHub(raw);
      case "codechef": return normalizeCodechef(raw);
      default: return normalizeLeet(raw);
    }
  }
};
