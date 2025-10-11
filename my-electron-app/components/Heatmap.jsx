import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./Heatmap.css";

const fmt = d => d.toISOString().slice(0,10);

function synthesizeDailyFromTotal(total, days=90){
  const out = {};
  if(!total) return out;
  for(let i=0; i<days; i++){
    const d = new Date();
    d.setDate(d.getDate()-i);
    out[fmt(d)] = 1; // 1 per day, can be randomized if you want
  }
  return out;
}

export default function Heatmap({ stats, days=90 }) {
  if (!stats) return null;
  return (
    <div className="heatmap-container">
      <h4>Activity Last {days} Days</h4>
      <div className="heatmap-grid">
        {Object.entries(stats).map(([platformKey, data]) => {
          if(!data) return null;
          const map = data.contributionsCalendar || {};
          if(Object.keys(map).length === 0 && data.totalSolved) {
            Object.assign(map, synthesizeDailyFromTotal(data.totalSolved, days));
          }

          const values = [];
          const now = new Date();
          for(let i=days-1;i>=0;i--){
            const d = new Date(now);
            d.setDate(now.getDate()-i);
            const key = fmt(d);
            values.push({ date: key, count: map[key] || 0 });
          }

          if(values.every(v=>v.count===0)) return null;

          return (
            <div key={platformKey} className="platform-heatmap">
              <div className="ph-header">{platformKey}</div>
              <CalendarHeatmap
                startDate={new Date(new Date().setDate(new Date().getDate()-(days-1)))}
                endDate={new Date()}
                values={values}
                classForValue={v=>{
                  if(!v || v.count===0) return "color-empty";
                  if(v.count<=1) return "color-scale-1";
                  if(v.count<=3) return "color-scale-2";
                  return "color-scale-3";
                }}
                showWeekdayLabels={false}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
