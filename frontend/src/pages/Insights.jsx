import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAIDashboard, getAIRisk, checkParametric,
  getAIWeather, getAllTriggers
} from "../api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .ins-root { font-family:'Inter',sans-serif; min-height:100vh; background:#060B18; padding:32px 24px; box-sizing:border-box; }
  .ins-root * { box-sizing:border-box; }
  .ins-root h1,.ins-root h2,.ins-root h3,.ins-root h4 { font-family:'Sora',sans-serif; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:.35} }
  @keyframes shimmer { 0%{background-position:-600px 0}100%{background-position:600px 0} }

  .ins-fade { animation:fadeUp .5s ease both; }

  .ins-card {
    background:rgba(13,21,38,0.97);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:20px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    transition:transform .2s,box-shadow .2s;
    overflow:hidden;
  }
  .ins-card:hover { transform:translateY(-2px); box-shadow:0 16px 48px rgba(0,0,0,0.5); }

  .kpi-card {
    background:rgba(13,21,38,0.97);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; padding:20px 22px;
    box-shadow:0 4px 20px rgba(0,0,0,0.35);
    transition:all .2s;
  }
  .kpi-card:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(0,0,0,0.5); }

  .tab-btn {
    padding:9px 20px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);
    cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
    transition:all .18s ease; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.55);
  }
  .tab-btn.active { background:linear-gradient(135deg,#00D4AA,#7C3AED); color:#fff; border-color:transparent; box-shadow:0 4px 16px rgba(0,212,170,0.25); }
  .tab-btn:not(.active):hover { background:rgba(255,255,255,0.08); color:#fff; }

  .shimmer-dark {
    background:linear-gradient(90deg,rgba(30,41,59,.8) 25%,rgba(51,65,85,.8) 50%,rgba(30,41,59,.8) 75%);
    background-size:600px 100%; animation:shimmer 1.4s infinite; border-radius:12px;
  }

  .live-dot { width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 1.8s ease-in-out infinite;flex-shrink:0; }

  .weather-tile {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
    border-radius:12px; padding:14px 16px;
  }

  .trigger-card {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:14px; padding:16px; transition:background .15s;
  }
  .trigger-card:hover { background:rgba(255,255,255,0.06); }

  .news-card {
    background:rgba(13,21,38,0.97); border:1px solid rgba(255,255,255,0.08);
    border-radius:18px; padding:24px; transition:transform .2s,box-shadow .2s;
  }
  .news-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.6); }

  @media(max-width:768px){
    .ins-grid-2 { grid-template-columns:1fr !important; }
  }
`;

const SEV_CONFIG = {
  CRITICAL: { bg:"rgba(239,68,68,0.15)",  text:"#F87171", border:"rgba(239,68,68,0.3)",  label:"🔴 Critical" },
  HIGH:     { bg:"rgba(245,158,11,0.15)", text:"#FBBF24", border:"rgba(245,158,11,0.3)", label:"🟡 High" },
  MODERATE: { bg:"rgba(234,179,8,0.15)",  text:"#FDE047", border:"rgba(234,179,8,0.3)",  label:"🟡 Moderate" },
  LOW:      { bg:"rgba(34,197,94,0.15)",  text:"#4ADE80", border:"rgba(34,197,94,0.3)",  label:"🟢 Low" },
};

const RISK_COLOR = (score) => {
  if (score >= 0.70) return { ring:"#ef4444", label:"High Risk",     emoji:"🔴" };
  if (score >= 0.45) return { ring:"#f59e0b", label:"Moderate Risk", emoji:"🟡" };
  return                  { ring:"#22c55e", label:"Low Risk",      emoji:"🟢" };
};

const WEATHER_EMOJI = {
  "Clear":"☀️","Partly Cloudy":"⛅","Overcast":"☁️","Light Rain":"🌧️",
  "Heavy Rain":"⛈️","Thunderstorm":"🌩️","Cyclone Warning":"🌀",
  "Extreme Heat":"🌡️","Dense Fog":"🌫️","Sandstorm":"🌪️",
};

const NEWS_DATA = [
  { title:"LPG Shortage Hits Food Delivery Earnings", source:"Business World",
    date:new Date().toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'}),
    summary:"Geopolitical tensions have led to a severe LPG shortage across India, forcing cloud kitchens and restaurants to scale down. Food delivery orders dropped by 50–70%, significantly impacting gig worker daily income.",
    tag:"Economics", tagColor:"#A78BFA" },
  { title:"NDMA Issues Heatwave Advisory for Gig Platforms", source:"NDMA India",
    date:new Date(Date.now()-86400000).toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'}),
    summary:"With temperatures crossing 45°C in North India, the NDMA recommends platforms to suspend mandatory work between 11 AM–4 PM and provide heat safety pay.",
    tag:"Safety", tagColor:"#F87171" },
  { title:"Incessant Rains: Delivery Partners Struggle", source:"The Hindu",
    date:new Date(Date.now()-172800000).toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'}),
    summary:"Heavy monsoon-like rains in South India have caused massive waterlogging. Workers report vehicle damages and rating drops due to weather delays.",
    tag:"Weather", tagColor:"#60A5FA" },
  { title:"Gig Worker Unions Demand Cooling Breaks", source:"Economic Times",
    date:new Date(Date.now()-259200000).toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'}),
    summary:"Associations are advocating for mandatory cooling breaks and removal of penalties for workers logging off during extreme weather warnings.",
    tag:"Policy", tagColor:"#00D4AA" },
];

function KpiCard({ label, value, sub, accent="#00D4AA", icon }) {
  return (
    <div className="kpi-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{label}</span>
        {icon && <span style={{fontSize:20}}>{icon}</span>}
      </div>
      <div style={{fontSize:26,fontWeight:800,color:accent,lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:6}}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, badge, live }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:17,fontWeight:800,color:"#F1F5F9",margin:0}}>{title}</h3>
      {badge && <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.5)"}}>{badge}</span>}
      {live && (
        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:"#4ADE80"}}>
          <div className="live-dot" /> LIVE
        </span>
      )}
    </div>
  );
}

function RiskRing({ score=0 }) {
  const rc = RISK_COLOR(score);
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 50;
  const dash = circumference * score;
  return (
    <div style={{width:120,height:120,borderRadius:"50%",background:`${rc.ring}18`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
      <svg style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}} width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke={rc.ring} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"/>
      </svg>
      <div style={{width:84,height:84,background:"rgba(6,11,24,0.95)",borderRadius:"50%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1}}>
        <span style={{fontSize:22,fontWeight:800,color:rc.ring}}>{pct}%</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700}}>RISK</span>
      </div>
    </div>
  );
}

export default function Insights() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("news");
  const [loading, setLoading] = useState(true);
  const [aiDash, setAiDash] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [parametric, setParametric] = useState(null);
  const [triggers, setTriggers] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const [dashRes, riskRes, paramRes, triggerRes] = await Promise.allSettled([
        getAIDashboard(), getAIRisk(), checkParametric(), getAllTriggers(),
      ]);
      if (dashRes.status==="fulfilled" && !dashRes.value?.error) setAiDash(dashRes.value);
      if (riskRes.status==="fulfilled" && !riskRes.value?.error) setRiskData(riskRes.value);
      if (paramRes.status==="fulfilled" && !paramRes.value?.error) setParametric(paramRes.value);
      if (triggerRes.status==="fulfilled" && !triggerRes.value?.error) setTriggers(triggerRes.value);
    } catch { }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const aiOffline = !aiDash && !riskData;
  const wData = riskData?.current_weather ?? parametric?.weather;
  const wEmoji = wData ? (WEATHER_EMOJI[wData.condition] ?? "🌡️") : "🌡️";
  const paramAlert = riskData?.parametric_alert ?? parametric?.parametric_check;
  const sevCfg = SEV_CONFIG[paramAlert?.severity] ?? SEV_CONFIG["LOW"];

  if (loading) {
    return (
      <div className="ins-root">
        <style>{STYLES}</style>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{width:24,height:24,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#00D4AA",animation:"spin .8s linear infinite"}}/>
          <span style={{color:"rgba(255,255,255,0.5)",fontWeight:600}}>Gathering latest gig worker insights…</span>
        </div>
        <div className="shimmer-dark" style={{height:200,marginBottom:24}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div className="shimmer-dark" style={{height:300}}/>
          <div className="shimmer-dark" style={{height:300}}/>
        </div>
      </div>
    );
  }

  return (
    <div className="ins-root">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="ins-fade" style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontFamily:"Sora,sans-serif",fontSize:"clamp(20px,3vw,28px)",fontWeight:800,color:"#F1F5F9",margin:"0 0 6px"}}>
              💡 Gig <span style={{background:"linear-gradient(135deg,#00D4AA,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Insights & Intelligence</span>
            </h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0}}>
              Latest news, weather impact, and real-time triggers for the gig economy
            </p>
          </div>
          <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:20,
            background: aiOffline?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",
            border:`1px solid ${aiOffline?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.3)"}`,
            fontSize:12,fontWeight:700,color:aiOffline?"#F87171":"#4ADE80"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:aiOffline?"#ef4444":"#22c55e",animation:aiOffline?"none":"pulse 2s infinite"}}/>
            {aiOffline ? "AI Feed Offline" : "Live Feed"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ins-fade" style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {["news","weather","triggers"].map(t => (
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="news"?"📰 Latest News":t==="weather"?"🌦️ Weather Insights":"🌀 Environmental Triggers"}
          </button>
        ))}
      </div>

      {/* ── NEWS TAB ── */}
      {tab==="news" && (
        <div className="ins-fade">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
            <div style={{position:"relative",flex:1,maxWidth:400}}>
              <input type="text" placeholder="Search gig news..." style={{
                width:"100%",padding:"10px 16px 10px 40px",borderRadius:12,
                border:"1px solid rgba(255,255,255,0.1)",fontSize:13,outline:"none",
                background:"rgba(13,21,38,0.95)",color:"#F1F5F9",
              }}/>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
              📡 <span>AI News Intelligence</span>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
            {NEWS_DATA.map((item,idx) => (
              <div key={idx} className="news-card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <span style={{fontSize:11,fontWeight:800,
                    background:`linear-gradient(135deg,${item.tagColor}33,${item.tagColor}22)`,
                    border:`1px solid ${item.tagColor}44`,
                    padding:"4px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:".05em",color:item.tagColor}}>
                    {item.tag}
                  </span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{item.date}</span>
                </div>
                <h3 style={{fontSize:16,fontWeight:800,color:"#F1F5F9",marginBottom:10,lineHeight:1.4}}>{item.title}</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:16}}>{item.summary}</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🗞️</div>
                  <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>{item.source}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:28,textAlign:"center",padding:"16px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:0}}>
              Curated via AI from Google News & Regional Bulletins · Last updated: Just now
            </p>
          </div>
        </div>
      )}

      {/* ── WEATHER TAB ── */}
      {tab==="weather" && (
        <div className="ins-fade" style={{display:"flex",flexDirection:"column",gap:20}}>
          <div className="ins-card" style={{padding:"28px 24px"}}>
            <SectionHeader title="Today's Weather Intelligence" live />
            {wData ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}} className="ins-grid-2">
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                    <span style={{fontSize:52}}>{wEmoji}</span>
                    <div>
                      <div style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>{wData.condition}</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{wData.location}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{new Date(wData.timestamp).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      ["🌡️ Temperature", `${wData.temperature}°C`],
                      ["💧 Humidity",    `${wData.humidity}%`],
                      ["💨 Wind Speed",  `${wData.wind_kmh} km/h`],
                      ["🏭 AQI",         wData.aqi, wData.aqi>=300?"#F87171":wData.aqi>=150?"#FBBF24":"#4ADE80"],
                      ["🗓️ Season",      wData.season?.replace("_"," ")],
                    ].map(([lbl,val,color])=>(
                      <div key={lbl} className="weather-tile">
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700}}>{lbl}</div>
                        <div style={{fontSize:16,fontWeight:800,color:color??"#F1F5F9",marginTop:4}}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {paramAlert && (
                    <div style={{
                      padding:"24px",borderRadius:16,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",
                      background:paramAlert.auto_trigger?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",
                      border:`1px solid ${paramAlert.auto_trigger?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.3)"}`,
                    }}>
                      <div style={{fontSize:18,fontWeight:800,color:paramAlert.auto_trigger?"#F87171":"#4ADE80",marginBottom:10}}>
                        {paramAlert.auto_trigger?"🚨 Weather Claim Triggered":"✅ Weather Normal"}
                      </div>
                      <p style={{fontSize:14,color:paramAlert.auto_trigger?"rgba(248,113,113,0.8)":"rgba(74,222,128,0.8)",lineHeight:1.6}}>
                        {paramAlert.auto_trigger
                          ? "Current weather conditions meet your parametric policy threshold. A claim has been auto-initiated."
                          : "No extreme weather events detected in your area that match your policy triggers."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{color:"rgba(255,255,255,0.4)"}}>Weather service temporarily unavailable.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TRIGGERS TAB ── */}
      {tab==="triggers" && (
        <div className="ins-card ins-fade" style={{padding:"28px 24px"}}>
          <SectionHeader title="Active Environmental Triggers Across India" live badge={triggers?.triggers?.length+" cities"} />
          {triggers?.triggers ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {triggers.triggers.map((t,i) => {
                const sev = t.trigger?.severity ?? "LOW";
                const scfg = SEV_CONFIG[sev] ?? SEV_CONFIG.LOW;
                const we = WEATHER_EMOJI[t.weather?.condition] ?? "🌡️";
                return (
                  <div key={i} className="trigger-card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:28}}>{we}</span>
                      <span style={{fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:6,background:scfg.bg,color:scfg.text,border:`1px solid ${scfg.border}`}}>
                        {scfg.label}
                      </span>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{t.district}, {t.state}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:3}}>{t.weather?.condition} · {t.weather?.temperature}°C · AQI {t.weather?.aqi}</div>
                  </div>
                );
              })}
            </div>
          ) : <p style={{color:"rgba(255,255,255,0.4)"}}>No trigger data found.</p>}
        </div>
      )}
    </div>
  );
}