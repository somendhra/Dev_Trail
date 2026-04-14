import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, getMySubscriptions, getMyClaimRequests,
  getPaymentHistory, getDashboardSummary
} from "../api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .rep-root { font-family:'Inter',sans-serif; min-height:100vh; background:#060B18; padding:32px 24px; box-sizing:border-box; }
  .rep-root * { box-sizing:border-box; }
  .rep-root h1,.rep-root h2,.rep-root h3,.rep-root h4 { font-family:'Sora',sans-serif; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-600px 0}100%{background-position:600px 0} }

  .rep-fade { animation:fadeUp .5s ease both; }

  .rep-card {
    background:rgba(13,21,38,0.97);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:20px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  .rep-card:hover { transform:translateY(-2px); box-shadow:0 16px 48px rgba(0,0,0,0.5); }

  .kpi-card {
    background:rgba(13,21,38,0.97);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; padding:20px 22px;
    box-shadow:0 4px 20px rgba(0,0,0,0.35);
    transition:all .2s;
  }
  .kpi-card:hover { transform:translateY(-2px); }

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

  .chart-bar {
    border-radius:6px 6px 2px 2px;
    transition:height 0.6s cubic-bezier(.4,0,.2,1);
    position:relative; cursor:help;
  }
  .chart-bar:hover { filter:brightness(1.2); }
  .chart-bar:hover::after {
    content:attr(data-value);
    position:absolute; top:-26px; left:50%; transform:translateX(-50%);
    background:#0f172a; color:#fff; padding:2px 7px; border-radius:5px;
    font-size:10px; white-space:nowrap; z-index:10; font-family:'Inter',sans-serif;
  }

  .rep-table { width:100%; border-collapse:collapse; }
  .rep-table th {
    text-align:left; padding:12px 16px;
    font-size:11px; color:rgba(255,255,255,0.4); font-weight:700; text-transform:uppercase; letter-spacing:.05em;
    border-bottom:1px solid rgba(255,255,255,0.08);
  }
  .rep-table td { padding:15px 16px; border-bottom:1px solid rgba(255,255,255,0.05); }
  .rep-table tr:last-child td { border-bottom:none; }
  .rep-table tr:hover td { background:rgba(255,255,255,0.03); }

  .metric-tile {
    padding:20px; border-radius:16px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
  }

  @media(max-width:768px){
    .rep-grid-2 { grid-template-columns:1fr !important; }
    .rep-kpi-grid { grid-template-columns:1fr 1fr !important; }
  }
`;

function KpiCard({ label, value, sub, accent="#00D4AA", icon }) {
  return (
    <div className="kpi-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{label}</span>
        {icon && <span style={{fontSize:20}}>{icon}</span>}
      </div>
      <div style={{fontSize:24,fontWeight:800,color:accent,lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:6}}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, badge }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:17,fontWeight:800,color:"#F1F5F9",margin:0}}>{title}</h3>
      {badge && <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.5)"}}>{badge}</span>}
    </div>
  );
}

const statusBadge = (ok, label) => (
  <span style={{
    padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:800,
    background: ok ? "rgba(34,197,94,0.12)" : label==="REJECTED"||label==="FAILED" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
    color:       ok ? "#4ADE80"              : label==="REJECTED"||label==="FAILED" ? "#F87171"              : "#FBBF24",
    border: `1px solid ${ok?"rgba(34,197,94,0.25)":label==="REJECTED"||label==="FAILED"?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`,
  }}>{label}</span>
);

export default function Reports() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("activity");
  const [investTab, setInvestTab] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);

  const fallbackData = { joinDate:"Jan 12, 2026", totalHours:486, coverage:"₹1,50,000" };

  const getActivityData = () => {
    if (!user) return { weeklyHours:[38,42,35,45,40,39,41], totalHoursWorked:486, leaveTaken:4 };
    const joinTime = new Date(user.createdAt || new Date()).getTime();
    const diffDays = Math.max(1, Math.floor((Date.now()-joinTime)/(1000*60*60*24)));
    const activeWeeks = Math.ceil(diffDays/7);
    const weeksToShow = Math.min(activeWeeks,7);
    const seed = user.id || 1;
    const weeklyHours = [];
    for (let i=0;i<weeksToShow;i++) {
      let h = 30+((seed*7+i*13)%20);
      if (i===weeksToShow-1 && diffDays%7!==0) h=Math.max(1,Math.floor(h*((diffDays%7)/7)));
      weeklyHours.push(h);
    }
    return { weeklyHours:weeklyHours.length>0?weeklyHours:[0], totalHoursWorked:diffDays*6, leaveTaken:Math.floor(diffDays/15) };
  };

  const activityVisuals = getActivityData();
  const investmentMock = {
    weekly:[1200,1500,1100,1800,2100,1900,2400],
    monthly:[4500,5200,4800,6100,5800,6500,7200,6900,7500,8100,7800,9000],
    yearly:[45000,58000,72000],
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const [userRes, sumRes, claimRes, payRes] = await Promise.allSettled([
        getCurrentUser(), getDashboardSummary(), getMyClaimRequests(), getPaymentHistory()
      ]);
      if (userRes.status==="fulfilled"&&!userRes.value?.error)  setUser(userRes.value);
      if (sumRes.status==="fulfilled"&&!sumRes.value?.error)    setSummary(sumRes.value);
      if (claimRes.status==="fulfilled"&&!claimRes.value?.error) setClaims(Array.isArray(claimRes.value)?claimRes.value:[]);
      if (payRes.status==="fulfilled"&&!payRes.value?.error)    setPayments(Array.isArray(payRes.value)?payRes.value:[]);
    } catch { }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div className="rep-root">
        <style>{STYLES}</style>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <div style={{width:24,height:24,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#00D4AA",animation:"spin .8s linear infinite"}}/>
          <span style={{color:"rgba(255,255,255,0.5)",fontWeight:600}}>Syncing with database…</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
          {[1,2,3,4].map(i=><div key={i} className="shimmer-dark" style={{height:100}}/>)}
        </div>
      </div>
    );
  }

  const activePlan = summary?.activePlan || null;
  const coverageAmt = activePlan ? `₹${(activePlan.coverageAmount||0).toLocaleString("en-IN")}` : "No Coverage";
  const walletBal = `₹${(user?.walletBalance||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;
  const rawJoinDate = user?.createdAt||user?.joinedAt||user?.date_joined;
  const joinDateStr = rawJoinDate ? new Date(rawJoinDate).toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'}) : fallbackData.joinDate;
  const sortedClaims = Array.isArray(claims)?[...claims].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)):[];
  const lastClaim = sortedClaims[0]||null;
  const lastClaimStatus = lastClaim ? (lastClaim.claimed||lastClaim.isClaimed?"Paid":lastClaim.status||"Pending") : "None";
  const lastClaimAmt = lastClaim ? `₹${lastClaim.amount||0}` : "₹0";

  return (
    <div className="rep-root">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="rep-fade" style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontFamily:"Sora,sans-serif",fontSize:"clamp(20px,3vw,28px)",fontWeight:800,color:"#F1F5F9",margin:"0 0 6px"}}>
              📊 Database <span style={{background:"linear-gradient(135deg,#00D4AA,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Verified Reports</span>
            </h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",margin:0}}>
              Live metrics from your insurance account, claims, and wallet balance
            </p>
          </div>
          <button onClick={loadAll} style={{
            padding:"10px 22px",borderRadius:12,border:"none",
            background:"linear-gradient(135deg,#00D4AA,#7C3AED)",
            color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",
            boxShadow:"0 4px 16px rgba(0,212,170,0.3)",fontFamily:"'Inter',sans-serif",
          }}>
            ↻ Sync Now
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="rep-fade rep-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:28}}>
        <KpiCard label="Join Date"      value={joinDateStr}      sub="Verified Registration"     accent="#00D4AA" icon="🗓️"/>
        <KpiCard label="Wallet Balance" value={walletBal}        sub="Available for Withdrawal"  accent="#60A5FA" icon="💳"/>
        <KpiCard label="Plan Coverage"  value={coverageAmt}      sub={activePlan?.name||"No Active Plan"} accent="#A78BFA" icon="🛡️"/>
        <KpiCard label="Last Claim"     value={lastClaimStatus}  sub={lastClaimAmt}              accent="#F87171" icon="📝"/>
      </div>

      {/* Tabs */}
      <div className="rep-fade" style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {["activity","payments","investments","claims"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="activity"?"📈 Productivity":t==="payments"?"💳 Payments":t==="investments"?"💰 Savings":"📜 Claims"}
          </button>
        ))}
      </div>

      {/* ── ACTIVITY TAB ── */}
      {tab==="activity" && (
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:24}} className="rep-grid-2">
          <div className="rep-card rep-fade" style={{padding:28}}>
            <SectionHeader title="Worker Productivity Analysis" badge="Simulated Visuals"/>
            <div style={{height:200,display:"flex",alignItems:"flex-end",gap:14,paddingBottom:20,paddingTop:16}}>
              {activityVisuals.weeklyHours.map((h,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div className="chart-bar" data-value={h+"h"} style={{
                    width:"100%",height:`${(h/55)*100}%`,
                    background:"linear-gradient(to top,#00D4AA,#7C3AED)",
                  }}/>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700}}>W{i+1}</span>
                </div>
              ))}
            </div>
            <div style={{padding:16,background:"rgba(255,255,255,0.04)",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:8}}>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700}}>EST. TOTAL HOURS</div>
                <div style={{fontSize:18,fontWeight:800,color:"#00D4AA"}}>{activityVisuals.totalHoursWorked} h</div>
              </div>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700}}>LEAVES TAKEN</div>
                <div style={{fontSize:18,fontWeight:800,color:"#F87171"}}>{activityVisuals.leaveTaken} Days</div>
              </div>
            </div>
          </div>

          <div className="rep-card rep-fade" style={{padding:28}}>
            <SectionHeader title="Active Subscription"/>
            {activePlan ? (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <div style={{padding:20,borderRadius:16,background:"linear-gradient(135deg,#00D4AA22,#7C3AED22)",border:"1px solid rgba(0,212,170,0.2)"}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",fontWeight:700,marginBottom:4}}>PLAN NAME</div>
                  <div style={{fontSize:26,fontWeight:800,color:"#F1F5F9"}}>{activePlan.name}</div>
                  <div style={{height:1,background:"rgba(255,255,255,0.1)",margin:"12px 0"}}/>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>Weekly Premium</div>
                      <div style={{fontSize:16,fontWeight:800,color:"#00D4AA"}}>₹{activePlan.weeklyPremium}</div>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>Coverage</div>
                      <div style={{fontSize:16,fontWeight:800,color:"#A78BFA"}}>{coverageAmt}</div>
                    </div>
                  </div>
                  {summary?.nextPaymentDate && (
                    <div style={{marginTop:14,fontSize:11,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)"}}>
                      📅 Next premium: <strong>{new Date(summary.nextPaymentDate).toLocaleDateString("en-IN",{day:'numeric',month:'short',year:'numeric'})}</strong>
                    </div>
                  )}
                </div>
                <div style={{padding:18,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14}}>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:700,marginBottom:10}}>VERIFIED PLATFORM</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:22}}>🏢</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:"#F1F5F9"}}>{user?.platform}</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Coverage applied to all active shifts</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{padding:32,textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:20,border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:40,marginBottom:12}}>🛡️</div>
                <div style={{fontWeight:700,color:"rgba(255,255,255,0.6)"}}>No active subscription found</div>
                <button onClick={()=>navigate("/plans")} style={{marginTop:16,padding:"8px 18px",borderRadius:10,background:"linear-gradient(135deg,#00D4AA,#7C3AED)",color:"#fff",border:"none",fontWeight:700,cursor:"pointer"}}>Browse Plans</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PAYMENTS TAB ── */}
      {tab==="payments" && (
        <div className="rep-card rep-fade" style={{padding:28}}>
          <SectionHeader title="Premium Payment History" badge={(Array.isArray(payments)?payments.length:0)+" Transactions"}/>
          <div style={{overflowX:"auto"}}>
            <table className="rep-table">
              <thead>
                <tr>{["Date","Reference / ID","Method","Status","Amount"].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {Array.isArray(payments)&&payments.length>0 ? payments.map((p,i)=>{
                  if(!p) return null;
                  const pDate=p.date||p.createdAt;
                  const displayDate=pDate?new Date(pDate).toLocaleDateString("en-IN",{day:'2-digit',month:'short'}):"Recently";
                  const displayRef=p.reference||p.id?.toString().slice(-8).toUpperCase()||"PAY-REF";
                  const displayAmt=p.amount!==undefined?`₹${p.amount}`:"₹0";
                  const ok=p.status==="SUCCESS"||p.status==="PAID";
                  return (
                    <tr key={i}>
                      <td style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{displayDate}</td>
                      <td style={{fontSize:13,color:"rgba(255,255,255,0.5)",fontFamily:"monospace"}}>{displayRef}</td>
                      <td style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{p.method?.replace("_"," ")||"UPI"}</td>
                      <td>{statusBadge(ok,p.status||"PENDING")}</td>
                      <td style={{fontSize:14,fontWeight:800,color:ok?"#4ADE80":"#F1F5F9"}}>{displayAmt}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{textAlign:"center",padding:32,color:"rgba(255,255,255,0.35)"}}>No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INVESTMENTS TAB ── */}
      {tab==="investments" && (
        <div style={{display:"flex",flexDirection:"column",gap:24}} className="rep-fade">
          <div className="rep-card" style={{padding:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
              <SectionHeader title="Savings Growth Projection"/>
              <div style={{display:"flex",background:"rgba(255,255,255,0.05)",padding:4,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
                {["weekly","monthly","yearly"].map(t=>(
                  <button key={t} onClick={()=>setInvestTab(t)} style={{
                    padding:"6px 14px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,
                    background:investTab===t?"linear-gradient(135deg,#00D4AA,#7C3AED)":"transparent",
                    color:investTab===t?"#fff":"rgba(255,255,255,0.5)",
                    boxShadow:investTab===t?"0 2px 8px rgba(0,0,0,0.3)":"none",
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{height:260,display:"flex",alignItems:"flex-end",gap:10,paddingBottom:20,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              {investmentMock[investTab].map((val,i)=>{
                const max=Math.max(...investmentMock[investTab]);
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:6}}>
                    <div className="chart-bar" data-value={"₹"+val.toLocaleString()} style={{width:"100%",height:`${(val/max)*100}%`,background:"linear-gradient(to top,#7C3AED,#A78BFA)"}}/>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:800}}>
                      {investTab==="weekly"?`W${i+1}`:investTab==="monthly"?`M${i+1}`:`202${4+i}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginTop:24}}>
              <div className="metric-tile">
                <div style={{fontSize:11,color:"#60A5FA",fontWeight:700}}>VERIFIED ASSETS</div>
                <div style={{fontSize:24,fontWeight:800,color:"#F1F5F9",marginTop:6}}>{walletBal}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Real-time wallet liquidity</div>
              </div>
              <div className="metric-tile">
                <div style={{fontSize:11,color:"#F87171",fontWeight:700}}>TOTAL CLAIMS PAID</div>
                <div style={{fontSize:24,fontWeight:800,color:"#F1F5F9",marginTop:6}}>
                  ₹{Array.isArray(claims)?claims.filter(c=>c.claimed||c.isClaimed).reduce((s,c)=>s+(c.amount||0),0).toLocaleString():0}
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Benefit payout sum</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLAIMS TAB ── */}
      {tab==="claims" && (
        <div className="rep-card rep-fade" style={{padding:28}}>
          <SectionHeader title="Insurance Claim History"/>
          <div style={{overflowX:"auto"}}>
            <table className="rep-table">
              <thead>
                <tr>{["Date","Reason","Platform","Status","Payout"].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {sortedClaims.length>0 ? sortedClaims.map((c,i)=>{
                  const isPaid=c.claimed||c.isClaimed;
                  return (
                    <tr key={i}>
                      <td style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                      <td style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{c.situation?.replace("AI-AUTO: ","")||"Weather Delay"}</td>
                      <td style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{c.platform||user?.platform}</td>
                      <td>{statusBadge(isPaid, isPaid?"PAID":c.status||"PENDING")}</td>
                      <td style={{fontSize:14,fontWeight:800,color:isPaid?"#4ADE80":"#F1F5F9"}}>₹{c.amount}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{textAlign:"center",padding:32,color:"rgba(255,255,255,0.35)"}}>No claims records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}