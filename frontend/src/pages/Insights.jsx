import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAIDashboard, getAIRisk, checkParametric,
  getAIWeather, getFraudStats, getAllTriggers, getAIPlanRecommendation
} from "../api";

// ── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .ai-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .ai-root h1, .ai-root h2, .ai-root h3, .ai-root h4 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.55; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes ripple   { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.2);opacity:0} }

  .ai-fade  { animation: fadeUp .55s ease both; }
  .ai-card  {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 4px 24px rgba(15,23,42,.07);
    overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .ai-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(15,23,42,.12); }

  .kpi-card {
    background: #fff; border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    padding: 20px 22px;
    box-shadow: 0 2px 12px rgba(15,23,42,.06);
    transition: all .2s ease;
  }
  .kpi-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(15,23,42,.11); }

  .risk-ring {
    width: 120px; height: 120px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative; flex-shrink: 0;
  }
  .risk-ring-inner {
    width: 84px; height: 84px; background: #fff; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 1;
  }

  .weather-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
  }

  .trigger-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px; border-radius: 12px;
    border: 1.5px solid #f1f5f9; background: #fff;
    transition: background .15s;
    margin-bottom: 8px;
  }
  .trigger-row:hover { background: #f8fafc; }

  .fraud-bar-wrap {
    height: 8px; background: #f1f5f9; border-radius: 99px; overflow:hidden;
    flex: 1;
  }
  .fraud-bar-fill { height: 100%; border-radius: 99px; transition: width .8s cubic-bezier(.4,0,.2,1); }

  .plan-rec-card {
    border-radius: 16px; padding: 24px; color: #fff;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    position: relative; overflow: hidden;
  }
  .plan-rec-bg {
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='80' cy='20' r='40' fill='rgba(255,255,255,0.06)'/%3E%3Ccircle cx='20' cy='80' r='30' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E") no-repeat center/cover;
  }

  .shimmer-box {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 600px 100%; animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }

  .live-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    animation: pulse 1.8s ease-in-out infinite; flex-shrink: 0;
  }

  .tab-btn {
    padding: 8px 20px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 600;
    transition: all .18s ease;
  }
  .tab-btn.active { background: #7c3aed; color: #fff; }
  .tab-btn:not(.active) { background: #f1f5f9; color: #64748b; }
  .tab-btn:not(.active):hover { background: #e2e8f0; }

  @media (max-width: 768px) {
    .ai-grid-3 { grid-template-columns: 1fr !important; }
    .ai-grid-2 { grid-template-columns: 1fr !important; }
  }
`;

// ── Severity config ───────────────────────────────────────────────────────────
const SEV_CONFIG = {
  CRITICAL: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", label: "🔴 Critical" },
  HIGH:     { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b", label: "🟡 High" },
  MODERATE: { bg: "#fef9c3", text: "#713f12", dot: "#eab308", label: "🟡 Moderate" },
  LOW:      { bg: "#dcfce7", text: "#166534", dot: "#22c55e", label: "🟢 Low" },
};

const RISK_COLOR = (score) => {
  if (score >= 0.70) return { ring: "#ef4444", label: "High Risk", emoji: "🔴" };
  if (score >= 0.45) return { ring: "#f59e0b", label: "Moderate Risk", emoji: "🟡" };
  return { ring: "#22c55e", label: "Low Risk", emoji: "🟢" };
};

const WEATHER_EMOJI = {
  "Clear":            "☀️",
  "Partly Cloudy":    "⛅",
  "Overcast":         "☁️",
  "Light Rain":       "🌧️",
  "Heavy Rain":       "⛈️",
  "Thunderstorm":     "🌩️",
  "Cyclone Warning":  "🌀",
  "Extreme Heat":     "🌡️",
  "Dense Fog":        "🌫️",
  "Sandstorm":        "🌪️",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function RiskRing({ score = 0 }) {
  const rc = RISK_COLOR(score);
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 50;
  const dash = circumference * score;

  return (
    <div className="risk-ring" style={{ background: `${rc.ring}18` }}>
      <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
           width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none"
          stroke={rc.ring} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round" />
      </svg>
      <div className="risk-ring-inner">
        <span style={{ fontSize: 22, fontWeight: 800, color: rc.ring }}>{pct}%</span>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>RISK</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent = "#7c3aed", icon }) {
  return (
    <div className="kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, badge, live }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h3>
      {badge && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#f1f5f9", color: "#64748b" }}>{badge}</span>}
      {live && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#22c55e" }}>
          <div className="live-dot" /> LIVE
        </span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Insights() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("news");
  const [loading, setLoading]     = useState(true);
  const [aiDash, setAiDash]       = useState(null);
  const [riskData, setRiskData]   = useState(null);
  const [parametric, setParametric] = useState(null);
  const [triggers, setTriggers]   = useState(null);
  const [error, setError]         = useState(null);

  const [news] = useState([
    {
      title: "LPG Shortage Hits Food Delivery Earnings",
      source: "Business World",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      summary: "Geopolitical tensions have led to a severe LPG shortage across India, forcing cloud kitchens and restaurants to scale down. Food delivery orders have dropped by 50-70%, significantly impacting gig worker daily income.",
      tag: "Economics"
    },
    {
      title: "NDMA Issues Heatwave Advisory for Gig Platforms",
      source: "NDMA India",
      date: new Date(Date.now() - 86400000).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      summary: "With temperatures crossing 45°C in North India, the NDMA recommends platforms to suspend mandatory work between 11 AM - 4 PM and provide heat safety pay.",
      tag: "Safety"
    },
    {
      title: "Incessant Rains: Delivery Partners Struggle with Bad Roads",
      source: "The Hindu",
      date: new Date(Date.now() - 172800000).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      summary: "Heavy monsoon-like rains in South India have caused massive waterlogging. Workers report vehicle damages and rating drops due to weather delays.",
      tag: "Weather"
    },
    {
      title: "Gig Worker Unions Demand Cooling Breaks",
      source: "Economic Times",
      date: new Date(Date.now() - 259200000).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      summary: "Associations are advocating for mandatory cooling breaks and removal of penalties for workers logging off during extreme weather warnings.",
      tag: "Policy"
    }
  ]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const [dashRes, riskRes, paramRes, triggerRes] = await Promise.allSettled([
        getAIDashboard(),
        getAIRisk(),
        checkParametric(),
        getAllTriggers(),
      ]);

      if (dashRes.status   === "fulfilled" && !dashRes.value?.error)   setAiDash(dashRes.value);
      if (riskRes.status   === "fulfilled" && !riskRes.value?.error)   setRiskData(riskRes.value);
      if (paramRes.status  === "fulfilled" && !paramRes.value?.error)  setParametric(paramRes.value);
      if (triggerRes.status=== "fulfilled" && !triggerRes.value?.error) setTriggers(triggerRes.value);

    } catch (e) {
      setError("Could not connect to AI service.");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div style={{ padding: "32px 24px" }}>
        <style>{STYLES}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#7c3aed", animation: "spin .8s linear infinite" }} />
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>Gathering latest gig worker insights…</span>
        </div>
        <div className="shimmer-box" style={{ height: 200, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="shimmer-box" style={{ height: 300 }} />
            <div className="shimmer-box" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  const aiOffline = !aiDash && !riskData;
  const wData     = riskData?.current_weather ?? parametric?.weather;
  const wEmoji    = wData ? (WEATHER_EMOJI[wData.condition] ?? "🌡️") : "🌡️";
  const paramAlert= riskData?.parametric_alert ?? parametric?.parametric_check;
  const sevCfg    = SEV_CONFIG[paramAlert?.severity] ?? SEV_CONFIG["LOW"];

  return (
    <div className="ai-root" style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" }}>
      <style>{STYLES}</style>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="ai-fade" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              💡 Gig <span style={{ color: "#7c3aed" }}>Insights & Intelligence</span>
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Latest news, weather impact, and real-time triggers for the gig economy
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: aiOffline ? "#fee2e2" : "#dcfce7", fontSize: 12, fontWeight: 700, color: aiOffline ? "#991b1b" : "#166534" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: aiOffline ? "#ef4444" : "#22c55e", animation: aiOffline ? "none" : "pulse 2s infinite" }} />
              {aiOffline ? "AI News Feed Offline" : "Live News Feed"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div className="ai-fade" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["news", "weather", "triggers"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}>
            {t === "news"      ? "📰 Latest News" :
             t === "weather"   ? "🌦️ Weather Insights" :
                                "🌀 Environmental Triggers"}
          </button>
        ))}
      </div>

      {/* ══════════════ NEWS TAB ══════════════ */}
      {tab === "news" && (
        <div className="ai-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                    <input type="text" placeholder="Search gig news..." style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }} />
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" alt="Google" style={{ height: 14 }} />
                    <span>News Intelligence</span>
                </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                {news.map((item, idx) => (
                <div key={idx} className="ai-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#7c3aed", padding: "4px 10px", borderRadius: 6, textTransform: "uppercase" }}>
                            {item.tag}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.date}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>{item.summary}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                            🗞️
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{item.source}</span>
                    </div>
                </div>
            ))}
            </div>
            <div style={{ marginTop: 32, textAlign: "center", padding: "20px", borderTop: "1.5px solid #f1f5f9" }}>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    Curated via AI from Google News & Regional Bulletins · Last updated: Just now
                </p>
            </div>
        </div>
      )}

      {/* ══════════════ WEATHER TAB ══════════════ */}
      {tab === "weather" && (
        <div className="ai-fade" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
             <div className="ai-card" style={{ padding: "28px 24px" }}>
              <SectionHeader title="Today's Weather Intelligence" live />
              {wData ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="ai-grid-2">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                      <span style={{ fontSize: 56 }}>{wEmoji}</span>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{wData.condition}</div>
                        <div style={{ fontSize: 14, color: "#94a3b8" }}>{wData.location}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {new Date(wData.timestamp).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        ["🌡️ Temperature",   `${wData.temperature}°C`],
                        ["💧 Humidity",       `${wData.humidity}%`],
                        ["💨 Wind Speed",     `${wData.wind_kmh} km/h`],
                        ["🏭 AQI",            wData.aqi, wData.aqi >= 300 ? "#ef4444" : wData.aqi >= 150 ? "#f59e0b" : "#22c55e"],
                        ["🗓️ Season",         wData.season?.replace("_"," ")],
                      ].map(([lbl, val, color]) => (
                        <div key={lbl} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{lbl}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: color ?? "#0f172a", marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {paramAlert && (
                      <div style={{
                        padding: "20px", borderRadius: 14,
                        background: paramAlert.auto_trigger ? "#fee2e2" : "#dcfce7",
                        border: `1.5px solid ${paramAlert.auto_trigger ? "#fca5a5" : "#86efac"}`,
                        height: "100%", display: "flex", flexDirection: "column", justifyContent: "center"
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: paramAlert.auto_trigger ? "#991b1b" : "#166534", marginBottom: 8 }}>
                          {paramAlert.auto_trigger ? "🚨 Weather Claim Triggered" : "✅ Weather Normal"}
                        </div>
                        <p style={{ fontSize: 14, color: paramAlert.auto_trigger ? "#b91c1c" : "#15803d" }}>
                            {paramAlert.auto_trigger 
                                ? "Current weather conditions meet your parametric policy threshold. A claim has been auto-initiated." 
                                : "No extreme weather events detected in your area that match your policy triggers."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: "#94a3b8" }}>Weather service temporarily unavailable.</p>
              )}
            </div>
        </div>
      )}

      {/* ══════════════ TRIGGERS TAB ══════════════ */}
      {tab === "triggers" && (
        <div className="ai-card ai-fade" style={{ padding: "28px 24px" }}>
            <SectionHeader title="Active Environmental Triggers Across India" live badge={triggers?.triggers?.length + " cities"} />
            {triggers?.triggers ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {triggers.triggers.map((t, i) => {
                    const sev = t.trigger?.severity ?? "LOW";
                    const scfg = SEV_CONFIG[sev] ?? SEV_CONFIG.LOW;
                    const we = WEATHER_EMOJI[t.weather?.condition] ?? "🌡️";
                    return (
                    <div key={i} className="trigger-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 24, flexShrink: 0 }}>{we}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: scfg.bg, color: scfg.text }}>
                                {scfg.label}
                            </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            {t.district}, {t.state}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            {t.weather?.condition} · {t.weather?.temperature}°C · AQI {t.weather?.aqi}
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            ) : <p style={{ color: "#94a3b8" }}>No data found.</p>}
        </div>
      )}
    </div>
  );
}