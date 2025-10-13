import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
  const totalCounts = { easy: 0, medium: 0, hard: 0 };
  for (const p of platforms) {
    const c = readCounts(p);
    totalCounts.easy += c.easy;
    totalCounts.medium += c.medium;
    totalCounts.hard += c.hard;
  }

  const data = [
    { name: "Easy", value: totalCounts.easy, color: COLORS[0] },
    { name: "Medium", value: totalCounts.medium, color: COLORS[1] },
    { name: "Hard", value: totalCounts.hard, color: COLORS[2] }
  ];

  const totalSolved = totalCounts.easy + totalCounts.medium + totalCounts.hard;
  const allZero = data.every(d => d.value === 0);

  return (
    <div className="charts-card">
      <h4>Problems by Difficulty on LeetCode</h4>
      {allZero ? (
        <div className="charts-empty">No difficulty data available</div>
      ) : (
        <div className="charts-wrapper">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, "Problems"]} />
            </PieChart>
          </ResponsiveContainer>

          <div className="charts-summary">
            <p><strong>Total:</strong> {totalSolved}</p>
            {data.map((d, idx) => (
              <p key={idx}>
                <span className="summary-color-box" style={{ backgroundColor: d.color }}></span>
                <strong>{d.name} : </strong> {d.value}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
