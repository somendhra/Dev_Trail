import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPlans, loginUser, verifyOtp, socialLogin } from "../api";
import { FaShieldAlt, FaBolt, FaWallet, FaRobot, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { IconPhone, IconLock } from "../components/Icons";

/* ────────────────────────────────── DATA ────────────────────────────────── */
const PARTNERS = [
  { name: "Zomato",   color: "#E23744", bg: "rgba(226,55,68,0.12)",   border: "rgba(226,55,68,0.25)" },
  { name: "Swiggy",   color: "#FC8019", bg: "rgba(252,128,25,0.12)",  border: "rgba(252,128,25,0.25)" },
  { name: "Amazon",   color: "#FF9900", bg: "rgba(255,153,0,0.12)",   border: "rgba(255,153,0,0.25)" },
  { name: "Flipkart", color: "#2874F0", bg: "rgba(40,116,240,0.12)",  border: "rgba(40,116,240,0.25)" },
  { name: "Zepto",    color: "#A855F7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.25)" },
  { name: "Blinkit",  color: "#F7C600", bg: "rgba(247,198,0,0.12)",   border: "rgba(247,198,0,0.25)" },
  { name: "Dunzo",    color: "#00C853", bg: "rgba(0,200,83,0.12)",    border: "rgba(0,200,83,0.25)" },
  { name: "Porter",   color: "#00D4AA", bg: "rgba(0,212,170,0.12)",   border: "rgba(0,212,170,0.25)" },
];

const DISRUPTIONS = [
  { icon: "🌧️", label: "Heavy Rain",   color: "#60A5FA", bg: "rgba(96,165,250,0.1)"  },
  { icon: "🌫️", label: "Air Pollution", color: "#C084FC", bg: "rgba(192,132,252,0.1)" },
  { icon: "🌊", label: "Flooding",      color: "#34D399", bg: "rgba(52,211,153,0.1)"  },
  { icon: "⚡",  label: "Storms",       color: "#FBBF24", bg: "rgba(251,191,36,0.1)"  },
  { icon: "🚫", label: "Curfews",       color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  { icon: "🏗️", label: "Road Blocks",  color: "#00D4AA", bg: "rgba(0,212,170,0.1)"   },
];

const FEATURES = [
  { icon: <FaRobot/>,     title: "AI Risk Prediction",  desc: "Real-time weather, AQI and traffic fusion detects disruptions before they affect your income.",  accent: "#00D4AA" },
  { icon: <FaBolt/>,      title: "Instant Auto-Claims", desc: "Zero forms. Zero waiting. The moment a verified disruption occurs, your claim is triggered.",      accent: "#A78BFA" },
  { icon: <FaWallet/>,    title: "Same-Day Payouts",    desc: "Compensation hits your account the same day. No processing queues, no bank delays.",               accent: "#60A5FA" },
  { icon: <FaChartLine/>, title: "Live Risk Dashboard",  desc: "Monitor your coverage status, active alerts and payout history from one elegant interface.",      accent: "#F97316" },
];

const STEPS = [
  { n: "01", title: "Register",      desc: "Create your worker profile in under 2 minutes.",   color: "#00D4AA" },
  { n: "02", title: "Choose a Plan", desc: "Pick weekly coverage that matches your risk level.", color: "#A78BFA" },
  { n: "03", title: "AI Monitors",   desc: "Our engine watches weather & disruptions 24/7.",    color: "#60A5FA" },
  { n: "04", title: "Auto Payout",   desc: "Receive compensation the moment conditions trigger.", color: "#F97316" },
];

const STATS = [
  { value: "50K+",  label: "Workers Protected" },
  { value: "₹2.4Cr", label: "Payouts Disbursed" },
  { value: "99.8%", label: "Uptime Reliability" },
  { value: "<2min", label: "Avg Claim Speed" },
];

/* ────────────────────────────── STYLES ────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  .ls-root { background: #060B18; color: #F1F5F9; font-family: 'Inter', sans-serif; min-height: 100vh; }
  .ls-root h1,.ls-root h2,.ls-root h3,.ls-root h4 { font-family:'Sora',sans-serif; }

  /* Hero animated gradient text */
  .hero-gradient-text {
    background: linear-gradient(135deg, #00D4AA 0%, #7C3AED 50%, #60A5FA 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 4s ease infinite;
  }
  @keyframes gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Orb blobs */
  .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
  .orb-1 { width:500px;height:500px; top:-120px; left:-160px; background:radial-gradient(circle,rgba(0,212,170,0.18),transparent 70%); animation: blobmove 10s ease-in-out infinite; }
  .orb-2 { width:420px;height:420px; top:30%; right:-100px; background:radial-gradient(circle,rgba(124,58,237,0.16),transparent 70%); animation: blobmove 13s ease-in-out infinite 2s; }
  .orb-3 { width:360px;height:360px; bottom:-60px; left:35%; background:radial-gradient(circle,rgba(96,165,250,0.12),transparent 70%); animation: blobmove 8s ease-in-out infinite 1s; }
  @keyframes blobmove {
    0%,100% { transform:translate(0,0) scale(1); }
    33%     { transform:translate(24px,-24px) scale(1.06); }
    66%     { transform:translate(-12px,18px) scale(0.95); }
  }

  /* Shine grid overlay */
  .grid-overlay {
    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    position:absolute; inset:0; z-index:0; pointer-events:none;
  }

  /* Tag badge */
  .tag-badge {
    display:inline-flex; align-items:center; gap:6px;
    border-radius:999px; padding:5px 14px; font-size:11px;
    letter-spacing:1.5px; font-weight:700; text-transform:uppercase;
    border:1px solid rgba(0,212,170,0.35);
    background:rgba(0,212,170,0.08); color:#00D4AA;
  }

  /* Partner pill */
  .partner-pill {
    display:inline-flex; align-items:center; gap:10px;
    padding:10px 20px; border-radius:12px;
    font-size:14px; font-weight:700; white-space:nowrap;
    transition:transform 0.3s ease, box-shadow 0.3s ease;
    cursor:default;
  }
  .partner-pill:hover {
    transform:translateY(-4px);
    box-shadow:0 12px 32px rgba(0,0,0,0.35);
  }

  /* Feature card */
  .feat-card {
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; padding:28px 26px;
    transition:transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  }
  .feat-card:hover {
    transform:translateY(-8px);
    border-color:rgba(0,212,170,0.25);
    background:rgba(0,212,170,0.04);
  }

  /* Step card */
  .step-card {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; padding:26px 24px; position:relative; overflow:hidden;
    transition:transform 0.3s ease, border-color 0.3s;
  }
  .step-card:hover { transform:translateY(-6px); border-color:rgba(255,255,255,0.14); }
  .step-num { font-family:'Sora',sans-serif; font-size:56px; font-weight:900; line-height:1; opacity:0.06; position:absolute; bottom:-8px; right:12px; }

  /* Plan card */
  .plan-card {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
    border-radius:24px; padding:32px 28px; position:relative; overflow:hidden;
    transition:transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
  }
  .plan-card:hover { transform:translateY(-10px); box-shadow:0 28px 72px rgba(0,0,0,0.4); }
  .plan-card.popular {
    border-color:rgba(0,212,170,0.4);
    box-shadow:0 0 40px rgba(0,212,170,0.12), 0 16px 48px rgba(0,0,0,0.3);
  }

  /* Stat card */
  .stat-card {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; padding:24px 20px; text-align:center;
    transition:transform 0.3s ease;
  }
  .stat-card:hover { transform:translateY(-4px); }

  /* CTA section */
  .cta-section {
    background:linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(124,58,237,0.12) 100%);
    border:1px solid rgba(0,212,170,0.2); border-radius:28px;
  }

  /* Footer */
  .footer-link { color:#64748B; font-size:13px; text-decoration:none; transition:color 0.2s; }
  .footer-link:hover { color:#00D4AA; }

  /* Scroll reveal */
  .sr { opacity:0; transform:translateY(28px); transition:opacity 0.65s ease, transform 0.65s ease; }
  .sr.vis { opacity:1; transform:translateY(0); }

  /* Primary cta btn */
  .primary-btn {
    position:relative; overflow:hidden;
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 30px; border-radius:14px; font-size:15px;
    font-weight:700; color:#060B18; text-decoration:none;
    background:linear-gradient(135deg,#00D4AA,#7C3AED);
    box-shadow:0 4px 20px rgba(0,212,170,0.35);
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .primary-btn:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,212,170,0.5); }
  .primary-btn::after {
    content:''; position:absolute; top:0;left:-80%;width:50%;height:100%;
    background:linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent);
    transform:skewX(-20deg);
  }
  .primary-btn:hover::after { animation:pbtns 0.55s ease forwards; }
  @keyframes pbtns { to { left:130%; } }

  .outline-btn {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 30px; border-radius:14px; font-size:15px;
    font-weight:600; color:#F1F5F9; text-decoration:none;
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.14);
    transition:background 0.2s, transform 0.2s;
  }
  .outline-btn:hover { background:rgba(255,255,255,0.10); transform:translateY(-2px); }
`;

/* ─────────────────────────── HELPERS ─────────────────────────────── */
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ─────────────────────────── COMPONENT ─────────────────────────────── */
export default function Landing() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* Login form state */
  const [authRole, setAuthRole]     = useState("user");
  const [loginMode, setLoginMode]   = useState("credentials");
  const [loginForm, setLoginForm]   = useState({ email:"", phone:"", password:"", otp:"", requiresOtp:false });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPw, setShowPw]         = useState(false);

  useEffect(() => {
    getPlans()
      .then(res => setPlans(Array.isArray(res) && res.length ? res : fallbackPlans()))
      .catch(() => setPlans(fallbackPlans()))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll(".sr");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  /* Login helpers */
  const setF = k => e => setLoginForm(f => ({ ...f, [k]: e.target.value }));
  const handleRole = role => {
    if (role === authRole) return;
    setAuthRole(role); setLoginMode("credentials");
    setLoginForm({ email:"", phone:"", password:"", otp:"", requiresOtp:false });
    setLoginError(null);
  };
  const norm = res => {
    if (!res || typeof res !== "string") return res;
    try { return JSON.parse(res.replace(/^\uFEFF/,"").trim()); } catch { return res; }
  };
  const validate = () => {
    if (authRole==="admin" || loginMode==="credentials") {
      if (!loginForm.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) return "Enter a valid email.";
    } else {
      if (!loginForm.phone.trim()) return "Phone number is required.";
    }
    if (!loginForm.password) return "Password is required.";
    return null;
  };
  const submit = async () => {
    const err = validate(); if (err) { setLoginError(err); return; }
    setLoginError(null); setLoginLoading(true);
    try {
      const id = (authRole==="admin"||loginMode==="credentials") ? loginForm.email.trim().toLowerCase() : loginForm.phone.trim();
      const res = norm(await loginUser({ identifier: id, password: loginForm.password }));
      if (res?.error) { setLoginError(res.error); }
      else if (res?.requiresOtp) {
        if (authRole==="admin") { setLoginError("Admin does not use OTP."); return; }
        setLoginForm(f => ({ ...f, requiresOtp: true }));
      } else if (res?.token) {
        if (authRole==="admin" && !res.isAdmin) { setLoginError("Not an admin account."); return; }
        if (authRole==="user" && res.isAdmin)   { setLoginError("Admin detected. Use Admin Login."); return; }
        localStorage.setItem("token", res.token);
        if (res.isAdmin) {
          localStorage.setItem("isAdmin","true"); localStorage.setItem("adminEmail", res.email||id);
          localStorage.setItem("adminUsername", res.name||"Admin");
          localStorage.removeItem("userId"); localStorage.removeItem("userName");
        } else {
          localStorage.removeItem("isAdmin"); localStorage.setItem("userId", res.id); localStorage.setItem("userName", res.name||"");
        }
        navigate(res.isAdmin ? "/admin" : "/dashboard", { replace: true });
      } else { setLoginError("Login failed: no token received."); }
    } catch(e) { setLoginError(e.message||"Network error."); }
    finally { setLoginLoading(false); }
  };
  const onKey = e => { if (e.key==="Enter") submit(); };

  return (
    <div className="ls-root">
      <style>{STYLES}</style>
      <Navbar />

      {/* ═══ HERO — two column: left hero + right inline login ═══ */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:"92vh", display:"flex", alignItems:"center" }}>
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"80px 24px", width:"100%",
          display:"grid", gridTemplateColumns:"1fr 420px", gap:64, alignItems:"center" }}>

          {/* ── LEFT: hero text ── */}
          <div>
            <div className="tag-badge fade-up d1" style={{ marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4AA", display:"inline-block" }} />
              AI-Powered Parametric Insurance
            </div>
            <h1 className="fade-up d2" style={{ fontSize:"clamp(38px,5.5vw,72px)", fontWeight:900, lineHeight:1.08, margin:0, marginBottom:8 }}>
              Protect Your <br/>
              <span className="hero-gradient-text">Gig Income</span>
            </h1>
            <h1 className="fade-up d2" style={{ fontSize:"clamp(38px,5.5vw,72px)", fontWeight:900, lineHeight:1.08, margin:0, marginBottom:24, color:"#F1F5F9" }}>
              — Automatically.
            </h1>
            <p className="fade-up d3" style={{ fontSize:"clamp(14px,1.8vw,17px)", color:"#94A3B8", lineHeight:1.75, maxWidth:480, marginBottom:32 }}>
              When rain stops delivery or floods your district, <strong style={{ color:"#F1F5F9" }}>GigShield's AI detects it instantly</strong> and sends you compensation — no forms, no waiting, no hassle.
            </p>
            {/* Social proof */}
            <div className="fade-up d4" style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex" }}>
                {["#00D4AA","#7C3AED","#60A5FA","#F97316"].map((c,i) => (
                  <div key={i} style={{ width:32, height:32, borderRadius:"50%", background:c, border:"2px solid #060B18",
                    marginLeft:i===0?0:-8, fontSize:11, display:"flex", alignItems:"center",
                    justifyContent:"center", color:"#060B18", fontWeight:700 }}>
                    {String.fromCharCode(65+i)}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display:"flex", gap:2, marginBottom:2 }}>
                  {"★★★★★".split("").map((s,i) => <span key={i} style={{ color:"#00D4AA", fontSize:13 }}>{s}</span>)}
                </div>
                <p style={{ fontSize:13, color:"#64748B", margin:0 }}>Trusted by <strong style={{ color:"#94A3B8" }}>50,000+</strong> gig workers across India</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Inline Login Card ── */}
          <div className="fade-up d3" style={{ background:"#fff", borderRadius:22, overflow:"hidden",
            boxShadow:"0 24px 72px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)" }}>
            {/* Gradient bar */}
            <div style={{ height:4, background:"linear-gradient(90deg,#00D4AA,#7C3AED,#60A5FA)" }} />
            <div style={{ padding:"28px 28px 24px" }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#0F172A", margin:"0 0 4px", fontFamily:"'Sora',sans-serif" }}>
                {authRole==="admin" ? "Admin Login" : "Welcome back"}
              </h2>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 18px" }}>
                {authRole==="admin" ? "Secure access for administrators." : "Sign in to manage your insurance & claims."}
              </p>

              {/* Role tabs */}
              <div style={{ display:"flex", background:"#F1F5F9", borderRadius:11, padding:3, marginBottom:14 }}>
                {[{r:"user",l:"👤 User"},{r:"admin",l:"🔐 Admin"}].map(({r,l}) => (
                  <button key={r} onClick={() => handleRole(r)}
                    style={{ flex:1, padding:"8px 0", border:"none", borderRadius:9, cursor:"pointer",
                      fontSize:12, fontWeight:700, fontFamily:"'Inter',sans-serif",
                      background: authRole===r ? "#fff" : "transparent",
                      color: authRole===r ? "#0F172A" : "#94A3B8",
                      boxShadow: authRole===r ? "0 1px 5px rgba(0,0,0,0.08)" : "none",
                      transition:"all 0.2s" }}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Method tabs (users only) */}
              {authRole==="user" && (
                <div style={{ display:"flex", gap:7, marginBottom:14 }}>
                  {[{m:"credentials",l:"✉️ Email"},{m:"mobile",l:"📱 Mobile"}].map(({m,l}) => (
                    <button key={m} onClick={() => setLoginMode(m)}
                      style={{ padding:"6px 14px", borderRadius:999, border:`1.5px solid ${loginMode===m?"#0F172A":"#E2E8F0"}`,
                        background: loginMode===m ? "#0F172A" : "transparent",
                        color: loginMode===m ? "#fff" : "#94A3B8",
                        fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif",
                        transition:"all 0.2s" }}>
                      {l}
                    </button>
                  ))}
                </div>
              )}

              <form autoComplete="off" onSubmit={e => e.preventDefault()} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {/* Honeypot */}
                <input type="text" style={{ display:"none" }} autoComplete="off" readOnly tabIndex={-1} />
                <input type="password" style={{ display:"none" }} autoComplete="off" readOnly tabIndex={-1} />

                {/* Email / Phone */}
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#CBD5E1", display:"flex", pointerEvents:"none" }}>
                    {authRole==="admin"||loginMode==="credentials" ? <IconMail/> : <IconPhone/>}
                  </span>
                  <input
                    style={{ width:"100%", border:"1.5px solid #E2E8F0", borderRadius:11, padding:"12px 12px 12px 40px",
                      fontSize:13, background:"#F8FAFC", color:"#0F172A", outline:"none", boxSizing:"border-box",
                      fontFamily:"'Inter',sans-serif", transition:"border 0.2s" }}
                    type={authRole==="admin"||loginMode==="credentials" ? "email" : "tel"}
                    placeholder={authRole==="admin"||loginMode==="credentials" ? "Email address" : "Mobile number"}
                    value={authRole==="admin"||loginMode==="credentials" ? loginForm.email : loginForm.phone}
                    onChange={authRole==="admin"||loginMode==="credentials" ? setF("email") : setF("phone")}
                    onKeyDown={onKey} autoComplete="off" name="gs-id"
                    onFocus={e => e.target.style.borderColor="#00D4AA"}
                    onBlur={e => e.target.style.borderColor="#E2E8F0"}
                  />
                </div>

                {/* Password */}
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#CBD5E1", display:"flex", pointerEvents:"none" }}>
                    <IconLock/>
                  </span>
                  <input
                    style={{ width:"100%", border:"1.5px solid #E2E8F0", borderRadius:11, padding:"12px 40px 12px 40px",
                      fontSize:13, background:"#F8FAFC", color:"#0F172A", outline:"none", boxSizing:"border-box",
                      fontFamily:"'Inter',sans-serif", transition:"border 0.2s" }}
                    type={showPw ? "text" : "password"} placeholder="Password"
                    value={loginForm.password} onChange={setF("password")} onKeyDown={onKey}
                    autoComplete="new-password" name="gs-pw"
                    onFocus={e => e.target.style.borderColor="#00D4AA"}
                    onBlur={e => e.target.style.borderColor="#E2E8F0"}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:0, display:"flex" }}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>

                {/* Error */}
                {loginError && (
                  <div style={{ display:"flex", alignItems:"center", gap:7, background:"#FEF2F2",
                    border:"1.5px solid #FECACA", borderRadius:10, padding:"9px 12px",
                    color:"#DC2626", fontSize:12, fontWeight:500 }}>⚠️ {loginError}</div>
                )}

                {/* Submit */}
                <button type="button" onClick={submit} disabled={loginLoading}
                  style={{ width:"100%", height:46, border:"none", cursor:loginLoading?"not-allowed":"pointer",
                    borderRadius:11, fontSize:14, fontWeight:700, color:"#fff",
                    background:"linear-gradient(135deg,#00D4AA,#7C3AED)",
                    boxShadow:"0 4px 16px rgba(0,212,170,0.3)",
                    opacity: loginLoading ? 0.7 : 1,
                    transition:"transform 0.2s, box-shadow 0.2s", fontFamily:"'Inter',sans-serif",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                  onMouseEnter={e => { if(!loginLoading) e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                  {loginLoading ? "Signing in…" : authRole==="admin" ? "Admin Login →" : "Login →"}
                </button>
              </form>

              {/* Footer links */}
              {authRole==="user" ? (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
                  <Link to="/forgot" style={{ fontSize:12, color:"#94A3B8", textDecoration:"none" }}>Forgot password?</Link>
                  <Link to="/register" style={{ fontSize:12, color:"#00D4AA", fontWeight:700, textDecoration:"none" }}>Create account →</Link>
                </div>
              ) : (
                <p style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:12, margin:"12px 0 0" }}>
                  Admin accounts are provisioned by the system.
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-card sr" style={{ transitionDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, fontFamily: "'Sora',sans-serif" }} className="hero-gradient-text">
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PARTNERS ═══ */}
      <section id="partners" style={{ padding: "72px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", textAlign: "center", marginBottom: 40 }}>
          <SectionTag>Partners</SectionTag>
          <h2 className="sr" style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginTop: 14, marginBottom: 10 }}>Works With Every Major Platform</h2>
          <p className="sr" style={{ color: "#64748B", fontSize: 15 }}>Coverage wherever gig workers are hired in India</p>
        </div>
        <div style={{
          WebkitMaskImage: "linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",
          maskImage: "linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",
          overflow: "hidden",
        }}>
          <div className="marquee-inner" style={{ gap: 12 }}>
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div key={i} className="partner-pill" style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color, margin: "0 6px" }}>
                <span style={{ fontSize: 18 }}>
                  {p.name === "Zomato" ? "🍕" : p.name === "Swiggy" ? "🛵" : p.name === "Amazon" ? "📦" : p.name === "Flipkart" ? "🛍️" : p.name === "Zepto" ? "⚡" : p.name === "Blinkit" ? "🟡" : p.name === "Dunzo" ? "🟢" : "🚚"}
                </span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COVERAGE / DISRUPTIONS ═══ */}
      <section id="coverage" style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionTag>Coverage</SectionTag>
            <h2 className="sr" style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginTop: 14, marginBottom: 10 }}>6 Disruption Types We Cover</h2>
            <p className="sr" style={{ color: "#64748B", fontSize: 15 }}>AI detects each event automatically — your claim is triggered the moment conditions are confirmed</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
            {DISRUPTIONS.map((d, i) => (
              <div key={i} className="sr" style={{
                transitionDelay: `${i * 0.07}s`,
                background: d.bg, border: `1px solid ${d.color}28`,
                borderRadius: 18, padding: "28px 20px", textAlign: "center",
                transition: "transform 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px) scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{d.icon}</div>
                <div style={{ fontWeight: 700, color: d.color, fontSize: 14 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ padding: "72px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionTag>Features</SectionTag>
            <h2 className="sr" style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginTop: 14, marginBottom: 10 }}>Built for How Gig Work Actually Operates</h2>
            <p className="sr" style={{ color: "#64748B", fontSize: 15 }}>Precision automation so you can focus on earning, not paperwork</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card sr" style={{ transitionDelay: `${i * 0.09}s` }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                  background: `${f.accent}18`, border: `1px solid ${f.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: f.accent,
                }}>
                  {f.icon}
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#F1F5F9" }}>{f.title}</h4>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLANS ═══ */}
      <section id="pricing" style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionTag>Pricing</SectionTag>
            <h2 className="sr" style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginTop: 14, marginBottom: 10 }}>Plans That Protect On Your Budget</h2>
            <p className="sr" style={{ color: "#64748B", fontSize: 15 }}>No annual commitments. Flexible, affordable weekly coverage.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {loading
              ? [1,2,3,4].map(i => (
                  <div key={i} className="shimmer" style={{ height: 320, borderRadius: 24 }} />
                ))
              : plans.map((p, i) => {
                  const popular = p.name === "Smart" || i === 1;
                  return (
                    <div key={p.id} className={`plan-card sr ${popular ? "popular" : ""}`} style={{ transitionDelay: `${i * 0.09}s` }}>
                      {popular && (
                        <div style={{
                          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                          background: "linear-gradient(135deg,#00D4AA,#7C3AED)", color: "#fff",
                          fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase",
                          padding: "5px 16px", borderRadius: "0 0 10px 10px",
                        }}>
                          Most Popular
                        </div>
                      )}
                      <div style={{ paddingTop: popular ? 16 : 0 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{p.name}</h3>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 24 }}>
                          <span className="hero-gradient-text" style={{ fontSize: 40, fontWeight: 900, fontFamily: "'Sora',sans-serif" }}>
                            ₹{p.weeklyPremium}
                          </span>
                          <span style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>/week</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {p.features?.map((feat, j) => (
                            <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#94A3B8" }}>
                              <FaCheckCircle style={{ color: "#00D4AA", fontSize: 14, marginTop: 1, flexShrink: 0 }} />
                              {feat}
                            </li>
                          ))}
                          <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#94A3B8" }}>
                            <FaCheckCircle style={{ color: "#00D4AA", fontSize: 14, flexShrink: 0 }} />
                            {p.trialDays}-day free trial
                          </li>
                        </ul>
                        <Link to="/register" style={{
                          display: "block", textAlign: "center", padding: "12px 20px",
                          borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none",
                          background: popular ? "linear-gradient(135deg,#00D4AA,#7C3AED)" : "rgba(255,255,255,0.06)",
                          color: popular ? "#060B18" : "#94A3B8",
                          border: popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                          transition: "opacity 0.2s, transform 0.2s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                          {popular ? "Get Started →" : "Select Plan"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: "72px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionTag>Process</SectionTag>
            <h2 className="sr" style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, marginTop: 14, marginBottom: 10 }}>Up and Running in 4 Steps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="step-card sr" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: s.color, marginBottom: 12, textTransform: "uppercase" }}>Step {s.n}</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                <div className="step-num" style={{ color: s.color }}>{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="cta-section sr" style={{ padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🛡️</div>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 900, marginBottom: 16 }}>
              Your income deserves<br />
              <span className="hero-gradient-text">automatic protection.</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 480, margin: "0 auto 36px" }}>
              Join thousands of gig workers who already have AI watching out for their earnings. Start your free trial today.
            </p>
            <Link to="/register" className="primary-btn" style={{ fontSize: 16, padding: "16px 36px" }}>
              Start Free Trial — No Card Needed →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaShieldAlt style={{ color: "#fff", fontSize: 14 }} />
            </div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#F1F5F9" }}>GigShield</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {["About", "Contact", "Privacy", "Support"].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>© 2026 GigShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionTag({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      borderRadius: 999, padding: "5px 14px", fontSize: 11,
      letterSpacing: "1.5px", fontWeight: 700, textTransform: "uppercase",
      border: "1px solid rgba(0,212,170,0.3)", background: "rgba(0,212,170,0.07)", color: "#00D4AA",
    }}>
      {children}
    </span>
  );
}

function fallbackPlans() {
  return [
    { id: 1, name: "Starter", weeklyPremium: 29, trialDays: 7, features: ["Rain & storm protection", "Basic AI monitoring", "Email alerts"] },
    { id: 2, name: "Smart",   weeklyPremium: 49, trialDays: 7, features: ["All weather protection", "Auto claims", "Priority support"] },
    { id: 3, name: "Pro",     weeklyPremium: 79, trialDays: 7, features: ["Full disruption coverage", "Instant payouts", "Dedicated support"] },
    { id: 4, name: "Elite",   weeklyPremium: 119,trialDays: 14,features: ["Everything in Pro", "Legal aid coverage", "Family rider option"] },
  ];
}