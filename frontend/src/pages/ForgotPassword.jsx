import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { forgotPassword, resetPassword } from "../api";
import { IconLock } from "../components/Icons";
import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/PlainBackground.png";

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .forgot-root * { font-family: 'DM Sans', sans-serif; }
  .forgot-root h1, .forgot-root h2, .forgot-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .forgot-card { animation: cardIn 0.55s cubic-bezier(.22,.68,0,1.2) both; }

  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  .mob-banner { animation: bannerIn 0.7s ease both; }

  .forgot-input {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 14px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .forgot-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .forgot-input::placeholder { color: #94a3b8; }

  .forgot-input-pw {
    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 11px 44px 11px 44px; font-size: 14px; background: #f8fafc;
    color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .forgot-input-pw:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.13); background: #fff; }
  .forgot-input-pw::placeholder { color: #94a3b8; }

  .forgot-btn {
    position: relative; overflow: hidden; width: 100%; padding: 12px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
    color: #fff; background: linear-gradient(135deg, #16a34a, #22c55e);
    border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.3); letter-spacing: 0.01em;
  }
  .forgot-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }
  .forgot-btn:active { transform: translateY(0); }
  .forgot-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .forgot-btn::after {
    content: ''; position: absolute; top: 0; left: -80%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: skewX(-20deg);
  }
  .forgot-btn:hover::after { animation: btnShine 0.55s ease forwards; }
  @keyframes btnShine { to { left: 130%; } }

  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes lineGrow { from { transform:scaleY(0); opacity:0; } to { transform:scaleY(1); opacity:1; } }
  .acc-line { transform-origin:top; animation: lineGrow 1s ease both; }

  .feat-li { transition: background 0.2s, transform 0.2s; border-radius: 10px; padding: 6px 8px; }
  .feat-li:hover { background: rgba(255,255,255,0.55); transform: translateX(4px); }

  .pw-bar { height: 3px; border-radius: 99px; transition: width 0.3s, background 0.3s; }

  .step-indicator {
    display: flex; align-items: center; gap: 0; justify-content: center; margin-bottom: 18px;
  }
  .step-dot {
    width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; transition: all 0.3s ease;
  }
  .step-dot.active { background: #16a34a; color: #fff; box-shadow: 0 2px 8px rgba(22,163,74,0.3); }
  .step-dot.done { background: #dcfce7; color: #15803d; }
  .step-dot.pending { background: #f1f5f9; color: #94a3b8; }
  .step-line { width: 32px; height: 2px; border-radius: 99px; transition: background 0.3s; }
  .step-line.active { background: #16a34a; }
  .step-line.pending { background: #e2e8f0; }

  @keyframes successPulse {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .success-icon { animation: successPulse 0.5s ease-out both; }
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

function pwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#e2e8f0" };
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
    { label: "Strong",    color: "#16a34a" },
  ];
  return { score, ...map[score] };
}

function StepIndicator({ step }) {
  return (
    <div className="step-indicator">
      <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : 'pending'}`}>1</div>
      <div className={`step-line ${step >= 2 ? 'active' : 'pending'}`} />
      <div className={`step-dot ${step >= 2 ? (step > 2 ? 'done' : 'active') : 'pending'}`}>2</div>
      <div className={`step-line ${step >= 3 ? 'active' : 'pending'}`} />
      <div className={`step-dot ${step >= 3 ? 'active' : 'pending'}`}>3</div>
    </div>
  );
}

function FormBody({ step, setStep, form, setForm, loading, error, setError, handleSendOtp, handleResetPassword }) {
  const [showPw, setShowPw] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const strength = pwStrength(form.newPassword);

  // Step 1: Enter email
  if (step === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <StepIndicator step={1} />
        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 4 }}>
          Enter your registered email address and we'll send you a verification code to reset your password.
        </p>
        <div style={{ position: "relative" }}>
          <FieldIcon><IconMail /></FieldIcon>
          <input
            className="forgot-input"
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={set("email")}
            onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            autoComplete="email"
          />
        </div>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
            <span>⚠️</span> {error}
          </div>
        )}
        <button className="forgot-btn" onClick={handleSendOtp} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Sending OTP…
            </span>
          ) : "Send Reset Code →"}
        </button>
        <Link to="/login" style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, textDecoration: "none", textAlign: "center" }}
          onMouseEnter={e => e.target.style.color = "#15803d"}
          onMouseLeave={e => e.target.style.color = "#16a34a"}>
          ← Back to Login
        </Link>
      </div>
    );
  }

  // Step 2: Enter OTP + new password
  if (step === 2) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <StepIndicator step={2} />
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
          OTP sent to <strong>{form.email}</strong>
        </p>
        <div style={{ position: "relative" }}>
          <FieldIcon><IconLock /></FieldIcon>
          <input className="forgot-input" placeholder="Enter 6-digit OTP" type="text" value={form.otp} onChange={set("otp")} maxLength={6} />
        </div>

        <div>
          <div style={{ position: "relative" }}>
            <FieldIcon><IconLock /></FieldIcon>
            <input
              className="forgot-input-pw"
              placeholder="New Password"
              type={showPw ? "text" : "password"}
              value={form.newPassword}
              onChange={set("newPassword")}
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
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
          {form.newPassword && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 99, height: 3, overflow: "hidden" }}>
                <div className="pw-bar" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, minWidth: 52 }}>{strength.label}</span>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <FieldIcon><IconLock /></FieldIcon>
          <input
            className="forgot-input"
            placeholder="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
          />
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <button className="forgot-btn" onClick={handleResetPassword} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Resetting…
            </span>
          ) : "Reset Password →"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button type="button" onClick={handleSendOtp} disabled={loading}
            style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 600, padding: "8px 12px", borderRadius: "10px" }}>
            Resend OTP
          </button>
          <button type="button" onClick={() => { setStep(1); setError(null); setForm(f => ({ ...f, otp: "", newPassword: "", confirmPassword: "", mockOtp: "" })); }}
            style={{ border: "none", background: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", padding: "12px 0" }}>
      <StepIndicator step={3} />
      <div className="success-icon"><IconCheck /></div>
      <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Password Reset!</h3>
      <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 1.6 }}>
        Your password has been successfully reset.<br />You can now login with your new password.
      </p>
      <Link to="/login" state={{ message: "Password reset successfully. Please login.", email: form.email }}
        style={{ textDecoration: "none", width: "100%" }}>
        <button className="forgot-btn" style={{ width: "100%" }}>
          Go to Login →
        </button>
      </Link>
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpw, 3=success
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "", mockOtp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword({ email: form.email.trim().toLowerCase() });
      if (res?.error) {
        setError(res.error);
      } else if (res?.message) {
        setForm(f => ({ ...f, mockOtp: res.mockOtp || "" }));
        setStep(2);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.otp || form.otp.length < 6) { setError("Please enter the 6-digit OTP."); return; }
    if (!form.newPassword) { setError("New password is required."); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await resetPassword({
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });
      if (res?.error) {
        setError(res.error);
      } else if (res?.message) {
        setStep(3);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const formProps = { step, setStep, form, setForm, loading, error, setError, handleSendOtp, handleResetPassword };

  return (
    <div className="forgot-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{STYLES}</style>
      <Navbar />

      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="mob-banner w-full" style={{ backgroundImage: `url(${bannerSmall})`, backgroundSize: "cover", backgroundPosition: "center", height: "clamp(220px, 50vw, 300px)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.22) 45%, rgba(248,250,252,0.96) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 28px", marginBottom: 48 }}>
            <span style={{ display: "inline-block", background: "rgba(22,163,74,0.90)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 10, boxShadow: "0 2px 12px rgba(22,163,74,0.4)" }}>Account Recovery</span>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(22px, 6.5vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 16px rgba(0,0,0,0.45)", margin: 0 }}>Reset Password 🔐</h1>
          </div>
        </div>

        <div style={{ padding: "0 16px 48px", marginTop: -32, position: "relative", zIndex: 10 }}>
          <div className="forgot-card" style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(15,23,42,0.12)", overflow: "hidden" }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
            <div style={{ padding: "24px 20px 28px" }}>
              <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Forgot Password</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Recover your account access securely.</p>
              <FormBody {...formProps} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-center" style={{ backgroundImage: `url(${bannerLarge})`, backgroundSize: "cover", backgroundPosition: "center right", minHeight: "calc(100vh - 64px)", padding: "28px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.80) 42%, rgba(248,250,252,0.10) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1040, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: -4 }}>
              <div className="acc-line" style={{ width: 4, height: 48, borderRadius: 99, background: "#16a34a", animationDelay: "0.1s" }} />
              <div className="acc-line" style={{ width: 4, height: 30, borderRadius: 99, background: "#86efac", alignSelf: "flex-end", animationDelay: "0.25s" }} />
            </div>

            <div>
              <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", marginBottom: 12 }}>Account Recovery</span>
              <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(26px, 2.6vw, 38px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>
                Forgot your<br /><span style={{ color: "#16a34a" }}>password?</span>
              </h1>
              <p style={{ marginTop: 10, fontSize: 14, color: "#64748b", lineHeight: 1.65, maxWidth: 340 }}>
                No worries! Reset your password securely using your registered email. We'll send you a verification code.
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: "📧", text: "OTP sent to your registered email" },
                { icon: "🔒", text: "Set a strong new password" },
                { icon: "⚡", text: "Instant access restored" },
              ].map(item => (
                <li key={item.text} className="feat-li" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", border: "1px solid #dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="forgot-card" style={{ marginLeft: "auto", width: "100%", maxWidth: 420 }}>
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(15,23,42,0.13), 0 4px 16px rgba(22,163,74,0.08)" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#86efac)" }} />
              <div style={{ padding: "24px 28px 28px" }}>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Forgot Password</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Recover your account access securely.</p>
                <FormBody {...formProps} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
