import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api";
import { FaShieldAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

/* ─── Password Strength ─── */
function pwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#334155" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#00D4AA" },
  ];
  return { score, ...map[score] };
}

/* ─── Step Indicator ─── */
function StepIndicator({ step }) {
  const steps = ["Email", "Verify", "Done"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const isActive = step === idx;
        const isDone = step > idx;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800,
                background: isDone ? "rgba(0,212,170,0.2)" : isActive ? "linear-gradient(135deg,#00D4AA,#7C3AED)" : "rgba(255,255,255,0.06)",
                color: isDone ? "#00D4AA" : isActive ? "#fff" : "rgba(255,255,255,0.3)",
                border: isDone ? "1px solid rgba(0,212,170,0.4)" : isActive ? "none" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isActive ? "0 0 16px rgba(0,212,170,0.35)" : "none",
                transition: "all 0.3s",
              }}>
                {isDone ? "✓" : idx}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? "#00D4AA" : isDone ? "rgba(0,212,170,0.6)" : "rgba(255,255,255,0.25)", letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 1, background: step > idx ? "rgba(0,212,170,0.4)" : "rgba(255,255,255,0.08)", marginBottom: 16, transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Form Body ─── */
function FormBody({ step, setStep, form, setForm, loading, error, setError, handleSendOtp, handleResetPassword }) {
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const strength = pwStrength(form.newPassword);

  const inputStyle = (disabled) => ({
    width: "100%", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
    padding: "12px 16px 12px 44px", fontSize: 14, background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
    color: disabled ? "rgba(255,255,255,0.35)" : "#F1F5F9", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    fontFamily: "'Inter', sans-serif",
    cursor: disabled ? "not-allowed" : "text",
    opacity: disabled ? 0.6 : 1,
  });

  const iconStyle = {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
  };

  const handleFocus = (e) => { e.target.style.borderColor = "#00D4AA"; e.target.style.boxShadow = "0 0 0 3px rgba(0,212,170,0.15)"; e.target.style.background = "rgba(0,212,170,0.05)"; };
  const handleBlur  = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; };

  // Ref trick: prevent browser autofill from pre-filling the new password field
  const pwRef = useRef(null);
  useEffect(() => {
    if (step === 2 && pwRef.current) {
      pwRef.current.value = "";
      setTimeout(() => { if (pwRef.current) pwRef.current.value = ""; }, 200);
    }
  }, [step]);

  /* Step 1: Email */
  if (step === 1) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StepIndicator step={1} />
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 4, lineHeight: 1.6 }}>
        Enter your registered email and we'll send you a verification code.
      </p>
      <div style={{ position: "relative" }}>
        <span style={iconStyle}><FaEnvelope size={14} /></span>
        <input
          style={inputStyle(loading)}
          placeholder="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          onFocus={!loading ? handleFocus : undefined}
          onBlur={!loading ? handleBlur : undefined}
          onKeyDown={(e) => !loading && e.key === "Enter" && handleSendOtp()}
          autoComplete="username"
          name="fp-email"
          disabled={loading}
        />
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#F87171", fontSize: 13, fontWeight: 500 }}>
          <span>⚠️</span> {error}
        </div>
      )}
      <button
        onClick={handleSendOtp}
        disabled={loading}
        style={{
          position: "relative", overflow: "hidden", width: "100%", padding: "13px", borderRadius: 12,
          fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
          background: "linear-gradient(135deg, #00D4AA, #7C3AED)", border: "none", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 20px rgba(0,212,170,0.35)", letterSpacing: "0.02em",
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,212,170,0.45)"; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,170,0.35)"; }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg style={{ width: 16, height: 16, animation: "fpSpin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Sending OTP…
          </span>
        ) : "Send Reset Code →"}
      </button>
      <Link to="/login" style={{ fontSize: 13, color: "#00D4AA", fontWeight: 700, textDecoration: "none", textAlign: "center", opacity: 0.8, transition: "opacity 0.2s" }}
        onMouseEnter={e => e.target.style.opacity = 1}
        onMouseLeave={e => e.target.style.opacity = 0.8}>
        ← Back to Login
      </Link>
    </div>
  );

  /* Step 2: OTP + New Password */
  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StepIndicator step={2} />

      {/* Locked email display */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 10, padding: "8px 14px" }}>
        <FaEnvelope size={12} color="#00D4AA" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginRight: 4 }}>Sending to:</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#00D4AA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.email}</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>🔒 locked</span>
      </div>

      {/* Dummy hidden fields to trick browser autofill away from our real fields */}
      <input type="text" style={{ display: "none" }} autoComplete="username" readOnly />
      <input type="password" style={{ display: "none" }} autoComplete="current-password" readOnly />

      {/* OTP */}
      <div style={{ position: "relative" }}>
        <span style={iconStyle}><FaLock size={14} /></span>
        <input
          style={inputStyle(loading)}
          placeholder="Enter 6-digit OTP"
          type="text"
          inputMode="numeric"
          value={form.otp}
          onChange={set("otp")}
          maxLength={6}
          onFocus={!loading ? handleFocus : undefined}
          onBlur={!loading ? handleBlur : undefined}
          autoComplete="one-time-code"
          name="fp-otp"
          disabled={loading}
        />
      </div>

      {/* New Password */}
      <div>
        <div style={{ position: "relative" }}>
          <span style={iconStyle}><FaLock size={14} /></span>
          <input
            ref={pwRef}
            style={{ ...inputStyle(loading), paddingRight: 44 }}
            placeholder="New Password"
            type={showPw ? "text" : "password"}
            value={form.newPassword}
            onChange={set("newPassword")}
            onFocus={!loading ? handleFocus : undefined}
            onBlur={!loading ? handleBlur : undefined}
            onKeyDown={(e) => !loading && e.key === "Enter" && handleResetPassword()}
            autoComplete="new-password"
            name="fp-new-password"
            disabled={loading}
          />
          <button type="button" onClick={() => !loading && setShowPw(v => !v)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}
            tabIndex={-1}>
            {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          </button>
        </div>
        {form.newPassword && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(strength.score / 4) * 100}%`, background: strength.color, borderRadius: 99, transition: "width 0.3s, background 0.3s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, minWidth: 52 }}>{strength.label}</span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div style={{ position: "relative" }}>
        <span style={iconStyle}><FaLock size={14} /></span>
        <input
          style={inputStyle(loading)}
          placeholder="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          onFocus={!loading ? handleFocus : undefined}
          onBlur={!loading ? handleBlur : undefined}
          onKeyDown={(e) => !loading && e.key === "Enter" && handleResetPassword()}
          autoComplete="new-password"
          name="fp-confirm-password"
          disabled={loading}
        />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#F87171", fontSize: 13, fontWeight: 500 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleResetPassword}
        disabled={loading}
        style={{
          position: "relative", overflow: "hidden", width: "100%", padding: "13px", borderRadius: 12,
          fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
          background: "linear-gradient(135deg, #00D4AA, #7C3AED)", border: "none", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 20px rgba(0,212,170,0.35)", letterSpacing: "0.02em",
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,212,170,0.45)"; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,170,0.35)"; }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg style={{ width: 16, height: 16, animation: "fpSpin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Resetting…
          </span>
        ) : "Reset Password →"}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" onClick={handleSendOtp} disabled={loading}
          style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontWeight: 600, padding: "8px 14px", borderRadius: 10, fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
          Resend OTP
        </button>
        <button type="button" onClick={() => { setStep(1); setError(null); setForm(f => ({ ...f, otp: "", newPassword: "", confirmPassword: "" })); }}
          style={{ border: "none", background: "none", color: "#00D4AA", fontSize: 13, cursor: "pointer", fontWeight: 700, opacity: 0.8, transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
          ← Change email
        </button>
      </div>
    </div>
  );

  /* Step 3: Success */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", padding: "8px 0" }}>
      <StepIndicator step={3} />
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,212,170,0.12)", border: "2px solid rgba(0,212,170,0.3)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fpPulse 0.5s ease-out both" }}>
        <FaCheckCircle size={32} color="#00D4AA" />
      </div>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F1F5F9", margin: 0 }}>Password Reset!</h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.65 }}>
        Your password has been successfully reset.<br />You can now login with your new password.
      </p>
      <Link to="/login" state={{ message: "Password reset successfully. Please login.", email: form.email }} style={{ textDecoration: "none", width: "100%" }}>
        <button style={{
          width: "100%", padding: "13px", borderRadius: 12, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
          color: "#fff", background: "linear-gradient(135deg, #00D4AA, #7C3AED)", border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,212,170,0.35)", letterSpacing: "0.02em", transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,212,170,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,170,0.35)"; }}>
          Go to Login →
        </button>
      </Link>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ForgotPassword() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }
    setError(null); setLoading(true);
    try {
      const res = await forgotPassword({ email: form.email.trim().toLowerCase() });
      if (res?.error) { setError(res.error); }
      else if (res?.message) { setStep(2); }
      else { setError("Unexpected response from server."); }
    } catch (e) { setError(e.message || "Network error."); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!form.otp || form.otp.length < 6) { setError("Please enter the 6-digit OTP."); return; }
    if (!form.newPassword) { setError("New password is required."); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setError(null); setLoading(true);
    try {
      const res = await resetPassword({ email: form.email.trim().toLowerCase(), otp: form.otp.trim(), newPassword: form.newPassword });
      if (res?.error) { setError(res.error); }
      else if (res?.message) { setStep(3); }
      else { setError("Unexpected response from server."); }
    } catch (e) { setError(e.message || "Network error."); }
    finally { setLoading(false); }
  };

  const formProps = { step, setStep, form, setForm, loading, error, setError, handleSendOtp, handleResetPassword };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060B18", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fpSpin { to { transform: rotate(360deg); } }
        @keyframes fpPulse { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fpOrb { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(18px,-18px) scale(1.06); } 66% { transform:translate(-10px,12px) scale(0.95); } }
        @keyframes fpCardIn { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .fp-hero { flex:0 0 45%; min-height:100vh; position:relative; overflow:hidden; background:#060B18; display:flex; flex-direction:column; justify-content:center; padding:48px 56px; }
        .fp-right { flex:1; background:#0A1020; display:flex; align-items:center; justify-content:center; padding:40px 32px; min-height:100vh; overflow-y:auto; }
        .fp-card { background:#0D1526; border-radius:22px; width:100%; max-width:430px; box-shadow:0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07); overflow:hidden; animation: fpCardIn 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .fp-orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
        .fp-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px); background-size:56px 56px; }
        /* ── Kill browser autofill white background on dark inputs ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(0,212,170,0.05) inset !important;
          -webkit-text-fill-color: #F1F5F9 !important;
          caret-color: #F1F5F9;
          border-color: rgba(0,212,170,0.4) !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        @media(max-width:900px) {
          .fp-hero { flex:none; min-height:250px; padding:40px 24px; justify-content:flex-end; padding-bottom:48px; }
          .fp-right { flex:none; min-height:auto; padding:0 16px 48px; margin-top:-32px; position:relative; z-index:10; }
        }
      `}</style>

      {/* LEFT HERO */}
      <div className="fp-hero">
        <div className="fp-grid" />
        <div className="fp-orb" style={{ width: 360, height: 360, top: -100, left: -100, background: "radial-gradient(circle, rgba(0,212,170,0.2), transparent 70%)", animation: "fpOrb 10s ease-in-out infinite" }} />
        <div className="fp-orb" style={{ width: 280, height: 280, bottom: -60, right: -60, background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)", animation: "fpOrb 13s ease-in-out infinite 1.5s" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#00D4AA,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,212,170,0.4)" }}>
            <FaShieldAlt size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg,#F1F5F9,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>GigShield</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(0,212,170,0.7)" }}>Account Recovery</div>
          </div>
        </div>

        {/* Hero Text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, background: "rgba(0,212,170,0.12)", color: "#00D4AA", border: "1px solid rgba(0,212,170,0.25)", marginBottom: 16 }}>
            Secure Password Reset
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(26px, 2.8vw, 40px)", fontWeight: 900, color: "#F1F5F9", lineHeight: 1.15, margin: "0 0 16px" }}>
            Forgot your<br />
            <span style={{ background: "linear-gradient(135deg,#00D4AA,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>password?</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340, margin: "0 0 32px" }}>
            No worries! Reset your password securely using your registered email. We'll send you a one-time verification code instantly.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "📧", text: "OTP sent directly to your email" },
              { icon: "🔒", text: "Set a strong new password instantly" },
              { icon: "⚡", text: "Access restored in under 2 minutes" },
            ].map(item => (
              <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 10, transition: "background 0.2s, transform 0.2s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="fp-right">
        <div className="fp-card">
          {/* Gradient top bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#00D4AA,#7C3AED,#60A5FA)" }} />
          <div style={{ padding: "28px 28px 32px" }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>
              {step === 3 ? "All Done!" : "Reset Password"}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
              {step === 1 ? "Enter your email to receive a one-time code." : step === 2 ? "Enter your OTP and choose a new password." : "Your account has been secured."}
            </p>
            <FormBody {...formProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
