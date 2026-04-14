import React from 'react';

export default function DashboardCard({ title, value, small, icon, accent = "#00D4AA" }) {
  return (
    <div style={{
      background: "rgba(13,21,38,0.95)",
      border: `1px solid rgba(255,255,255,0.09)`,
      borderRadius: 18,
      padding: "22px 20px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      cursor: "default",
      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${accent}50`;
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}25`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)";
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 90, height: 90,
        borderRadius: "50%", top: -25, right: -25,
        background: `radial-gradient(circle, ${accent}28 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `${accent}20`, border: `1px solid ${accent}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, color: accent,
        }}>
          {icon || "💰"}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "1.5px", color: `${accent}99`,
          background: `${accent}12`, padding: "2px 8px", borderRadius: 6,
        }}>Live</span>
      </div>

      {/* Title — now clearly visible */}
      <div style={{
        fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)",
        textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8,
      }}>
        {title}
      </div>

      {/* Value — large & bright */}
      <div style={{
        fontSize: 26, fontWeight: 900, fontFamily: "'Sora', sans-serif",
        color: "#FFFFFF", letterSpacing: "-0.5px", lineHeight: 1.1,
      }}>
        {value}
      </div>

      {small && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", flexShrink: 0 }} />
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.4px",
          }}>
            {small}
          </span>
        </div>
      )}
    </div>
  );
}
