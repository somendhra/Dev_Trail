import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser, verifyOtp, socialLogin } from "../api";
import { auth, provider, isFirebaseConfigured } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { IconPhone, IconLock } from "../components/Icons";
import { FaShieldAlt } from "react-icons/fa";

/* ─── Google Icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

/* ─── Styles ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  .lroot * { font-family:'Inter',sans-serif; }
  .lroot h1,.lroot h2,.lroot h3 { font-family:'Sora',sans-serif; }

  /* Layout */
  .lroot { display:flex; min-height:100vh; background:#060B18; }
  .l-hero { flex:0 0 45%; min-height:100vh; position:relative; overflow:hidden; background:#060B18; display:flex; flex-direction:column; padding:40px 48px; }
  .l-form { flex:1; background:#0F172A; display:flex; align-items:center; justify-content:center; min-height:100vh; overflow-y:auto; padding:32px 24px; }

  @media(max-width:900px){
    .lroot { flex-direction:column; }
    .l-hero { flex:none; min-height:auto; padding:32px 24px 40px; }
    .l-form { flex:none; min-height:auto; padding:24px 16px 40px; }
  }

  /* Orbs */
  .l-orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
  .l-orb-1 { width:400px;height:400px; top:-100px; left:-100px; background:radial-gradient(circle,rgba(0,212,170,0.2),transparent 70%); animation:lorb 10s ease-in-out infinite; }
  .l-orb-2 { width:320px;height:320px; bottom:-60px; right:-60px; background:radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%); animation:lorb 13s ease-in-out infinite 1.5s; }
  .l-orb-3 { width:260px;height:260px; top:45%; left:25%; background:radial-gradient(circle,rgba(96,165,250,0.12),transparent 70%); animation:lorb 8s ease-in-out infinite 3s; }
  @keyframes lorb {
    0%,100% { transform:translate(0,0) scale(1); }
    33% { transform:translate(18px,-18px) scale(1.06); }
    66% { transform:translate(-10px,12px) scale(0.95); }
  }

  /* Grid */
  .l-grid { position:absolute; inset:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),
                     linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);
    background-size:56px 56px;
  }

  /* Card */
  .l-card {
    background:#0B1121; border-radius:22px; width:100%; max-width:430px;
    box-shadow:0 24px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    overflow:hidden;
    animation: cardin 0.5s cubic-bezier(.22,.68,0,1.2) both;
  }
  @keyframes cardin {
    from { opacity:0; transform:translateY(20px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Input */
  .l-input {
    width:100%; border:1.5px solid #CBD5E1; border-radius:12px;
    padding:13px 14px 13px 42px; font-size:15px; font-weight:600; background:#F1F5F9;
    color:#000000 !important; outline:none; box-sizing:border-box;
    transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
    font-family:'Inter',sans-serif;
  }
  .l-input:focus { border-color:#00D4AA; box-shadow:0 0 0 3px rgba(0,212,170,0.2); background:#fff; color:#000000 !important; }
  .l-input::placeholder { color:#94A3B8; font-weight:500; font-size:14px; }
  .l-input-r { padding-right:42px; } /* for eye icon */

  /* Main button */
  .l-btn {
    width:100%; height:50px; border:none; cursor:pointer;
    border-radius:12px; font-size:15px; font-weight:700;
    color:#fff; font-family:'Inter',sans-serif;
    background:linear-gradient(135deg,#00D4AA,#7C3AED);
    box-shadow:0 4px 18px rgba(0,212,170,0.3);
    transition:transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    position:relative; overflow:hidden;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .l-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,212,170,0.45); }
  .l-btn:active:not(:disabled) { transform:scale(0.98); }
  .l-btn:disabled { opacity:0.65; cursor:not-allowed; }
  .l-btn::after {
    content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
    background:linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent);
    transform:skewX(-20deg);
  }
  .l-btn:hover:not(:disabled)::after { animation:lbtnshine 0.5s ease forwards; }
  @keyframes lbtnshine { to { left:130%; } }

  /* Role tabs */
  .l-roletabs { display:flex; background:#0F172A; border-radius:12px; padding:4px; margin-bottom:16px; border:1px solid #1E293B; }
  .l-roletab {
    flex:1; padding:9px 0; border-radius:9px; border:none; cursor:pointer;
    font-size:13px; font-weight:600; transition:all 0.2s; font-family:'Inter',sans-serif;
  }
  .l-roletab.on { background:#1E293B; color:#F8FAFC; box-shadow:0 1px 6px rgba(0,0,0,0.3); border:1px solid #334155; }
  .l-roletab.off { background:transparent; color:#64748B; }
  .l-roletab.off:hover { color:#94A3B8; }

  /* Method tabs */
  .l-methodtabs { display:flex; gap:8px; margin-bottom:20px; }
  .l-methodtab {
    padding:7px 18px; border-radius:999px; border:1.5px solid;
    font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s;
    font-family:'Inter',sans-serif;
  }
  .l-methodtab.on { background:#F8FAFC; color:#0F172A; border-color:#F8FAFC; }
  .l-methodtab.off { background:transparent; color:#64748B; border-color:#334155; }

  /* Google btn */
  .l-googlebtn {
    width:100%; height:44px; background:#0F172A; border:1.5px solid #334155; border-radius:12px;
    display:flex; align-items:center; justify-content:center; gap:10px;
    font-size:14px; font-weight:600; color:#F8FAFC; cursor:pointer;
    transition:background 0.2s, border-color 0.2s, transform 0.18s;
    font-family:'Inter',sans-serif;
  }
  .l-googlebtn:hover:not(:disabled) { background:#1E293B; border-color:#475569; transform:translateY(-1px); }
  .l-googlebtn:disabled { opacity:0.55; cursor:not-allowed; }

  /* Trust pills */
  .l-trust { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#94A3B8; background:#0F172A; border-radius:20px; padding:4px 10px; border:1px solid #1E293B; }
  .l-dot { width:6px;height:6px;border-radius:50%;background:#00D4AA;display:inline-block;flex-shrink:0; }

  /* Feature row */
  .l-feat { display:flex; align-items:center; gap:12px; padding:8px 0; border-radius:10px; transition:transform 0.2s; }
  .l-feat:hover { transform:translateX(4px); }

  /* Hero gradient text */
  .l-hgrad {
    background:linear-gradient(135deg,#00D4AA,#A78BFA);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
  }

  /* Error */
  .l-error { display:flex; gap:8px; align-items:flex-start; background:#FEF2F2; border:1.5px solid #FECACA; border-radius:12px; padding:10px 14px; color:#DC2626; font-size:13px; font-weight:500; }

  /* Success */
  .l-success { background:#F0FDF4; border:1px solid #BBF7D0; color:#15803D; padding:10px 14px; border-radius:12px; font-size:13px; font-weight:600; }

  @keyframes spin { to { transform:rotate(360deg); } }

  /* Platform badges */
  .l-plat { display:inline-flex; align-items:center; padding:6px 12px; border-radius:9px; font-size:12px; font-weight:700; border:1px solid; white-space:nowrap; transition:transform 0.2s; }
  .l-plat:hover { transform:translateY(-3px); }
`;

/* ─── Field icon wrapper ─── */
function FI({ children }) {
  return (
    <span style={{
      position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
      color:"#64748B", display:"flex", alignItems:"center", pointerEvents:"none", zIndex:1,
    }}>
      {children}
    </span>
  );
}

/* ─── Eye icon ─── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg style={{ width:18, height:18, animation:"spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

const PLATFORMS = [
  { name:"Zomato",   color:"#E23744", border:"rgba(226,55,68,0.3)",  bg:"rgba(226,55,68,0.1)"  },
  { name:"Flipkart", color:"#2874F0", border:"rgba(40,116,240,0.3)", bg:"rgba(40,116,240,0.1)" },
  { name:"Zepto",    color:"#A855F7", border:"rgba(168,85,247,0.3)", bg:"rgba(168,85,247,0.1)" },
  { name:"Blinkit",  color:"#F7C600", border:"rgba(247,198,0,0.3)",  bg:"rgba(247,198,0,0.1)"  },
  { name:"Amazon",   color:"#FF9900", border:"rgba(255,153,0,0.3)",  bg:"rgba(255,153,0,0.1)"  },
];

/* ─── Main Login ─── */
export default function Login() {
  const [form, setForm]         = useState({ email:"", phone:"", password:"", otp:"", requiresOtp:false });
  const [authRole, setAuthRole] = useState("user");
  const [loginMode, setLoginMode] = useState("credentials");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [showPw, setShowPw]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  React.useEffect(() => {
    const isAdmin = location.pathname.startsWith("/admin") || location.state?.role === "admin";
    setAuthRole(isAdmin ? "admin" : "user");
    if (isAdmin) setLoginMode("credentials");
    if (location.state?.email) setForm(f => ({ ...f, email: location.state.email }));
    setError(null);
  }, [location.pathname, location.state]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const onKey = e => { if (e.key === "Enter") form.requiresOtp ? submitOtp() : submit(); };

  /* Role switch */
  const handleRole = role => {
    if (role === authRole) return;
    setAuthRole(role); setLoginMode("credentials");
    setForm({ email:"", phone:"", password:"", otp:"", requiresOtp:false });
    setError(null);
  };

  /* Normalise */
  const norm = res => {
    if (!res || typeof res !== "string") return res;
    try { return JSON.parse(res.replace(/^\uFEFF/,"").trim()); } catch { return res; }
  };

  const validate = () => {
    if (authRole === "admin" || loginMode === "credentials") {
      if (!form.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
    } else {
      if (!form.phone.trim()) return "Phone number is required.";
    }
    if (!form.password) return "Password is required.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null); setLoading(true);
    try {
      const identifier = (authRole==="admin"||loginMode==="credentials") ? form.email.trim().toLowerCase() : form.phone.trim();
      const rawRes = await loginUser({ identifier, password: form.password });
      const res = norm(rawRes);
      if (res?.error) { setError(res.error); }
      else if (res?.requiresOtp) {
        if (authRole==="admin") { setError("Admin does not use OTP. Check your credentials."); return; }
        setForm(f => ({ ...f, requiresOtp:true }));
      } else if (res?.token) {
        if (authRole==="admin" && !res.isAdmin) { setError("Not an admin account. Use User Login."); return; }
        if (authRole==="user" && res.isAdmin)   { setError("Admin detected. Use Admin Login."); return; }
        localStorage.setItem("token", res.token);
        const from = location.state?.from?.pathname || (res.isAdmin ? "/admin" : "/dashboard");
        if (res.isAdmin) {
          localStorage.setItem("isAdmin","true");
          localStorage.setItem("adminEmail", res.email||form.email.trim());
          localStorage.setItem("adminUsername", res.name||"Admin");
          localStorage.removeItem("userId"); localStorage.removeItem("userName");
        } else {
          localStorage.removeItem("isAdmin");
          localStorage.setItem("userId", res.id);
          localStorage.setItem("userName", res.name||"");
        }
        navigate(from, { replace:true });
      } else { setError("Login failed: no token received."); }
    } catch (e) { setError(e.message || "Network error. Try again."); }
    finally { setLoading(false); }
  };

  const submitOtp = async () => {
    if (!form.otp || form.otp.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setError(null); setLoading(true);
    try {
      const identifier = loginMode==="credentials" ? form.email.trim().toLowerCase() : form.phone.trim();
      const rawRes = await verifyOtp({ identifier, otp: form.otp });
      const res = norm(rawRes);
      if (res?.error) { setError(res.error); }
      else if (res?.token) {
        localStorage.setItem("token", res.token); localStorage.removeItem("isAdmin");
        localStorage.setItem("userId", res.id); localStorage.setItem("userName", res.name||"");
        navigate(location.state?.from?.pathname||"/dashboard", { replace:true });
      } else { setError("Verification failed."); }
    } catch (e) { setError(e.message||"Something went wrong."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (!auth || !provider || !isFirebaseConfigured) { setError("Google login unavailable. Use email/phone."); return; }
    setLoading(true); setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await socialLogin({ email: result.user.email, name: result.user.displayName });
      if (res?.error) { setError(res.error); }
      else if (res?.token) {
        if (res.isAdmin) { setError("Admin account. Use Admin Login."); return; }
        localStorage.setItem("token", res.token); localStorage.removeItem("isAdmin");
        localStorage.setItem("userId", res.id); localStorage.setItem("userName", res.name||"");
        navigate(location.state?.from?.pathname||"/dashboard", { replace:true });
      } else { setError("Login failed."); }
    } catch (e) { if (e.code !== "auth/popup-closed-by-user") setError(e.message||"Google login failed."); }
    finally { setLoading(false); }
  };

  /* ─── OTP screen ─── */
  if (form.requiresOtp) {
    return (
      <div className="lroot">
        <style>{STYLES}</style>
        <div className="l-form" style={{ background:"#060B18" }}>
          <div className="l-card" style={{ padding:36 }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#00D4AA,#7C3AED)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                <FaShieldAlt style={{ color:"#fff", fontSize:22 }} />
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#0F172A", margin:"0 0 6px" }}>Check Your Email</h2>
              <p style={{ fontSize:13, color:"#64748B" }}>OTP sent to <strong>{form.email || form.phone}</strong><br/>Check inbox &amp; spam. May take 1-2 min.</p>
            </div>
            <div style={{ position:"relative", marginBottom:14 }}>
              <FI><IconLock/></FI>
              <input className="l-input" placeholder="Enter 6-digit OTP" type="text" value={form.otp} onChange={set("otp")} onKeyDown={onKey} maxLength={6} style={{ textAlign:"center", letterSpacing:"6px", fontSize:20, fontWeight:700 }} />
            </div>
            {error && <div className="l-error" style={{ marginBottom:12 }}>⚠️ {error}</div>}
            <button className="l-btn" onClick={submitOtp} disabled={loading}>
              {loading ? <Spinner/> : "Verify OTP →"}
            </button>
            <div style={{ display:"flex", gap:12, marginTop:12 }}>
              <button onClick={submit} disabled={loading} style={{ flex:1, padding:"9px", border:"1.5px solid #334155", borderRadius:10, background:"#0F172A", color:"#94A3B8", fontSize:13, fontWeight:600, cursor:"pointer" }}>Resend OTP</button>
              <button onClick={() => setForm(f=>({...f,requiresOtp:false,otp:""}))} style={{ flex:1, padding:"9px", border:"none", borderRadius:10, background:"none", color:"#64748B", fontSize:13, fontWeight:600, cursor:"pointer" }}>← Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = authRole === "admin";

  return (
    <div className="lroot">
      <style>{STYLES}</style>

      {/* ══ LEFT HERO ══ */}
      <div className="l-hero">
        <div className="l-grid" />
        <div className="l-orb l-orb-1" />
        <div className="l-orb l-orb-2" />
        <div className="l-orb l-orb-3" />

        {/* Nav */}
        <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"auto" }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#00D4AA,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 16px rgba(0,212,170,0.3)" }}>
              <FaShieldAlt style={{ color:"#fff", fontSize:16 }} />
            </div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"#F1F5F9" }}>GigShield</span>
          </Link>
          <Link to="/" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none", transition:"color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}
          >← Home</Link>
        </div>

        {/* Hero content */}
        <div style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 0" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, borderRadius:999, padding:"5px 14px", fontSize:11, letterSpacing:"1.5px", fontWeight:700, textTransform:"uppercase", border:"1px solid rgba(0,212,170,0.35)", background:"rgba(0,212,170,0.08)", color:"#00D4AA", marginBottom:22, width:"fit-content" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4AA", display:"inline-block" }} />
            AI-Powered Insurance
          </div>

          <h1 style={{ fontSize:"clamp(38px,4.5vw,60px)", fontWeight:900, color:"#F1F5F9", lineHeight:1.1, margin:"0 0 6px" }}>Welcome</h1>
          <h1 style={{ fontSize:"clamp(38px,4.5vw,60px)", fontWeight:900, lineHeight:1.1, margin:"0 0 22px" }} className="l-hgrad">back.</h1>

          <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.75, maxWidth:340, marginBottom:36 }}>
            Sign in to check your active plans, view payout history, and stay protected from disruptions — automatically.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:36 }}>
            {[
              { icon:"🛡️", bg:"rgba(59,130,246,0.15)", text:"Your coverage is always active" },
              { icon:"⚡", bg:"rgba(234,179,8,0.15)",  text:"Auto-claims — no forms needed" },
              { icon:"💳", bg:"rgba(0,212,170,0.15)",  text:"Check your payout status anytime" },
            ].map(f => (
              <div key={f.text} className="l-feat">
                <div style={{ width:36, height:36, borderRadius:10, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{f.icon}</div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Platforms */}
          <div>
            <p style={{ fontSize:10, letterSpacing:"2px", color:"rgba(255,255,255,0.25)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Supported Platforms</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {PLATFORMS.map(p => (
                <span key={p.name} className="l-plat" style={{ color:p.color, border:`1px solid ${p.border}`, background:p.bg }}>{p.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:12, marginTop:"auto", paddingTop:24 }}>
          <div style={{ display:"flex" }}>
            {["#00D4AA","#7C3AED","#60A5FA"].map((c,i)=>(
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
      <div className="l-form">
        <div className="l-card">
          {/* Accent bar */}
          <div style={{ height:4, background:"linear-gradient(90deg,#00D4AA,#7C3AED,#60A5FA)" }} />

          <form autoComplete="off" onSubmit={e => e.preventDefault()} style={{ padding:"32px 34px 28px", display:"contents" }}>
          <div style={{ padding:"32px 34px 28px" }}>
            {/* Hidden honeypot fields to stop browser autofill */}
            <input type="text" name="preventAutofill" autoComplete="off" style={{ display:"none" }} tabIndex={-1} readOnly />
            <input type="password" name="preventAutofill2" autoComplete="off" style={{ display:"none" }} tabIndex={-1} readOnly />

            <h2 style={{ fontSize:24, fontWeight:800, color:"#F8FAFC", margin:"0 0 4px" }}>{isAdmin ? "Admin Login" : "Login"}</h2>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 22px" }}>
              {isAdmin ? "Secure access for administrators." : "Sign in to manage your insurance & claims."}
            </p>

            {/* Success msg */}
            {location.state?.message && (
              <div className="l-success" style={{ marginBottom:16 }}>✅ {location.state.message}</div>
            )}

            {/* Role tab */}
            <div className="l-roletabs">
              <button className={`l-roletab ${authRole==="user"?"on":"off"}`} onClick={()=>handleRole("user")}>
                👤 User Login
              </button>
              <button className={`l-roletab ${authRole==="admin"?"on":"off"}`} onClick={()=>handleRole("admin")}>
                🔐 Admin Login
              </button>
            </div>

            {/* Method tab (users only) */}
            {!isAdmin && (
              <div className="l-methodtabs">
                <button className={`l-methodtab ${loginMode==="credentials"?"on":"off"}`} onClick={()=>setLoginMode("credentials")}>
                  ✉️ Email
                </button>
                <button className={`l-methodtab ${loginMode==="mobile"?"on":"off"}`} onClick={()=>setLoginMode("mobile")}>
                  📱 Mobile
                </button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Identifier */}
              <div style={{ position:"relative" }}>
                <FI>{isAdmin||loginMode==="credentials" ? <IconMail/> : <IconPhone/>}</FI>
                <input
                  className="l-input"
                  type={isAdmin||loginMode==="credentials" ? "email" : "tel"}
                  placeholder={isAdmin||loginMode==="credentials" ? "Email address" : "Mobile number"}
                  value={isAdmin||loginMode==="credentials" ? form.email : form.phone}
                  onChange={isAdmin||loginMode==="credentials" ? set("email") : set("phone")}
                  onKeyDown={onKey}
                  autoComplete="off"
                  name="gs-identifier"
                />
              </div>

              {/* Password */}
              <div style={{ position:"relative" }}>
                <FI><IconLock/></FI>
                <input
                  className={`l-input l-input-r`}
                  type={showPw?"text":"password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={onKey}
                  autoComplete="new-password"
                  name="gs-password"
                />
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748B", padding:0, display:"flex" }}>
                  <EyeIcon open={showPw}/>
                </button>
              </div>

              {/* Error */}
              {error && <div className="l-error">⚠️ {error}</div>}

              {/* Login button */}
              <button className="l-btn" onClick={submit} disabled={loading}>
                {loading ? <><Spinner/> Logging in…</> : isAdmin ? "Admin Login →" : "Login →"}
              </button>

              {/* Google (users only) */}
              {!isAdmin && (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1, height:1, background:"#334155" }} />
                    <span style={{ fontSize:11, color:"#64748B", fontWeight:600, whiteSpace:"nowrap" }}>or continue with</span>
                    <div style={{ flex:1, height:1, background:"#334155" }} />
                  </div>
                  {!isFirebaseConfigured && (
                    <div style={{ fontSize:12, color:"#92400E", background:"#FFFBEB", border:"1px solid #FCD34D", borderRadius:10, padding:"8px 12px" }}>
                      ⚠️ Google login is unavailable in local mode. Use email or mobile login.
                    </div>
                  )}
                  <button className="l-googlebtn" onClick={handleGoogle} disabled={loading||!isFirebaseConfigured}>
                    <GoogleIcon/>
                    Continue with Google
                  </button>
                </>
              )}

              {/* Links */}
              {!isAdmin ? (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <Link to="/forgot" style={{ fontSize:13, color:"#94A3B8", textDecoration:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    Forgot password?
                  </Link>
                  <Link to="/register" style={{ fontSize:13, color:"#00D4AA", fontWeight:700, textDecoration:"none" }}>
                    Create account →
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize:12, color:"#94A3B8", textAlign:"center", margin:0 }}>
                  Admin accounts are provisioned by the system. For workers, switch to User Login.
                </p>
              )}

              {/* Trust badges */}
              {!isAdmin && (
                <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap", paddingTop:4 }}>
                  {["Secure login","AI-protected","Instant access"].map(b => (
                    <span key={b} className="l-trust"><span className="l-dot" /> {b}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}