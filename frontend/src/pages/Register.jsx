import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, sendRegisterOtp, getPartners } from "../api";
import { IconUser, IconPhone, IconLock } from "../components/Icons";
import { FaShieldAlt } from "react-icons/fa";

/* ─── Icons ─── */
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

/* ─── Password strength ─── */
function pwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#334155" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const m = [
    { label: "Too short", color: "#F87171" },
    { label: "Weak",      color: "#FB923C" },
    { label: "Fair",      color: "#FBBF24" },
    { label: "Good",      color: "#34D399" },
    { label: "Strong",    color: "#00D4AA" },
  ];
  return { score: s, ...m[s] };
}

/* ─── Styles ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  .rroot * { font-family:'Inter',sans-serif; box-sizing:border-box; }
  .rroot h1,.rroot h2,.rroot h3 { font-family:'Sora',sans-serif; }

  .rroot { display:flex; min-height:100vh; background:#060B18; }
  .r-hero { flex:0 0 45%; min-height:100vh; position:relative; overflow:hidden; background:#060B18; display:flex; flex-direction:column; padding:40px 48px; }
  .r-form { flex:1; background:#0F172A; display:flex; align-items:center; justify-content:center; min-height:100vh; overflow-y:auto; padding:32px 24px; }

  @media(max-width:900px){
    .rroot { flex-direction:column; }
    .r-hero { flex:none; min-height:auto; padding:32px 24px 40px; }
    .r-form { flex:none; min-height:auto; padding:24px 16px 40px; }
  }

  /* Orbs */
  .r-orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
  .r-orb-1 { width:400px;height:400px;top:-100px;left:-100px; background:radial-gradient(circle,rgba(0,212,170,0.18),transparent 70%); animation:rorb 10s ease-in-out infinite; }
  .r-orb-2 { width:320px;height:320px;bottom:-60px;right:-60px; background:radial-gradient(circle,rgba(124,58,237,0.16),transparent 70%); animation:rorb 13s ease-in-out infinite 2s; }
  .r-orb-3 { width:260px;height:260px;top:40%;left:20%; background:radial-gradient(circle,rgba(96,165,250,0.1),transparent 70%); animation:rorb 8s ease-in-out infinite 4s; }
  @keyframes rorb {
    0%,100% { transform:translate(0,0) scale(1); }
    33% { transform:translate(16px,-16px) scale(1.05); }
    66% { transform:translate(-10px,12px) scale(0.96); }
  }

  .r-grid { position:absolute; inset:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),
                     linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);
    background-size:56px 56px;
  }

  /* Card */
  .r-card {
    background:#0B1121; border-radius:22px; width:100%; max-width:460px;
    box-shadow:0 24px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    overflow:hidden; animation: rcardin 0.5s cubic-bezier(.22,.68,0,1.2) both;
  }
  @keyframes rcardin {
    from { opacity:0; transform:translateY(20px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Input */
  .r-input {
    width:100%; border:1.5px solid #CBD5E1; border-radius:11px;
    padding:12px 14px 12px 42px; font-size:14px; font-weight:600; background:#F1F5F9;
    color:#000000 !important; outline:none; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
    font-family:'Inter',sans-serif; -webkit-appearance:none;
  }
  .r-input:focus { border-color:#00D4AA; box-shadow:0 0 0 3px rgba(0,212,170,0.2); background:#fff; color:#000000 !important; }
  .r-input::placeholder { color:#94A3B8; font-weight:500; font-size:13px; }
  .r-input-pw { padding-right:42px; }

  /* Field icon */
  .r-fi { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#64748B; display:flex; pointer-events:none; }

  /* Platform card */
  .plat-chip {
    border:1.5px solid #334155; border-radius:10px; padding:7px 4px;
    display:flex; flex-direction:column; align-items:center; gap:4px;
    cursor:pointer; background:#0F172A; transition:all 0.18s ease;
    min-width:0; user-select:none;
  }
  .plat-chip:hover { border-color:#00D4AA40; background:#1E293B; }
  .plat-chip.sel {
    border-color:#00D4AA; background:#1E293B;
    box-shadow:0 2px 10px rgba(0,212,170,0.2);
  }
  .plat-name { font-size:9px; font-weight:700; color:#94A3B8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; }
  .plat-chip.sel .plat-name { color:#00D4AA; }

  /* Submit btn */
  .r-btn {
    width:100%; height:47px; border:none; cursor:pointer; border-radius:11px;
    font-size:14px; font-weight:700; color:#fff; font-family:'Inter',sans-serif;
    background:linear-gradient(135deg,#00D4AA,#7C3AED);
    box-shadow:0 4px 18px rgba(0,212,170,0.3);
    transition:transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    display:flex; align-items:center; justify-content:center; gap:8px;
    position:relative; overflow:hidden;
  }
  .r-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,212,170,0.4); }
  .r-btn:disabled { opacity:0.65; cursor:not-allowed; }
  .r-btn::after {
    content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
    background:linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent);
    transform:skewX(-20deg);
  }
  .r-btn:hover:not(:disabled)::after { animation:rbtns 0.5s ease forwards; }
  @keyframes rbtns { to { left:130%; } }

  /* gradient text */
  .r-gtext {
    background:linear-gradient(135deg,#00D4AA,#A78BFA);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* Feat row */
  .r-feat { display:flex; align-items:center; gap:12px; padding:8px 0; border-radius:10px; transition:transform 0.2s; }
  .r-feat:hover { transform:translateX(4px); }

  /* Trust pills */
  .r-trust { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#94A3B8; background:#0F172A; border-radius:20px; padding:4px 10px; border:1px solid #1E293B; }
  .r-tdot { width:6px;height:6px;border-radius:50%;background:#00D4AA;display:inline-block;flex-shrink:0; }

  @keyframes rspin { to { transform:rotate(360deg); } }
`;

/* ─── Field icon wrapper ─── */
function FI({ children }) {
  return <span className="r-fi">{children}</span>;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", platform:"", otp:"", requiresOtp:false });
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [showPw, setShowPw] = useState(false);
  const strength = pwStrength(form.password);

  useEffect(() => {
    getPartners().then(res => {
      if (!res.error && Array.isArray(res)) setPartners(res);
    }).catch(() => {});
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const togglePlatform = p => setForm(f => ({ ...f, platform: f.platform === p ? "" : p }));

  const validate = () => {
    if (!form.name.trim())  return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.password)     return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.platform)     return "Please select your delivery platform.";
    return null;
  };

  const submit = async () => {
    const err = validate(); if (err) { setError(err); return; }
    setError(null); setLoading(true);
    try {
      const res = await sendRegisterOtp({ email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
      if (res?.message && !res.error) {
        setForm(f => ({ ...f, requiresOtp: true }));
      } else { setError(res?.error || "Unexpected error."); }
    } catch(e) { setError(e.message || "Network error."); }
    finally { setLoading(false); }
  };

  const submitOtp = async () => {
    if (!form.otp || form.otp.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setError(null); setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(), email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(), password: form.password, platform: form.platform, otp: form.otp,
      });
      if (res?.message && !res.error) {
        navigate("/login", { state: { message: res.message, email: form.email.trim().toLowerCase() } });
      } else { setError(res?.error || "Unexpected error."); }
    } catch(e) { setError(e.message || "Network error."); }
    finally { setLoading(false); }
  };

  const FEATS = [
    { icon:"🛡️", bg:"rgba(59,130,246,0.15)",  text:"AI detects disruptions automatically" },
    { icon:"⚡",  bg:"rgba(234,179,8,0.15)",   text:"Claims processed without any paperwork" },
    { icon:"💳", bg:"rgba(0,212,170,0.15)",    text:"Instant payout straight to your wallet" },
  ];

  /* ── OTP screen ── */
  if (form.requiresOtp) {
    return (
      <div className="rroot">
        <style>{STYLES}</style>
        <div className="r-form" style={{ background:"#060B18" }}>
          <div className="r-card" style={{ padding:36 }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#00D4AA,#7C3AED)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <FaShieldAlt style={{ color:"#fff", fontSize:22 }}/>
              </div>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#F8FAFC", margin:"0 0 6px" }}>Verify Your Email</h2>
              <p style={{ fontSize:13, color:"#64748B" }}>OTP sent to <strong>{form.email}</strong><br/>Check inbox & spam. May take 1–2 min.</p>
            </div>
            <div style={{ position:"relative", marginBottom:14 }}>
              <FI><IconLock/></FI>
              <input className="r-input" placeholder="Enter 6-digit OTP" type="text" value={form.otp}
                onChange={set("otp")} maxLength={6} autoComplete="off" name="rg-otp"
                style={{ textAlign:"center", letterSpacing:"6px", fontSize:20, fontWeight:700 }} />
            </div>
            {error && <div style={{ display:"flex", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:11, padding:"10px 14px", color:"#DC2626", fontSize:12, marginBottom:12 }}>⚠️ {error}</div>}
            <button className="r-btn" onClick={submitOtp} disabled={loading}>
              {loading ? <><svg style={{ width:16,height:16,animation:"rspin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Verifying…</> : "Verify & Create Account →"}
            </button>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <button onClick={submit} disabled={loading} style={{ flex:1, padding:9, border:"1.5px solid #E2E8F0", borderRadius:10, background:"#fff", color:"#64748B", fontSize:13, fontWeight:600, cursor:"pointer" }}>Resend OTP</button>
              <button onClick={() => setForm(f => ({...f, requiresOtp:false, otp:""}))} style={{ flex:1, padding:9, border:"none", background:"none", color:"#94A3B8", fontSize:13, fontWeight:600, cursor:"pointer" }}>← Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rroot">
      <style>{STYLES}</style>

      {/* ══ LEFT HERO ══ */}
      <div className="r-hero">
        <div className="r-grid"/>
        <div className="r-orb r-orb-1"/>
        <div className="r-orb r-orb-2"/>
        <div className="r-orb r-orb-3"/>

        {/* Nav */}
        <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"auto" }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#00D4AA,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 16px rgba(0,212,170,0.3)" }}>
              <FaShieldAlt style={{ color:"#fff", fontSize:16 }}/>
            </div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"#F1F5F9" }}>GigShield</span>
          </Link>
          <Link to="/" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>← Home</Link>
        </div>

        {/* Hero content */}
        <div style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 0" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, borderRadius:999, padding:"5px 14px", fontSize:11, letterSpacing:"1.5px", fontWeight:700, textTransform:"uppercase", border:"1px solid rgba(0,212,170,0.35)", background:"rgba(0,212,170,0.08)", color:"#00D4AA", marginBottom:22, width:"fit-content" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4AA", display:"inline-block" }}/>
            Free to Join
          </div>

          <h1 style={{ fontSize:"clamp(36px,4vw,56px)", fontWeight:900, color:"#F1F5F9", lineHeight:1.1, margin:"0 0 6px" }}>Secure your</h1>
          <h1 style={{ fontSize:"clamp(36px,4vw,56px)", fontWeight:900, lineHeight:1.1, margin:"0 0 6px" }} className="r-gtext">Gig Income</h1>
          <h1 style={{ fontSize:"clamp(36px,4vw,56px)", fontWeight:900, color:"#F1F5F9", lineHeight:1.1, margin:"0 0 20px" }}>in seconds.</h1>

          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.75, maxWidth:340, marginBottom:32 }}>
            Join thousands of delivery workers who protect their earnings from rain, floods, pollution, and curfews — automatically.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:36 }}>
            {FEATS.map(f => (
              <div key={f.text} className="r-feat">
                <div style={{ width:36, height:36, borderRadius:10, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{f.icon}</div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Platform pills */}
          {partners.length > 0 && (
            <div>
              <p style={{ fontSize:10, letterSpacing:"2px", color:"rgba(255,255,255,0.25)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Supported Platforms</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {partners.slice(0,6).map(p => (
                  <span key={p.name} style={{ display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:9, fontSize:12, fontWeight:700, color:p.borderColor||"#00D4AA", border:`1px solid ${p.borderColor||"#00D4AA"}40`, background:`${p.borderColor||"#00D4AA"}12` }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:12, marginTop:"auto", paddingTop:24 }}>
          <div style={{ display:"flex" }}>
            {["#00D4AA","#7C3AED","#60A5FA"].map((c,i) => (
              <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:c, border:"2px solid #060B18", marginLeft:i===0?0:-8, display:"flex", alignItems:"center", justifyContent:"center", color:"#060B18", fontSize:10, fontWeight:700 }}>
                {String.fromCharCode(65+i)}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display:"flex", gap:2 }}>{"★★★★★".split("").map((s,i)=><span key={i} style={{ color:"#00D4AA", fontSize:11 }}>{s}</span>)}</div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>Trusted by 50,000+ gig workers</p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT FORM ══ */}
      <div className="r-form">
        <div className="r-card">
          {/* Accent bar */}
          <div style={{ height:4, background:"linear-gradient(90deg,#00D4AA,#7C3AED,#60A5FA)" }}/>

          <div style={{ padding:"28px 30px 26px" }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#0F172A", margin:"0 0 4px" }}>Create Account</h2>
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Start protecting your income today — free to join.</p>

            <form autoComplete="off" onSubmit={e => e.preventDefault()} style={{ display:"flex", flexDirection:"column", gap:11 }}>
              {/* Honeypot */}
              <input type="text" style={{ display:"none" }} autoComplete="off" readOnly tabIndex={-1}/>
              <input type="password" style={{ display:"none" }} autoComplete="off" readOnly tabIndex={-1}/>

              {/* Full Name */}
              <div style={{ position:"relative" }}>
                <FI><IconUser/></FI>
                <input className="r-input" placeholder="Full Name" value={form.name} onChange={set("name")}
                  autoComplete="off" name="rg-name"
                  onFocus={e=>e.target.style.borderColor="#00D4AA"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
              </div>

              {/* Email */}
              <div>
                <div style={{ position:"relative" }}>
                  <FI><IconMail/></FI>
                  <input className="r-input" placeholder="Email Address" type="email" value={form.email} onChange={set("email")}
                    autoComplete="off" name="rg-email"
                    onFocus={e=>e.target.style.borderColor="#00D4AA"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
                </div>
                <p style={{ fontSize:10, color:"#94A3B8", margin:"4px 0 0 4px" }}>We'll send an OTP to this email for secure login.</p>
              </div>

              {/* Phone */}
              <div style={{ position:"relative" }}>
                <FI><IconPhone/></FI>
                <input className="r-input" placeholder="Phone Number" type="tel" value={form.phone} onChange={set("phone")}
                  autoComplete="off" name="rg-phone"
                  onFocus={e=>e.target.style.borderColor="#00D4AA"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
              </div>

              {/* Password */}
              <div>
                <div style={{ position:"relative" }}>
                  <FI><IconLock/></FI>
                  <input className={`r-input r-input-pw`} placeholder="Password"
                    type={showPw?"text":"password"} value={form.password} onChange={set("password")}
                    autoComplete="new-password" name="rg-pw"
                    onFocus={e=>e.target.style.borderColor="#00D4AA"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)}
                    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:0, display:"flex" }}>
                    <EyeIcon open={showPw}/>
                  </button>
                </div>
                {form.password && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                    <div style={{ flex:1, height:3, background:"#E2E8F0", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ width:`${(strength.score/4)*100}%`, height:"100%", background:strength.color, borderRadius:99, transition:"width 0.3s, background 0.3s" }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:strength.color, minWidth:50, textAlign:"right" }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Platform selector */}
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:8 }}>
                  Select Your Service Platform
                </p>
                <div style={{ display:"flex", overflowX:"auto", gap:8, paddingBottom:8, scrollbarWidth:"none" }}>
                  {partners.map(p => (
                    <div key={p.name} className={`plat-chip ${form.platform===p.name?"sel":""}`}
                      onClick={() => togglePlatform(p.name)}
                      style={{ flex:"0 0 calc((100% - 24px)/4)" }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:form.platform===p.name?"#F0FDFB":"#F8FAFC", border:`1px solid ${form.platform===p.name?(p.borderColor||"#00D4AA"):"#F1F5F9"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <img src={p.logoUrl} alt={p.name} style={{ maxWidth:20, maxHeight:14, objectFit:"contain" }}
                          onError={e=>{e.target.style.display="none";}}/>
                      </div>
                      <span className="plat-name">{p.name}</span>
                    </div>
                  ))}
                </div>
                {!form.platform && <p style={{ fontSize:10, color:"#94A3B8", margin:"2px 0 0" }}>Scroll to find or select your platform</p>}
              </div>

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:11, padding:"10px 14px", color:"#DC2626", fontSize:12, fontWeight:500 }}>⚠️ {error}</div>
              )}

              {/* Submit */}
              <button type="button" className="r-btn" onClick={submit} disabled={loading}>
                {loading ? (
                  <><svg style={{ width:16, height:16, animation:"rspin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg> Creating account…</>
                ) : "Sign Up Free →"}
              </button>
            </form>

            {/* Footer */}
            <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", paddingTop:12, margin:0 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color:"#00D4AA", fontWeight:700, textDecoration:"none" }}>Log in →</Link>
            </p>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", paddingTop:10 }}>
              {["No paperwork","Instant payout","AI-protected"].map(b => (
                <span key={b} className="r-trust"><span className="r-tdot"/> {b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}