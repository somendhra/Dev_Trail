import React from 'react';

export default function DashboardCard({ title, value, small, icon, accent = "#00D4AA" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 18,
      padding: "22px 20px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${accent}40`;
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${accent}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 80, height: 80,
        borderRadius: "50%", top: -20, right: -20,
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, color: accent,
          transition: "transform 0.25s ease",
        }}>
          {icon || "💰"}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "2px", color: "rgba(255,255,255,0.15)",
        }}>Live</span>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{
        fontSize: 26, fontWeight: 900, fontFamily: "'Sora', sans-serif",
        color: "#F1F5F9", letterSpacing: "-0.5px", lineHeight: 1.1,
      }}>
        {value}
      </div>

      {small && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            {small}
          </span>
        </div>
      )}
    </div>
  );
}
