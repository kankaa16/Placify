import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./Heatmap.css";

const fmt = d => d.toISOString().slice(0,10);

function aggregateSubmissions(submissions = [], days = 365) {
  const map = {};
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days + 1);

  submissions.forEach(sub => {
    const ts = new Date(sub.timestamp);
    if(ts >= cutoff && ts <= now){
      const key = fmt(ts);
      map[key] = (map[key] || 0) + 1;
    }
  });

  return map;
}

export default function Heatmap({ stats, days = 365 }) {
  if (!stats) return null;

  return (
    <div className="heatmap-container">
      <h4>Activity Last {days} Days</h4>
      <div className="heatmap-grid">
        {Object.entries(stats).map(([platformKey, data]) => {
          if(!data) return null;

          let map = data.contributionsCalendar || {};
          
          if(platformKey === "leetcode" && data.submissions){
            map = aggregateSubmissions(data.submissions, days);
          }

          const values = [];
          const now = new Date();
          for(let i = days-1; i >= 0; i--){
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = fmt(d);
            values.push({ date: key, count: map[key] || 0 });
          }

          if(values.every(v => v.count === 0)) return null;

          return (
            <div key={platformKey} className="platform-heatmap">
              <div className="ph-header">{platformKey}</div>
              <CalendarHeatmap
                startDate={new Date(new Date().setDate(new Date().getDate()-(days-1)))}
                endDate={new Date()}
                values={values}
                classForValue={v => {
                  if(!v || v.count===0) return "color-empty";
                  if(v.count <= 1) return "color-scale-1";
                  if(v.count <= 3) return "color-scale-2";
                  return "color-scale-3";
                }}
                showWeekdayLabels={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  )
}
