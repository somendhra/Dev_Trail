import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt, FaRocket, FaCrown, FaLightbulb,
  FaArrowRight, FaCheck, FaLock, FaInfoCircle, FaUserShield,
  FaRobot, FaLeaf
} from "react-icons/fa";
import { getPlans, getDashboardSummary, getAIDashboard, getAIPlanRecommendation, getCurrentUser, getPartners } from "../api";

const defaultTheme = { accent: "#00D4AA", light: "rgba(0,212,170,0.1)", gradient: "linear-gradient(135deg,#00D4AA,#7C3AED)" };

const PLAN_META = {
  Starter: {
    icon: <FaLeaf />,
    description: "Perfect for beginners exploring digital insurance coverage.",
    popular: false,
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.35)",
  },
  Smart: {
    icon: <FaLightbulb />,
    description: "Enhanced protection for active gig workers and freelancers.",
    popular: true,
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    glow: "rgba(124,58,237,0.35)",
  },
  Pro: {
    icon: <FaRocket />,
    description: "Maximum coverage for full-time professional gig partners.",
    popular: false,
    gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    glow: "rgba(14,165,233,0.35)",
  },
  Max: {
    icon: <FaCrown />,
    description: "Enterprise-grade safety net with priority claim processing.",
    popular: false,
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    glow: "rgba(245,158,11,0.35)",
  },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  .plans-container * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
  .plans-container h1,.plans-container h2,.plans-container h3 { font-family: 'Sora', sans-serif; }

  @keyframes slideIn { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
  @keyframes scaleUp { from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1} }
  @keyframes shimmer { 0%{background-position:-400px 0}100%{background-position:400px 0} }

  /* ── Banner ── */
  .plans-hero { position:relative; padding:20px 24px; margin-bottom:20px; }
  .banner-card {
    max-width:1400px; margin:0 auto;
    background:rgba(13,21,38,0.98);
    border-radius:24px; padding:32px 40px;
    position:relative; overflow:hidden;
    box-shadow:0 16px 48px rgba(0,0,0,0.5);
    border:1px solid rgba(255,255,255,0.08);
    animation:slideIn 0.5s ease;
  }
  .banner-card::before {
    content:''; position:absolute; top:-60%; left:-20%;
    width:100%; height:220%;
    background:radial-gradient(circle at center, var(--theme-glow,rgba(0,212,170,0.1)) 0%, transparent 70%);
    pointer-events:none; z-index:1;
  }

  /* ── Grid ── */
  .plans-grid {
    display:flex; justify-content:center; align-items:stretch;
    gap:20px; max-width:1400px; margin:0 auto 48px;
    padding:0 16px; position:relative; z-index:10;
  }
  .grid-item { flex:1; min-width:260px; max-width:295px; transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
  .grid-item.elevated { transform:scale(1.055); z-index:20; }

  @media(max-width:1200px){
    .plans-grid { flex-wrap:wrap; }
    .grid-item { flex:none; width:calc(50% - 10px); max-width:none; }
    .grid-item.elevated { transform:none; }
  }
  @media(max-width:640px){ .grid-item { width:100%; } }

  /* ── Plan Card ── */
  .plan-card {
    background:rgba(13,21,38,0.97);
    border-radius:20px; border:1px solid rgba(255,255,255,0.08);
    transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
    display:flex; flex-direction:column;
    position:relative; overflow:hidden;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideIn 0.5s ease-out both;
  }
  .plan-card:hover { transform:translateY(-8px); box-shadow:0 20px 60px rgba(0,0,0,0.6); border-color:rgba(255,255,255,0.14); }
  .plan-card.locked { pointer-events:none; user-select:none; }
  .plan-card.locked::after {
    content:''; position:absolute; inset:0;
    background:rgba(6,11,24,0.65); backdrop-filter:blur(3px);
    z-index:5; border-radius:20px;
  }
  .lock-overlay-content {
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    z-index:10; text-align:center; padding:20px; pointer-events:auto;
  }

  .plan-header {
    padding:24px 24px 20px; border-radius:20px 20px 0 0;
    color:white; position:relative; overflow:hidden;
  }
  .plan-badge {
    position:absolute; top:16px; right:16px;
    background:rgba(0,0,0,0.25); backdrop-filter:blur(8px);
    padding:3px 10px; border-radius:99px;
    font-size:9px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.08em; color:#fff;
  }
  .plan-icon-box {
    width:46px; height:46px;
    background:rgba(255,255,255,0.15); border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    font-size:21px; margin-bottom:16px;
    border:1px solid rgba(255,255,255,0.15);
  }
  .plan-price-large {
    font-size:34px; font-weight:800; line-height:1;
    display:flex; align-items:baseline; gap:4px;
    margin:12px 0 6px; font-family:'Sora',sans-serif;
  }

  .plan-body {
    padding:22px; flex:1; display:flex; flex-direction:column;
    background:rgba(13,21,38,0.97);
  }

  .feature-row {
    display:flex; align-items:center; gap:10px;
    margin-bottom:12px; font-size:13.5px; font-weight:500;
    color:rgba(255,255,255,0.82);
  }
  .feature-check {
    width:19px; height:19px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; flex-shrink:0;
  }

  .buy-button {
    width:100%; padding:14px; border-radius:13px; border:none;
    font-weight:700; font-size:14px; cursor:pointer;
    transition:all 0.2s; display:flex; align-items:center;
    justify-content:center; gap:8px; margin-top:auto;
    font-family:'Inter',sans-serif;
  }
  .buy-button:hover:not(:disabled) { gap:12px; filter:brightness(1.08); }
  .trial-link {
    display:block; text-align:center; margin-top:10px;
    font-size:12.5px; font-weight:600; cursor:pointer;
  }
  .trial-link:hover { text-decoration:underline; }

  /* ── Info Bar ── */
  .glass-info-bar {
    display:flex; justify-content:center; align-items:center;
    gap:32px; max-width:1400px;
    margin:0 auto 48px; padding:22px 32px;
    background:rgba(13,21,38,0.97);
    border-radius:18px; border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 4px 24px rgba(0,0,0,0.3);
    color:rgba(255,255,255,0.65); font-size:14px; font-weight:600;
  }
  .info-item { display:flex; align-items:center; gap:9px; transition:color .2s; }
  .info-item:hover { color:#fff; }
  @media(max-width:768px){
    .glass-info-bar { flex-direction:column; gap:14px; margin:0 16px 32px; }
  }

  /* ── Lock icon ── */
  .lock-icon-circle {
    width:52px; height:52px;
    background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.12);
    border-radius:50%; display:flex; align-items:center;
    justify-content:center; margin:0 auto 12px; font-size:22px;
  }

  .ai-suggest-badge {
    padding:3px 8px; border-radius:6px;
    font-size:10px; font-weight:700;
    display:inline-flex; align-items:center; gap:4px;
  }

  /* ── Modal ── */
  .modal-overlay {
    position:fixed; inset:0;
    background:rgba(0,0,0,0.78);
    backdrop-filter:blur(10px); z-index:1000;
    display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn 0.25s ease;
  }
  .modal-box {
    background:rgba(13,21,38,0.99);
    border:1px solid rgba(255,255,255,0.1);
    width:100%; max-width:460px;
    border-radius:28px; padding:40px;
    position:relative;
    box-shadow:0 32px 80px rgba(0,0,0,0.8);
    animation:scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .shimmer-dark {
    background:linear-gradient(90deg,rgba(13,21,38,0.9) 25%,rgba(30,41,59,0.9) 50%,rgba(13,21,38,0.9) 75%);
    background-size:400px 100%; animation:shimmer 1.2s infinite;
  }
`;

function PlanCard({ plan, meta, aiDetails, isRecommended, hasActivePlan, onBuy, onTrial, delay, theme }) {
  const adminPremium = plan.weeklyPremium;
  const aiSuggestedPremium = aiDetails?.ai_premium;
  const isAdjusted = aiSuggestedPremium && aiSuggestedPremium !== adminPremium;

  return (
    <div
      className={`plan-card ${hasActivePlan ? "locked" : ""}`}
      style={{
        animationDelay: `${delay}s`,
        borderColor: meta.popular ? `${meta.gradient.match(/#[0-9a-f]{6}/i)?.[0]}55` : "rgba(255,255,255,0.08)",
        boxShadow: meta.popular ? `0 20px 48px ${meta.glow}` : undefined,
      }}
    >
      {hasActivePlan && (
        <div className="lock-overlay-content">
          <div className="lock-icon-circle" style={{ color: theme.accent }}><FaLock /></div>
          <p style={{ fontWeight: 800, fontSize: 16, color: "#F1F5F9", marginBottom: 2 }}>Plan Active</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>One plan per week.</p>
        </div>
      )}

      {/* Header */}
      <div className="plan-header" style={{ background: meta.gradient }}>
        {meta.popular && <div className="plan-badge">Popular</div>}
        {isRecommended && <div className="plan-badge" style={{ right: "auto", left: 24, background: "rgba(0,0,0,0.2)" }}>AI Match</div>}
        <div className="plan-icon-box">{meta.icon}</div>
        <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{plan.name}</h3>
        <div className="plan-price-large">
          <span>₹{adminPremium}</span>
          <span style={{ fontSize: 14, opacity: 0.8, fontWeight: 500 }}>/wk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <FaShieldAlt style={{ opacity: 0.75, fontSize: 12 }} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Up to ₹{plan.coverageAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Body */}
      <div className="plan-body">
        {isAdjusted && (
          <div style={{ marginBottom: 14 }}>
            <div className="ai-suggest-badge" style={{ background: `${theme.accent}18`, color: theme.accent, border: `1px solid ${theme.accent}33` }}>
              <FaRobot /> AI INSIGHT
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              AI suggests ₹{aiSuggestedPremium}.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          {plan.features.slice(0, 4).map((f, i) => (
            <div className="feature-row" key={i}>
              <div className="feature-check" style={{ background: `${theme.accent}20`, color: theme.accent }}>
                <FaCheck />
              </div>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <button
          className="buy-button"
          style={{
            background: hasActivePlan ? "rgba(255,255,255,0.06)" : meta.gradient,
            color: hasActivePlan ? "rgba(255,255,255,0.3)" : "#fff",
            cursor: hasActivePlan ? "not-allowed" : "pointer",
          }}
          onClick={() => !hasActivePlan && onBuy(plan, adminPremium)}
          disabled={hasActivePlan}
        >
          {hasActivePlan ? "Plan Active" : "Subscribe"} {!hasActivePlan && <FaArrowRight />}
        </button>

        {!hasActivePlan && (
          <span className="trial-link" style={{ color: theme.accent }} onClick={() => onTrial(plan, adminPremium)}>
            Start {plan.trialDays}-day free trial
          </span>
        )}
      </div>
    </div>
  );
}

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [aiDash, setAiDash] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansRes, aiRes, recRes, summaryRes, userRes] = await Promise.allSettled([
          getPlans(), getAIDashboard(), getAIPlanRecommendation(),
          getDashboardSummary(), getCurrentUser()
        ]);
        if (plansRes.status === "fulfilled") setPlans(plansRes.value);
        if (aiRes.status === "fulfilled" && !aiRes.value.error) setAiDash(aiRes.value);
        if (recRes.status === "fulfilled" && !recRes.value.error) setRecommendation(recRes.value);
        if (summaryRes.status === "fulfilled" && !summaryRes.value.error) {
          const status = summaryRes.value.subscriptionStatus;
          setHasActivePlan(status === "ACTIVE" || status === "TRIAL" || status === "PENDING");
        }
        if (userRes.status === "fulfilled") {
          const u = userRes.value;
          setCurrentUser(u);
          if (u?.platform) {
            const partners = await getPartners();
            if (Array.isArray(partners)) {
              const p = partners.find(ptr => ptr.name === u.platform);
              if (p) {
                setTheme({
                  accent: p.borderColor || "#00D4AA",
                  light: p.borderColor ? `${p.borderColor}18` : "rgba(0,212,170,0.1)",
                  gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
                });
              }
            }
          }
        }
      } catch (e) {
        setError("Unable to load plans. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const hasMissingLocation = (user) => {
    if (!user) return false;
    return (!user.state || (!user.district && !user.mandal && !user.city));
  };

  const handleBuy = (plan, price) => {
    if (hasMissingLocation(currentUser)) {
      alert("⚠️ Action Blocked\n\nPlease update your location details (State and District/City) in your profile first.");
      navigate("/profile"); return;
    }
    if (hasActivePlan) { alert("You already have an active or pending insurance plan for this week."); return; }
    setSelected({ plan, mode: "paid", price });
  };

  const handleTrial = (plan, price) => {
    if (hasMissingLocation(currentUser)) {
      alert("⚠️ Action Blocked\n\nPlease update your location details (State and District/City) in your profile first.");
      navigate("/profile"); return;
    }
    if (hasActivePlan) { alert("You already have an active or pending insurance plan for this week."); return; }
    setSelected({ plan, mode: "trial", price });
  };

  const handleClose = () => setSelected(null);

  const handleProceedToPayment = () => {
    if (!selected) return;
    navigate("/payment", {
      state: {
        planId: selected.plan.id, plan: selected.plan.name,
        price: selected.price, coverage: selected.plan.coverageAmount,
        trialDays: selected.plan.trialDays, mode: selected.mode,
        features: selected.plan.features,
      },
    });
    handleClose();
  };

  const riskScore = aiDash?.ai_summary?.risk_score || 0.5;

  return (
    <div className="plans-container" style={{
      minHeight: "100vh", background: "#060B18", paddingBottom: 60,
      "--theme-border": `${theme.accent}44`,
      "--theme-glow": `${theme.accent}18`,
    }}>
      <style>{STYLES}</style>

      {/* ── Banner ── */}
      <section className="plans-hero">
        <div className="banner-card">
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: `${theme.accent}18`, border: `1px solid ${theme.accent}33`,
                borderRadius: 99, padding: "4px 12px", marginBottom: 14,
                color: theme.accent, fontWeight: 700, fontSize: 11, textTransform: "uppercase",
              }}>
                <FaRobot /> AI RISK ENGINE ACTIVE
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Personalized{" "}
                <span style={{ background: "linear-gradient(135deg,#00D4AA,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Protection Pool
                </span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, fontWeight: 500 }}>
                Risk Score: <span style={{ color: "#fff", fontWeight: 800 }}>{Math.round(riskScore * 100)}/100</span> · Dynamic rates for your gig profile.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)", padding: "14px 22px",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", textAlign: "right",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Current Rating</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent, fontFamily: "Sora,sans-serif" }}>
                {riskScore < 0.3 ? "EXCELLENT" : riskScore < 0.6 ? "STABLE" : "HIGH RISK"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan Cards Grid ── */}
      <div className="plans-grid">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="grid-item shimmer-dark" style={{ height: 420, borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }} />
          ))
        ) : error ? (
          <div style={{ width: "100%", textAlign: "center", padding: 60, background: "rgba(13,21,38,0.97)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <FaInfoCircle style={{ fontSize: 40, color: "#F87171", marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, color: "#F1F5F9" }}>{error}</h3>
          </div>
        ) : (
          plans.map((plan, i) => {
            const meta = PLAN_META[plan.name] || PLAN_META.Starter;
            const aiDetails = aiDash?.plan_options?.find(o => o.plan === plan.name);
            const isRecommended = recommendation?.recommended_plan === plan.name;
            return (
              <div key={plan.id} className={`grid-item ${meta.popular ? "elevated" : ""}`}>
                <PlanCard
                  plan={plan} meta={meta} aiDetails={aiDetails}
                  isRecommended={isRecommended} hasActivePlan={hasActivePlan}
                  onBuy={handleBuy} onTrial={handleTrial}
                  delay={i * 0.1} theme={theme}
                />
              </div>
            );
          })
        )}
      </div>

      {/* ── Info Bar ── */}
      {!loading && !error && (
        <div className="glass-info-bar" style={{ margin: "0 20px 40px" }}>
          <div className="info-item"><FaShieldAlt style={{ color: theme.accent }} /> <span>Bank-Grade Encryption</span></div>
          <div className="info-item"><FaRobot style={{ color: theme.accent }} /> <span>AI Claims Automation</span></div>
          <div className="info-item"><FaCheck style={{ color: theme.accent }} /> <span>Instant Coverage Activation</span></div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={handleClose} style={{
              position: "absolute", top: 18, right: 18,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%", width: 34, height: 34, fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>×</button>

            <div style={{ position: "relative", marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22,
                background: (PLAN_META[selected.plan.name] || PLAN_META.Starter).gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, color: "white",
                boxShadow: `0 12px 28px ${(PLAN_META[selected.plan.name] || PLAN_META.Starter).glow}`,
              }}>
                {(PLAN_META[selected.plan.name] || PLAN_META.Starter).icon}
              </div>
              <div style={{
                position: "absolute", bottom: -6, right: "calc(100% - 84px)",
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(0,212,170,0.15)", border: "2px solid rgba(0,212,170,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              }}>
                <FaCheck style={{ color: theme.accent, fontSize: 11 }} />
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 8 }}>
              {selected.mode === "trial" ? "Confirm Free Trial" : "Confirm Subscription"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
              {selected.mode === "trial"
                ? `Test the full benefits of ${selected.plan.name} for ${selected.plan.trialDays} days.`
                : `Activate ${selected.plan.name} coverage instantly for ₹${selected.plan.weeklyPremium}/week.`}
            </p>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 18, marginBottom: 22 }}>
              {[
                ["Plan", selected.plan.name],
                ["Coverage", `₹${selected.plan.coverageAmount.toLocaleString()}`],
                ["Initial Cost", selected.mode === "trial" ? "₹0.00" : `₹${selected.plan.weeklyPremium}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: "#F1F5F9" }}>{val}</span>
                </div>
              ))}
            </div>

            <button className="buy-button" style={{ background: theme.gradient, color: "#fff" }} onClick={handleProceedToPayment}>
              Confirm & Continue <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}