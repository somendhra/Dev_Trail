import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { changePassword } from "../api";
import { LOCATION_DATA } from "../data/locations";

const defaultTheme = { gradient: "linear-gradient(135deg,#00D4AA,#7C3AED)", light: "rgba(0,212,170,0.1)", accent: "#00D4AA", logo: null, banner: null };

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .prof-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
  .prof-root h1, .prof-root h2, .prof-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }

  .prof-banner  { animation: bannerIn 0.7s ease both; }
  .prof-card    { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .prof-section { animation: fadeUp 0.5s ease 0.2s both; }

  /* ── Dark inputs ── */
  .prof-input {
    width: 100%;
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 11px 14px 11px 44px;
    font-size: 14px;
    background: rgba(255,255,255,0.06);
    color: #F1F5F9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
    font-family: 'Inter', sans-serif;
  }
  .prof-input:focus {
    border-color: #00D4AA;
    box-shadow: 0 0 0 3px rgba(0,212,170,0.15);
    background: rgba(0,212,170,0.05);
  }
  .prof-input:disabled {
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.3);
    cursor: not-allowed;
    border-color: rgba(255,255,255,0.05);
  }
  .prof-input::placeholder { color: rgba(255,255,255,0.3); }
  .prof-input option { background: #1E293B; color: #F1F5F9; }

  /* Override autofill */
  .prof-input:-webkit-autofill,
  .prof-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(15,23,42,0.95) inset !important;
    -webkit-text-fill-color: #F1F5F9 !important;
  }

  /* ── Info rows ── */
  .info-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    transition: background 0.2s, border-color 0.2s;
    min-width: 0;
  }
  .info-row:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(0,212,170,0.2);
  }
  .info-row-content { flex: 1; min-width: 0; }
  .info-row-label {
    font-size: 10px; font-weight: 700;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 0.8px;
    margin: 0 0 3px;
  }
  .info-row-value {
    font-size: 14px; font-weight: 600;
    color: #F1F5F9; margin: 0;
    word-break: break-word;
    line-height: 1.4;
  }

  /* ── Buttons ── */
  .edit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: #fff; border: none; cursor: pointer;
    background: linear-gradient(135deg,#00D4AA,#7C3AED);
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(0,212,170,0.3);
  }
  .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,212,170,0.45); }

  .save-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: #fff; border: none; cursor: pointer;
    background: linear-gradient(135deg,#00D4AA,#7C3AED);
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(0,212,170,0.3);
  }
  .save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,212,170,0.45); }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .cancel-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px;
    color: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(255,255,255,0.15);
    cursor: pointer;
    background: rgba(255,255,255,0.05);
    transition: all 0.2s;
  }
  .cancel-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.25); color: #fff; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    color: #fff; padding: 12px 24px; border-radius: 14px;
    font-size: 13px; font-weight: 600; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: fadeUp 0.4s ease both;
    display: flex; align-items: center; gap: 8px;
    font-family: 'Inter', sans-serif;
  }

  .banner-content { bottom: 110px; }
  .prof-content-container { padding: 28px 28px 32px; }

  @media (max-width: 640px) {
    .banner-content { bottom: 75px; gap: 12px; }
    .prof-content-container { padding: 20px 16px 24px; }
    .avatar-circle { width: 60px !important; height: 60px !important; }
    .avatar-text { font-size: 20px !important; }
    .banner-name { font-size: 20px !important; }
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .details-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .edit-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 768px) {
    .edit-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* Section divider */
  .section-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 0 10px; border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 16px;
  }
  .section-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(0,212,170,0.12);
    border: 1px solid rgba(0,212,170,0.2);
    display: flex; align-items: center; justify-content: center;
    color: #00D4AA; flex-shrink: 0;
  }
