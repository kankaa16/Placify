// src/components/Heatmap.jsx
import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./Heatmap.css";

// Only Codeforces heatmap
export default function Heatmap({ stats, days = 365 }) {
  const cf = stats?.codeforces?.contributionsCalendar;

  if (!cf) {
    return <div className="heatmap-empty">No Codeforces activity</div>;
  }

  const values = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    values.push({
      date: key,
      count: cf[key] || 0
    });
  }

  return (
    <CalendarHeatmap
      startDate={new Date(new Date().setDate(new Date().getDate() - (days - 1)))}
      endDate={new Date()}
      values={values}
      gutterSize={3}          // more spacing between cells
  horizontal={true} 
      showWeekdayLabels={false}
      classForValue={v => {
        if (!v || v.count === 0) return "color-empty";
        if (v.count <= 1) return "color-scale-1";
        if (v.count <= 3) return "color-scale-2";
        return "color-scale-3";
      }}
    />
  );
}
