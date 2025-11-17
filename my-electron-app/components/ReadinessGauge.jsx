import React, { useEffect, useRef } from "react";

export default function ReadinessGauge({ score }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H - 10;     
    const r = W / 2 - 20;  

    const startAngle = Math.PI;     
    const endAngle = 0;

    ctx.lineWidth = 22;
    ctx.strokeStyle = "#222";

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.stroke();

    const pct = Math.min(Math.max(score / 5, 0), 1); 
    const targetAngle = startAngle + pct * Math.PI;

    let anim = 0;

    function animate() {
      anim += 0.03;
      if (anim > 1) anim = 1;

      const currentAngle = startAngle + pct * Math.PI * anim;

      ctx.clearRect(0, 0, W, H);

      ctx.lineWidth = 22;
      ctx.strokeStyle = "#222";
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();

      ctx.strokeStyle = "rgb(0,255,140)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, currentAngle);
      ctx.stroke();

      if (anim < 1) requestAnimationFrame(animate);
    }

    animate();
  }, [score]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={200}
        height={160}
        style={{ display: "block", margin: "0 auto" }}
      />
      <div style={{ marginTop: "-10px", fontSize: "38px", fontWeight: "700" }}>
        {score}
      </div>

      <div style={{ fontSize: "14px", opacity: 0.7, marginTop: "5px" }}>
        {score >= 4
          ? "You are Almost Ready"
          : score >= 3
          ? "You are Improving"
          : score >= 2
          ? "Keep Practicing"
          : "You are Just Starting"}
      </div>

      <div style={{ opacity: 0.6, fontSize: "12px", marginTop: "5px" }}>
        out of 5
      </div>
    </div>
  );
}
