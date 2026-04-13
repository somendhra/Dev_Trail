import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser, verifyOtp, socialLogin } from "../api";
import { auth, provider, isFirebaseConfigured } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { IconPhone, IconLock } from "../components/Icons";
import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/PlainBackground.png";

const PARTNER_LOGOS = [
  { src: "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", alt: "Zomato", bg: "#FFF1F0", border: "#fca5a5" },
  { src: "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", alt: "Swiggy", bg: "#FFF7ED", border: "#fdba74" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon", bg: "#FFFBEB", border: "#fcd34d" },
  { src: "https://play-lh.googleusercontent.com/0-sXSA0gnPDKi6EeQQCYPsrDx6DqnHELJJ7wFP8bWCpziL4k5kJf8RnOoupdnOFuDm_n=s256-rw", alt: "Flipkart", bg: "#EFF6FF", border: "#93c5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", alt: "Zepto", bg: "#FAF5FF", border: "#c4b5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", alt: "Dunzo", bg: "#F0FDF4", border: "#86efac" },
];

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}


const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .login-root * { font-family: 'DM Sans', sans-serif; }
  .login-root h1, .login-root h2, .login-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .login-card { animation: cardIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  .mob-banner { animation: bannerIn 0.7s ease both; }

  .login-input {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 44px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .login-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .login-input::placeholder { color: #94a3b8; }

  .login-input-single {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 14px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .login-input-single:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .login-input-single::placeholder { color: #94a3b8; }

  .login-btn {
    position: relative; overflow: hidden; width: 100%; padding: 12px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
    color: #fff; background: linear-gradient(135deg, #16a34a, #22c55e);
    border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.3); letter-spacing: 0.01em;
  }
  .login-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
  .login-btn:active { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .login-btn::after {
    content: ''; position: absolute; top: 0; left: -80%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
  }
  .login-btn:hover::after { animation: btnShine 0.55s ease forwards; }
  @keyframes btnShine { to { left: 130%; } }

  .social-btn {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 11px 0; border-radius: 12px; border: 1.5px solid #e2e8f0;
    background: #fff; cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s, background 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .social-btn:hover {
    border-color: #cbd5e1; background: #f8fafc;
    transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.1);
  }
  .social-btn:active { transform: translateY(0); }

  .trust-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #64748b;
    background: #f1f5f9; border-radius: 20px; padding: 5px 10px;
  }
  .trust-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; flex-shrink:0; }

  @keyframes lineGrow { from { transform:scaleY(0); opacity:0; } to { transform:scaleY(1); opacity:1; } }
  .acc-line { transform-origin:top; animation: lineGrow 1s ease both; }

  .feat-li { transition: background 0.2s, transform 0.2s; border-radius: 10px; padding: 6px 8px; }
  .feat-li:hover { background: rgba(255,255,255,0.55); transform: translateX(4px); }

  @keyframes spin { to { transform: rotate(360deg); } }

  .tab-btn {
    flex: 1; padding: 8px 12px; border-radius: 9px;
    font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    transition: all 0.2s ease;
  }
  .tab-btn.active { background: #fff; color: #15803d; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .tab-btn.inactive { background: transparent; color: #94a3b8; }
  .tab-btn.inactive:hover { color: #64748b; }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .logo-track {
    display: flex; gap: 10px;
    animation: ticker 14s linear infinite;
    width: max-content;
  }
  .logo-track:hover { animation-play-state: paused; }
  .logo-scroll-wrap {
    width: 240px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
  }
`;

function FieldIcon({ children }) {
  return (
    <span style={{
      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
      color: "#94a3b8", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
    }}>
      {children}
    </span>
  );
}

function SocialButtons({ loading, setLoading, setError, navigate, location }) {
  const handleSocialLogin = async (authProvider) => {
    if (!auth || !authProvider || !isFirebaseConfigured) {
      setError("Google login is not configured for this environment. Use email or phone login.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;
      
      const res = await socialLogin({
        email: user.email,
        name: user.displayName,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.token) {
        if (res.isAdmin) {
          setError("Admin account detected. Please use the Admin Login block.");
          return;
        }

        localStorage.setItem("token", res.token);
        const from = location.state?.from?.pathname || (res.isAdmin ? "/admin" : "/dashboard");
        localStorage.removeItem("isAdmin");
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", res.name || "");
        navigate(from, { replace: true });
      } else {
        setError("Login failed: no token received.");
      }
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        setError(error.message || "Failed to login with social account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {!isFirebaseConfigured && (
        <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 10px" }}>
          Google login is unavailable in local mode. Continue with email or mobile login.
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", whiteSpace: "nowrap" }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="social-btn" type="button" title="Continue with Google" onClick={() => handleSocialLogin(provider)} disabled={loading || !isFirebaseConfigured}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s, transform 0.18s, background 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <GoogleIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

function LogoScroller() {
  const doubled = [...PARTNER_LOGOS, ...PARTNER_LOGOS];
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Supported Platforms
      </p>
      <div className="logo-scroll-wrap">
        <div className="logo-track">
          {doubled.map((p, i) => (
            <div key={i} title={p.alt} style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: p.bg, border: "1.5px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <img src={p.src} alt={p.alt} style={{ maxWidth: 26, maxHeight: 20, objectFit: "contain" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormBody({ form, setForm, loading, error, submit, submitOtp, loginMode, setLoginMode, navigate, location, setLoading, setError, authRole, onRoleChange }) {
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onKey = (e) => { if (e.key === "Enter") { form.requiresOtp ? submitOtp() : submit(); } };
  const isAdminLogin = authRole === "admin";

  if (form.requiresOtp) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <FieldIcon><IconLock /></FieldIcon>
          <input className="login-input-single" placeholder="Enter 6-digit OTP" type="text" value={form.otp} onChange={set("otp")} onKeyDown={onKey} maxLength={6} />
        </div>
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
          OTP sent to {form.email || form.phone}
        </p>
        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: -6 }}>
          Check inbox and spam folder. Delivery can take up to 1-2 minutes.
        </p>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
            <span>⚠️</span> {error}
          </div>
        )}
        <button className="login-btn" onClick={submitOtp} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP →"}
        </button>
        <button type="button" onClick={submit} disabled={loading} style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 600, padding: "8px", borderRadius: "10px" }}>
          Resend OTP
        </button>
        <button type="button" onClick={() => setForm(f => ({ ...f, requiresOtp: false, otp: "" }))} style={{ border: "none", background: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          ← Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {location.state?.message && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
          ✅ {location.state.message}
        </div>
      )}

      <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
        <button type="button" className={`tab-btn ${authRole === "user" ? "active" : "inactive"}`} onClick={() => onRoleChange("user")}>
          User Login
        </button>
        <button type="button" className={`tab-btn ${authRole === "admin" ? "active" : "inactive"}`} onClick={() => onRoleChange("admin")}>
          Admin Login
        </button>
      </div>

      {!isAdminLogin && (
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
          <button type="button" className={`tab-btn ${loginMode === "credentials" ? "active" : "inactive"}`} onClick={() => setLoginMode("credentials")}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email
            </span>
          </button>
          <button type="button" className={`tab-btn ${loginMode === "mobile" ? "active" : "inactive"}`} onClick={() => setLoginMode("mobile")}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
              Mobile
            </span>
          </button>
        </div>
      )}

      {isAdminLogin || loginMode === "credentials" ? (
        <div style={{ position: "relative" }}>
          <FieldIcon><IconMail /></FieldIcon>
          <input className="login-input-single" placeholder="Email Address" type="email" value={form.email} onChange={set("email")} onKeyDown={onKey} autoComplete="email" />
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <FieldIcon><IconPhone /></FieldIcon>
          <input className="login-input-single" placeholder="Phone Number" type="tel" value={form.phone} onChange={set("phone")} onKeyDown={onKey} autoComplete="tel" />
        </div>
      )}

      <div style={{ position: "relative" }}>
        <FieldIcon><IconLock /></FieldIcon>
        <input
          className="login-input"
          type={showPw ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={set("password")}
          onKeyDown={onKey}
          autoComplete="current-password"
        />
        <button type="button" onClick={() => setShowPw(v => !v)}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}
          tabIndex={-1}>
          {showPw ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <button className="login-btn" onClick={submit} disabled={loading}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Logging in…
          </span>
        ) : isAdminLogin ? "Admin Login →" : "Login →"}
      </button>

      {!isAdminLogin && (
        <SocialButtons loading={loading} setLoading={setLoading} setError={setError} navigate={navigate} location={location} />
      )}

      {!isAdminLogin ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
          <Link to="/forgot" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={e => e.target.style.color = "#64748b"}
            onMouseLeave={e => e.target.style.color = "#94a3b8"}>
            Forgot password?
          </Link>
          <Link to="/register" style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={e => e.target.style.color = "#15803d"}
            onMouseLeave={e => e.target.style.color = "#16a34a"}>
            Create account →
          </Link>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
          Admin accounts are provisioned by the system. For user signup, switch to User Login.
        </p>
      )}

      {!isAdminLogin && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
          {["Secure login", "AI-protected", "Instant access"].map(b => (
            <span key={b} className="trust-pill"><span className="trust-dot" /> {b}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", phone: "", password: "", otp: "", requiresOtp: false });
  const [authRole, setAuthRole] = useState("user");
  const [loginMode, setLoginMode] = useState("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const routeRole = location.pathname.startsWith("/admin") || location.state?.role === "admin" ? "admin" : "user";
    setAuthRole(routeRole);

    if (routeRole === "admin") {
      setLoginMode("credentials");
      setForm({ email: "", phone: "", password: "", otp: "", requiresOtp: false });
      setError(null);
    }

    if (location.state?.email) {
      setForm(f => ({ ...f, email: location.state.email }));
    }
    if (location.state?.message) {
      setError(null); // Clear errors if we have a success message
    }
  }, [location.pathname, location.state]);

  React.useEffect(() => {
    if (authRole === "admin") {
      setLoginMode("credentials");
    }
  }, [authRole]);

  const handleRoleChange = (nextRole) => {
    if (nextRole === authRole) return;
    setAuthRole(nextRole);
    setLoginMode("credentials");
    setError(null);
    setForm({ email: "", phone: "", password: "", otp: "", requiresOtp: false });
  };

  const normalizeAuthResponse = (res) => {
    if (!res) return res;
    if (typeof res === "object") return res;
    if (typeof res !== "string") return res;

    const text = res.replace(/^\uFEFF/, "").trim();
    try {
      return JSON.parse(text);
    } catch (e) {
      const tokenMatch = text.match(/"token"\s*:\s*"([^"]+)"/);
      if (!tokenMatch) return res;
      return {
        token: tokenMatch[1],
        isAdmin: /"isAdmin"\s*:\s*true/.test(text),
      };
    }
  };

  const validate = () => {
    if (authRole === "admin" || loginMode === "credentials") {
      if (!form.email.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    } else {
      if (!form.phone.trim()) return "Phone number is required.";
    }
    if (!form.password) return "Password is required.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const identifier = (authRole === "admin" || loginMode === "credentials")
        ? form.email.trim().toLowerCase()
        : form.phone.trim();
      const rawRes = await loginUser({ identifier, password: form.password });
      const res = normalizeAuthResponse(rawRes);
      if (res?.error) {
        setError(res.error);
      } else if (res?.requiresOtp) {
        if (authRole === "admin") {
          setError("Admin accounts do not use OTP login. Please verify your admin credentials.");
          return;
        }
        setForm(f => ({ ...f, requiresOtp: true, mockOtp: res.mockOtp || "" }));
      } else if (res?.token) {
        if (authRole === "admin" && !res.isAdmin) {
          setError("This account is not an admin account. Please use User Login.");
          return;
        }
        if (authRole === "user" && res.isAdmin) {
          setError("Admin account detected. Please use the Admin Login block.");
          return;
        }

        localStorage.setItem("token", res.token);
        const from = location.state?.from?.pathname || (res.isAdmin ? "/admin" : "/dashboard");
        if (res.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
        } else {
          localStorage.removeItem("isAdmin");
          localStorage.setItem("userId", res.id);
          localStorage.setItem("userName", res.name || "");
        }
        navigate(from, { replace: true });
      } else {
        setError("Login failed: no token received.");
      }
    } catch (e) {
      setError(e.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    if (authRole === "admin") {
      setError("OTP verification is only available for user login.");
      return;
    }
    if (!form.otp || form.otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const identifier = loginMode === "credentials" ? form.email.trim().toLowerCase() : form.phone.trim();
      const rawRes = await verifyOtp({ identifier, otp: form.otp });
      const res = normalizeAuthResponse(rawRes);
      if (res?.error) {
        setError(res.error);
      } else if (res?.token) {
        if (res.isAdmin) {
          setError("Admin account detected. Please use the Admin Login block.");
          return;
        }
        localStorage.setItem("token", res.token);
        localStorage.removeItem("isAdmin");
        const from = location.state?.from?.pathname || (res.isAdmin ? "/admin" : "/dashboard");
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", res.name || "");
        navigate(from, { replace: true });
      } else {
        setError("Verification failed.");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formProps = { form, setForm, loading, setLoading, error, setError, submit, submitOtp, loginMode, setLoginMode, navigate, location, authRole, onRoleChange: handleRoleChange };

  return (
    <div className="login-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>
      <Navbar />

      <div className="lg:hidden">
        <div className="mob-banner w-full" style={{ backgroundImage: `url(${bannerSmall})`, backgroundSize: "cover", backgroundPosition: "center", height: "clamp(260px, 62vw, 360px)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 45%, rgba(248,250,252,0.96) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 28px", marginBottom: 48 }}>
            <span style={{ display: "inline-block", background: "rgba(22,163,74,0.90)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 10, boxShadow: "0 2px 12px rgba(22,163,74,0.4)" }}>AI-Powered Insurance</span>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(22px, 6.5vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 16px rgba(0,0,0,0.45)", margin: 0 }}>Welcome back 👋</h1>
          </div>
        </div>

        <div style={{ padding: "0 16px 48px", marginTop: -32, position: "relative", zIndex: 10 }}>
          <div className="login-card" style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(15,23,42,0.12)", overflow: "hidden" }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
            <div style={{ padding: "24px 20px 28px" }}>
              <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{authRole === "admin" ? "Admin Login" : "Login"}</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{authRole === "admin" ? "Secure access for administrators." : "Sign in to manage your insurance & claims."}</p>
              <FormBody {...formProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center" style={{ backgroundImage: `url(${bannerLarge})`, backgroundSize: "cover", backgroundPosition: "center right", minHeight: "calc(100vh - 64px)", padding: "28px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.80) 42%, rgba(248,250,252,0.10) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1040, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: -4 }}>
              <div className="acc-line" style={{ width: 4, height: 48, borderRadius: 99, background: "#16a34a", animationDelay: "0.1s" }} />
              <div className="acc-line" style={{ width: 4, height: 30, borderRadius: 99, background: "#86efac", alignSelf: "flex-end", animationDelay: "0.25s" }} />
            </div>

            <div>
              <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", marginBottom: 12 }}>AI-Powered Insurance</span>
              <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(26px, 2.6vw, 38px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>
                Welcome<br /><span style={{ color: "#16a34a" }}>back.</span>
              </h1>
              <p style={{ marginTop: 10, fontSize: 14, color: "#64748b", lineHeight: 1.65, maxWidth: 340 }}>
                Sign in to check your active plans, view payout history, and stay protected from disruptions — automatically.
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: "🛡️", text: "Your coverage is always active" },
                { icon: "⚡", text: "Auto-claims — no forms needed" },
                { icon: "💳", text: "Check your payout status anytime" },
              ].map(item => (
                <li key={item.text} className="feat-li" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", border: "1px solid #dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{item.text}</span>
                </li>
              ))}
            </ul>

            <LogoScroller />
          </div>

          <div className="login-card" style={{ marginLeft: "auto", width: "100%", maxWidth: 420 }}>
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(15,23,42,0.13), 0 4px 16px rgba(22,163,74,0.08)" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
              <div style={{ padding: "24px 28px 28px" }}>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{authRole === "admin" ? "Admin Login" : "Login"}</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{authRole === "admin" ? "Secure access for administrators." : "Sign in to manage your insurance & claims."}</p>
                <FormBody {...formProps} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}