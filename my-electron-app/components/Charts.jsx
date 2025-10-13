// src/components/Charts.jsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./Charts.css";
const COLORS = ["#00C49F", "#FFBB28", "#FF4F4F"];

function readCounts(p) {
  if (!p) return { easy: 0, medium: 0, hard: 0 };
  if (typeof p.easySolved === "number" || typeof p.mediumSolved === "number" || typeof p.hardSolved === "number") {
    return { easy: p.easySolved || 0, medium: p.mediumSolved || 0, hard: p.hardSolved || 0 };
  }
  if (p.contributions) {
    return { easy: p.contributions.easy || 0, medium: p.contributions.medium || 0, hard: p.contributions.hard || 0 };
  }
  if (Array.isArray(p.problemsSolved)) {
    const agg = { easy: 0, medium: 0, hard: 0 };
    for (const item of p.problemsSolved) {
      const d = (item.difficulty || "").toLowerCase();
      if (d.includes("easy")) agg.easy++;
      else if (d.includes("medium")) agg.medium++;
      else if (d.includes("hard")) agg.hard++;
    }
    return agg;
  }
  return { easy: 0, medium: 0, hard: 0 };
}

export default function Charts({ stats }) {
  const platforms = Object.values(stats || {});
  const total = { easy: 0, medium: 0, hard: 0 };
  for (const p of platforms) {
    const c = readCounts(p);
    total.easy += c.easy;
    total.medium += c.medium;
    total.hard += c.hard;
  }

  const data = [
    { name: "Easy", value: total.easy },
    { name: "Medium", value: total.medium },
    { name: "Hard", value: total.hard }
  ];

  const allZero = data.every(d => d.value === 0);

  return (
    <div className="charts-card">
      <h4>Problems by Difficulty</h4>
      {allZero ? (
        <div className="charts-empty">no difficulty data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4} label>
              {data.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