`;

function FieldIcon({ children, color }) {
  return (
    <span style={{
      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
      color: color || "rgba(255,255,255,0.35)",
      display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
    }}>
      {children}
    </span>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", platform: "", state: "", district: "", mandal: "", requestReverification: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [themeDict, setThemeDict] = useState({});
  const [partners, setPartners] = useState([]);

  // Change password state
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    api.getPartners().then(res => {
      if (!res.error && Array.isArray(res)) {
        setPartners(res);
        const d = {};
        res.forEach(p => {
          d[p.name] = {
            gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
            light: p.borderColor ? `${p.borderColor}18` : "rgba(0,212,170,0.1)",
            accent: p.borderColor,
            logo: p.logoUrl,
            banner: p.profileBannerUrl || null
          };
        });
        setThemeDict(d);
      }
    }).catch(() => {});

    api.getCurrentUser()
      .then((u) => {
        setUser(u);
        setForm({ name: u.name || "", phone: u.phone || "", platform: u.platform || "", state: u.state || "", district: u.district || "", mandal: u.mandal || "", requestReverification: false });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend expects requestReverification as a string for Boolean.parseBoolean
      const payload = {
        ...form,
        requestReverification: String(form.requestReverification),
      };
      const res = await api.updateUser(payload);
      const updated = { ...user, ...res };
      setUser(updated);
      localStorage.setItem("userName", updated.name);
      setEditing(false);
      const isPending = res.verificationStatus === "PENDING" &&
        (form.requestReverification || form.state !== user.state || form.district !== user.district || form.platform !== user.platform);
      showToast(
        isPending
          ? "Profile updated — verification pending admin review ⏳"
          : "Profile updated successfully ✓",
        true
      );
    } catch {
      showToast("Failed to update profile", false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.current) { setPwError("Please enter your current password"); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    setPwSaving(true);
    try {
      const res = await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      if (res?.error) { setPwError(res.error); return; }
      showToast("Password changed successfully ✓", true);
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPwSection(false);
    } catch {
      setPwError("Failed to change password. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060B18" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#00D4AA", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const theme = themeDict[user.platform] || defaultTheme;
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div
      className="prof-root"
      style={{
        minHeight: "100vh",
        background: "transparent",
        "--accent": theme.accent,
        "--accent-light": theme.light,
        "--gradient": theme.gradient,
      }}
    >
      <style>{STYLES}</style>

      {/* ── BANNER ── */}
      <div
        className="prof-banner"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "clamp(200px, 28vw, 260px)",
          ...(theme.banner
            ? {
              backgroundImage: `url(${theme.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
            : { background: "linear-gradient(135deg,#00D4AA,#7C3AED)" }
          ),
        }}
      >
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)" }} />
        {/* Subtle grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Banner content */}
        <div className="banner-content" style={{
          position: "absolute", left: 0, right: 0, zIndex: 2,
          maxWidth: 1000, margin: "0 auto", padding: "0 28px",
          display: "flex", flexDirection: "row", alignItems: "center", gap: 18,
        }}>
          {/* Avatar */}
          <div className="avatar-circle" style={{
            width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(16px)",
            border: "2px solid rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(0,212,170,0.3)",
          }}>
            <span className="avatar-text" style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 24, color: "#fff",
            }}>
              {initials}
            </span>
          </div>

          {/* Name + badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7 }}>
            <h1 className="banner-name" style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800,
              fontSize: "clamp(20px, 3.5vw, 26px)",
              color: "#ffffff", margin: 0, lineHeight: 1.15,
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}>
              {user.name}
            </h1>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Gig Worker
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD ── */}
      <div style={{ maxWidth: 1000, margin: "-32px auto 48px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div
          className="prof-card"
          style={{
            background: "rgba(13,21,38,0.97)",
            borderRadius: 24, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.05)",
          }}
        >
          {/* Top gradient bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#00D4AA,#7C3AED,#00D4AA)" }} />

          <div className="prof-content-container">

            {editing ? (
              /* ── EDIT MODE ── */
              <div className="prof-section" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Edit header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="section-icon">
                    <IconEdit />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 800, color: "#F1F5F9", margin: 0 }}>Edit Profile</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, marginTop: 2 }}>Update your information below</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Personal Information</p>
                  <div className="edit-grid">
                    {/* Name */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon><IconUser /></FieldIcon>
                      <input
                        className="prof-input"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    {/* Email (locked) */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon color="rgba(255,255,255,0.2)"><IconMail /></FieldIcon>
                      <input
                        className="prof-input"
                        placeholder="Email"
                        value={user.email}
                        disabled
                      />
                    </div>

                    {/* Phone */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon><IconPhone /></FieldIcon>
                      <input
                        className="prof-input"
                        placeholder="Phone Number (e.g. 9876543210)"
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Service Platform */}
                <div>
                  <div className="section-header">
                    <div className="section-icon">
                      <IconBriefcase />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 15, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Service Platform</h3>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                        {user.platform ? "Select your primary gig platform" : "Please select your platform to enable insurance coverage"}
                      </p>
                    </div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <FieldIcon><IconBriefcase /></FieldIcon>
                    <select
                      className="prof-input"
                      value={form.platform}
                      onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                      style={{ appearance: "auto", cursor: "pointer" }}
                    >
                      <option value="" style={{ background: "#1E293B", color: "#F1F5F9" }}>Select Platform</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.name} style={{ background: "#1E293B", color: "#F1F5F9" }}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Details */}
                <div>
                  <div className="section-header">
                    <div className="section-icon" style={{ background: "rgba(0,212,170,0.12)", borderColor: "rgba(0,212,170,0.2)", color: "#00D4AA" }}>
                      <IconMapPin />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 15, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>Location Details</h3>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Select your current service area. Changing this requires re-verification.</p>
                    </div>
                  </div>

                  <div className="edit-grid">
                    {/* State */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon><IconMapPin /></FieldIcon>
                      <select
                        className="prof-input"
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, district: "", mandal: "" }))}
                        style={{ appearance: "auto", cursor: "pointer" }}
                      >
                        <option value="" style={{ background: "#1E293B", color: "#F1F5F9" }}>Select State</option>
                        {Object.keys(LOCATION_DATA).map(s => (
                          <option key={s} value={s} style={{ background: "#1E293B", color: "#F1F5F9" }}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon color={!form.state ? "rgba(255,255,255,0.15)" : undefined}><IconMapPin /></FieldIcon>
                      <select
                        className="prof-input"
                        value={form.district}
                        disabled={!form.state}
                        onChange={(e) => setForm((f) => ({ ...f, district: e.target.value, mandal: "" }))}
                        style={{ appearance: "auto", cursor: !form.state ? "not-allowed" : "pointer" }}
                      >
                        <option value="" style={{ background: "#1E293B", color: "#F1F5F9" }}>Select District</option>
                        {form.state && Object.keys(LOCATION_DATA[form.state] || {}).map(d => (
                          <option key={d} value={d} style={{ background: "#1E293B", color: "#F1F5F9" }}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Mandal */}
                    <div style={{ position: "relative" }}>
                      <FieldIcon color={!form.district ? "rgba(255,255,255,0.15)" : undefined}><IconMapPin /></FieldIcon>
                      <select
                        className="prof-input"
                        value={form.mandal}
                        disabled={!form.district}
                        onChange={(e) => setForm((f) => ({ ...f, mandal: e.target.value }))}
                        style={{ appearance: "auto", cursor: !form.district ? "not-allowed" : "pointer" }}
                      >
                        <option value="" style={{ background: "#1E293B", color: "#F1F5F9" }}>Select Mandal</option>
                        {form.district && form.state && (LOCATION_DATA[form.state][form.district] || []).map(m => (
                          <option key={m} value={m} style={{ background: "#1E293B", color: "#F1F5F9" }}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Manual Re-verify Checkbox */}
                  <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <input
                      type="checkbox"
                      id="reverifyCheckbox"
                      checked={form.requestReverification}
                      onChange={e => setForm(f => ({ ...f, requestReverification: e.target.checked }))}
                      style={{ marginTop: 4, transform: "scale(1.2)", accentColor: "#00D4AA", cursor: "pointer" }}
                    />
                    <div>
                      <label htmlFor="reverifyCheckbox" style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", cursor: "pointer" }}>Request Employment Re-verification</label>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0", lineHeight: 1.5 }}>If you recently changed your job role or primary platform, check this box. We will manually review and verify your updated employment details.</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button className="cancel-btn" onClick={() => {
                    setEditing(false);
                    setForm({ name: user.name, phone: user.phone || "", platform: user.platform || "", state: user.state || "", district: user.district || "", mandal: user.mandal || "", requestReverification: false });
                  }}>
                    <IconX /> Cancel
                  </button>
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Saving…
                      </span>
                    ) : <><IconCheck /> Save Changes</>}
                  </button>
                </div>
              </div>

            ) : (
              /* ── VIEW MODE ── */
              <div className="prof-section">
                {/* Profile header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 20px rgba(0,212,170,0.3)",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>{initials}</span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 17, fontWeight: 800, color: "#F1F5F9", margin: 0 }}>{user.name}</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                        {user.platform && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            background: "rgba(0,212,170,0.12)", color: "#00D4AA",
                            border: "1px solid rgba(0,212,170,0.25)",
                          }}>{user.platform}</span>
                        )}
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Gig Worker</span>
                      </div>
                    </div>
                  </div>
                  {theme.logo && (
                    <img src={theme.logo} alt={user.platform} style={{ height: 26, maxWidth: 68, objectFit: "contain", opacity: 0.8 }} />
                  )}
                </div>

                {/* Info rows */}
                <div className="details-grid">
                  {[
                    { icon: <IconMail />, label: "Email",    value: user.email },
                    { icon: <IconPhone />, label: "Phone",   value: user.phone || "Not set — tap Edit Profile to add" },
                    { icon: <IconBriefcase />, label: "Platform", value: user.platform || "Not set", showLogo: true },
                    { icon: <IconMapPin />, label: "Location", value: user.state ? `${user.mandal || ""}${user.mandal ? ", " : ""}${user.district}, ${user.state}` : "Not set — tap Edit Profile to add" },
                    { icon: <IconShield />, label: "Employment Status", value: user.verificationStatus || "PENDING", isStatusBadge: true },
                    { icon: <span style={{ fontWeight: 800, fontSize: 15 }}>₹</span>, label: "Wallet Balance", value: `₹${(user.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                  ].map(row => (
                    <div key={row.label} className="info-row">
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#00D4AA",
                      }}>
                        {row.icon}
                      </div>
                      <div className="info-row-content">
                        <p className="info-row-label">{row.label}</p>
                        {row.isStatusBadge ? (
                          <div style={{
                            display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                            background: row.value === "VERIFIED" ? "rgba(74,222,128,0.15)" : row.value === "REJECTED" ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                            color: row.value === "VERIFIED" ? "#4ade80" : row.value === "REJECTED" ? "#F87171" : "#FBBF24",
                            border: `1px solid ${row.value === "VERIFIED" ? "rgba(74,222,128,0.3)" : row.value === "REJECTED" ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`
                          }}>
                            {row.value === "VERIFIED" ? "VERIFIED" : row.value === "REJECTED" ? "VERIFICATION FAILED" : "PENDING VERIFICATION"}
                          </div>
                        ) : (
                          <p className="info-row-value" style={{ color: row.value?.includes("Not set") ? "rgba(255,255,255,0.35)" : "#F1F5F9" }}>
                            {row.value || "—"}
                          </p>
                        )}
                      </div>
                      {row.showLogo && theme.logo && (
                        <div style={{ padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, marginLeft: 8 }}>
                          <img src={theme.logo} alt={row.value} style={{ height: 22, maxWidth: 60, objectFit: "contain" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <IconEdit /> Edit Profile
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── CHANGE PASSWORD CARD ── */}
      <div style={{ maxWidth: 1000, margin: "-8px auto 48px", padding: "0 16px" }}>
        <div style={{
          background: "rgba(13,21,38,0.97)",
          borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}>
          {/* Collapsible header */}
          <button
            onClick={() => { setShowPwSection(p => !p); setPwError(""); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 28px", background: "transparent", border: "none", cursor: "pointer",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>Change Password</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Update your account password securely</div>
              </div>
            </div>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: "transform 0.25s", transform: showPwSection ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Expanded form */}
          {showPwSection && (
            <div style={{ padding: "0 28px 28px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ height: 20 }} />

              {/* Error banner */}
              {pwError && (
                <div style={{
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                  fontSize: 13, fontWeight: 600, color: "#F87171",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  ⚠️ {pwError}
                </div>
              )}

              <div style={{ display: "grid", gap: 14 }}>
                {/* Current Password */}
                {[{
                  key: "current", label: "Current Password", placeholder: "Enter your current password"
                }, {
                  key: "next", label: "New Password", placeholder: "At least 6 characters"
                }, {
                  key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password"
                }].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.7px", display: "block", marginBottom: 7 }}>
                      {field.label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPw[field.key] ? "text" : "password"}
                        className="prof-input"
                        style={{ paddingLeft: 14, paddingRight: 44 }}
                        placeholder={field.placeholder}
                        value={pwForm[field.key]}
                        onChange={e => setPwForm(f => ({ ...f, [field.key]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                        autoComplete={field.key === "current" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => ({ ...s, [field.key]: !s[field.key] }))}
                        style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", padding: 4,
                          color: "rgba(255,255,255,0.3)",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPw[field.key] ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {/* Strength indicator for new password */}
                    {field.key === "next" && pwForm.next.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                        {[0,1,2,3].map(i => {
                          const strength = pwForm.next.length >= 12 ? 4 : pwForm.next.length >= 8 ? 3 : pwForm.next.length >= 6 ? 2 : 1;
                          return (
                            <div key={i} style={{
                              flex: 1, height: 3, borderRadius: 4,
                              background: i < strength
                                ? (strength <= 1 ? "#F87171" : strength <= 2 ? "#FBBF24" : strength <= 3 ? "#60A5FA" : "#00D4AA")
                                : "rgba(255,255,255,0.1)",
                              transition: "background 0.2s",
                            }} />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  className="cancel-btn"
                  onClick={() => { setShowPwSection(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                >
                  {pwSaving ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Updating…
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Update Password
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast" style={{
          background: toast.success ? "rgba(0,212,170,0.15)" : "rgba(248,113,113,0.15)",
          border: toast.success ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(248,113,113,0.3)",
          backdropFilter: "blur(16px)",
        }}>
          {toast.success ? "✓" : "⚠️"} {toast.msg}
        </div>
      )}
    </div>
  );
}