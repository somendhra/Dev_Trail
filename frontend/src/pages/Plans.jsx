import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaRocket, 
  FaCrown, 
  FaLightbulb, 
  FaArrowRight, 
  FaCheck, 
  FaLock, 
  FaInfoCircle, 
  FaUserShield,
  FaRobot,
  FaLeaf
} from "react-icons/fa";
import { getPlans, getDashboardSummary, getAIDashboard, getAIPlanRecommendation, getCurrentUser, getPartners } from "../api";

const defaultTheme = { accent: "#16a34a", light: "#f0fdf4", gradient: "linear-gradient(135deg,#16a34a,#4ade80)" };

/* ─── Premium Plan Metadata ─────────────────────────────────────────────────── */
const PLAN_META = {
  Starter: {
    icon: <FaLeaf />,
    description: "Perfect for beginners exploring digital insurance coverage.",
    popular: false,
    alpha: "33",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    glow: "rgba(16, 185, 129, 0.3)"
  },
  Smart: {
    icon: <FaLightbulb />,
    description: "Enhanced protection for active gig workers and freelancers.",
    popular: true,
    alpha: "ff",
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    glow: "rgba(124, 58, 237, 0.3)"
  },
  Pro: {
    icon: <FaRocket />,
    description: "Maximum coverage for full-time professional gig partners.",
    popular: false,
    alpha: "aa",
    gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    glow: "rgba(14, 165, 233, 0.3)"
  },
  Max: {
    icon: <FaCrown />,
    description: "Enterprise-grade safety net with priority claim processing.",
    popular: false,
    alpha: "77",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    glow: "rgba(245, 158, 11, 0.3)"
  },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bento:wght@400;700&display=swap');

  :root {
    --primary: #7c3aed;
    --primary-dark: #4338ca;
    --surface: #ffffff;
    --background: #f8fafc;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --glass: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(255, 255, 255, 0.4);
    --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    --card-shadow-hover: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
  }

  .plans-container * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
    100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .plans-hero {
    position: relative;
    padding: 20px 24px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .banner-card {
    max-width: 1400px;
    margin: 0 auto;
    background: linear-gradient(135deg, #0f172a 0%, #1a202c 100%);
    border-radius: 24px;
    padding: 28px 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    border: 1px solid var(--theme-border);
    animation: slideIn 0.5s ease;
  }

  .banner-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle at center, var(--theme-glow) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  .plans-grid {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto 60px;
    padding: 0 16px;
    position: relative;
    z-index: 10;
  }

  .grid-item {
    flex: 1;
    min-width: 260px;
    max-width: 290px;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .grid-item.elevated {
    transform: scale(1.06);
    z-index: 20;
  }

  @media (max-width: 1200px) { 
    .plans-grid { flex-wrap: wrap; }
    .grid-item { flex: none; width: calc(50% - 10px); max-width: none; }
    .grid-item.elevated { transform: none; }
  }
  @media (max-width: 640px) { 
    .grid-item { width: 100%; }
  }

  .plan-card {
    background: var(--surface);
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: var(--card-shadow);
    animation: slideIn 0.5s ease-out both;
  }

  .plan-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--card-shadow-hover);
    border-color: #cbd5e1;
  }

  .plan-card.locked {
    pointer-events: none;
    user-select: none;
  }
  .plan-card.locked::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(2px);
    z-index: 5;
    border-radius: 20px;
  }
  .lock-overlay-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    text-align: center;
    padding: 20px;
    pointer-events: auto; /* Allow this part to be interactive if needed, but the card is locked */
  }

  .plan-header {
    padding: 24px 24px 20px;
    border-radius: 20px 20px 0 0;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .plan-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .plan-icon-box {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .plan-price-large {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin: 12px 0 6px;
  }

  .plan-body {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .feature-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    color: var(--text-main);
    font-size: 13.5px;
    font-weight: 500;
  }

  .feature-check {
    width: 18px;
    height: 18px;
    background: #f0f9ff;
    color: #0ea5e9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    flex-shrink: 0;
  }

  .buy-button {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: auto;
  }

  .buy-button:hover {
    gap: 12px;
  }

  .glass-info-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    max-width: 1400px;
    margin: 40px auto;
    padding: 24px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
  }

  .info-item:hover {
    transform: translateY(-2px);
    color: var(--text-main);
  }

  @media (max-width: 768px) {
    .glass-info-bar { flex-direction: column; gap: 16px; margin: 24px 16px; }
  }

  .lock-icon-circle {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    font-size: 20px;
    color: #64748b;
  }

  .trial-link {
    display: block;
    text-align: center;
    margin-top: 12px;
    color: var(--text-muted);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }

  .ai-suggest-badge {
    background: #fdf2f8;
    color: #db2777;
    border: 1px solid #fbcfe8;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  @media (max-width: 640px) {
    .plans-hero { padding: 40px 16px 80px; }
    .plans-grid { margin-top: -40px; gap: 16px; }
    .plan-card { border-radius: 16px; }
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-box {
    background: white;
    width: 100%;
    max-width: 440px;
    border-radius: 28px;
    padding: 40px;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

function PlanCard({ plan, meta, aiDetails, isRecommended, hasActivePlan, onBuy, onTrial, delay, theme }) {
  const adminPremium = plan.weeklyPremium;
  const aiSuggestedPremium = aiDetails?.ai_premium;
  const isAdjusted = aiSuggestedPremium && aiSuggestedPremium !== adminPremium;

  const cardGradient = `linear-gradient(135deg, ${theme.accent}, ${theme.accent}${meta.alpha || '88'})`;

  return (
    <div 
      className={`plan-card ${hasActivePlan ? 'locked' : ''} ${meta.popular ? 'elevated-shadow' : ''}`}
      style={{ 
        animationDelay: `${delay}s`, 
        borderColor: meta.popular ? theme.accent : theme.accent + '22',
        boxShadow: meta.popular ? `0 20px 40px ${theme.accent}33` : 'var(--card-shadow)'
      }}
    >
      {hasActivePlan && (
        <div className="lock-overlay-content">
          <div className="lock-icon-circle" style={{ color: theme.accent }}><FaLock /></div>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#1e293b', marginBottom: 2 }}>Plan Active</p>
          <p style={{ color: '#64748b', fontSize: 12 }}>One plan per week.</p>
        </div>
      )}

      <div className="plan-header" style={{ background: cardGradient }}>
        {meta.popular && <div className="plan-badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>Popular</div>}
        {isRecommended && <div className="plan-badge" style={{ right: 'auto', left: 24, background: 'rgba(0,0,0,0.15)' }}>AI Match</div>}
        
        <div className="plan-icon-box">{meta.icon}</div>
        
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{plan.name}</h3>

        <div className="plan-price-large">
          <span>₹{adminPremium}</span>
          <span style={{ fontSize: 14, opacity: 0.8, fontWeight: 500 }}>/wk</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <FaShieldAlt style={{ opacity: 0.7, fontSize: 12 }} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Up to ₹{plan.coverageAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="plan-body">
        {isAdjusted && (
          <div style={{ marginBottom: 16 }}>
            <div className="ai-suggest-badge" style={{ backgroundColor: theme.light, color: theme.accent, borderColor: theme.accent + '33' }}>
              <FaRobot /> AI INSIGHT
            </div>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              AI suggests ₹{aiSuggestedPremium}.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          {plan.features.slice(0, 4).map((f, i) => (
            <div className="feature-row" key={i}>
              <div className="feature-check" style={{ backgroundColor: theme.light, color: theme.accent }}><FaCheck /></div>
              <span style={{ fontSize: 12.5 }}>{f}</span>
            </div>
          ))}
        </div>

        <button 
          className="buy-button"
          style={{ 
            background: hasActivePlan ? '#e2e8f0' : theme.gradient, 
            color: hasActivePlan ? '#94a3b8' : 'white',
            cursor: hasActivePlan ? 'not-allowed' : 'pointer'
          }}
          onClick={() => !hasActivePlan && onBuy(plan, adminPremium)}
          disabled={hasActivePlan}
        >
          {hasActivePlan ? 'Plan Active' : 'Subscribe'} <FaArrowRight />
        </button>

        {!hasActivePlan && (
          <span className="trial-link" style={{ color: theme.accent }} onClick={() => onTrial(plan, adminPremium)}>
            Start {plan.trialDays}-day trial
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
          getPlans(),
          getAIDashboard(),
          getAIPlanRecommendation(),
          getDashboardSummary(),
          getCurrentUser()
        ]);

        if (plansRes.status === "fulfilled") setPlans(plansRes.value);
        if (aiRes.status === "fulfilled" && !aiRes.value.error) setAiDash(aiRes.value);
        if (recRes.status === "fulfilled" && !recRes.value.error) setRecommendation(recRes.value);
        if (summaryRes.status === "fulfilled" && !summaryRes.value.error) {
          const status = summaryRes.value.subscriptionStatus;
          setHasActivePlan(status === "ACTIVE" || status === "TRIAL" || status === "PENDING");
        }

        // Match Sidebar's theme logic
        if (userRes.status === "fulfilled") {
          const u = userRes.value;
          setCurrentUser(u);
          if (u && u.platform) {
            const partners = await getPartners();
            if (Array.isArray(partners)) {
              const p = partners.find(ptr => ptr.name === u.platform);
              if (p) {
                setTheme({
                  accent: p.borderColor || "#16a34a",
                  light: p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
                  gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`
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
      alert("⚠️ Action Blocked\n\nPlease update your location details (State and District/City) in your profile first. Geographic data is required to activate AI weather tracking for this plan.");
      navigate("/profile");
      return;
    }
    if (hasActivePlan) {
      alert("You already have an active or pending insurance plan for this week.");
      return;
    }
    setSelected({ plan, mode: "paid", price });
  };
  
  const handleTrial = (plan, price) => {
    if (hasMissingLocation(currentUser)) {
       alert("⚠️ Action Blocked\n\nPlease update your location details (State and District/City) in your profile first. Geographic data is required to activate AI weather tracking for this plan.");
       navigate("/profile");
       return;
    }
    if (hasActivePlan) {
      alert("You already have an active or pending insurance plan for this week.");
      return;
    }
    setSelected({ plan, mode: "trial", price });
  };
  
  const handleClose = () => setSelected(null);

  const handleProceedToPayment = () => {
    if (!selected) return;
    navigate("/payment", {
      state: {
        planId: selected.plan.id,
        plan: selected.plan.name,
        price: selected.price,
        coverage: selected.plan.coverageAmount,
        trialDays: selected.plan.trialDays,
        mode: selected.mode,
        features: selected.plan.features,
      },
    });
    handleClose();
  };

  const riskScore = aiDash?.ai_summary?.risk_score || 0.5;

  return (
    <div className="plans-container" style={{ 
      minHeight: "100vh", 
      background: "#f8fafc", 
      paddingBottom: 60,
      "--hero-gradient": theme.gradient,
      "--theme-border": `${theme.accent}44`,
      "--theme-glow": `${theme.accent}22`
    }}>
      <style>{STYLES}</style>

      {/* ── Premium Card Banner ── */}
      <section className="plans-hero">
        <div className="banner-card">
           <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: theme.light, border: `1px solid ${theme.accent}33`,
                  borderRadius: 99, padding: "4px 12px", marginBottom: 12,
                  color: theme.accent, fontWeight: 700, fontSize: 11, textTransform: 'uppercase'
                }}>
                  <FaRobot /> AI RISK ENGINE ACTIVE
                </div>

                <h1 style={{
                  fontSize: 28, fontWeight: 800, color: "white",
                  lineHeight: 1.2, margin: 0
                }}>
                  Personalized <span style={{ color: theme.accent }}>Protection Pool</span>
                </h1>
                <p style={{
                  color: "#94a3b8", fontSize: 14, marginTop: 4, fontWeight: 500
                }}>
                  Risk Score: <span style={{ color: 'white', fontWeight: 800 }}>{Math.round(riskScore * 100)}/100</span> • Dynamic rates for your gig profile.
                </p>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.05)",
                padding: "12px 20px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: 'right'
              }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current Rating</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: theme.accent }}>{riskScore < 0.3 ? 'EXCELLENT' : riskScore < 0.6 ? 'STABLE' : 'HIGH RISK'}</div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Grid Container ── */}
      <div className="plans-grid">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="grid-item" style={{ height: 400, background: '#f1f5f9', borderRadius: 20, opacity: 0.5 }}></div>
          ))
        ) : error ? (
          <div style={{ width: '100%', textAlign: 'center', padding: 60, background: 'white', borderRadius: 32 }}>
            <FaInfoCircle style={{ fontSize: 40, color: '#ef4444', marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, color: '#1e293b' }}>{error}</h3>
          </div>
        ) : (
          plans.map((plan, i) => {
            const meta = PLAN_META[plan.name] || PLAN_META.Starter;
            const aiDetails = aiDash?.plan_options?.find(o => o.plan === plan.name);
            const isRecommended = recommendation?.recommended_plan === plan.name;

            return (
              <div key={plan.id} className={`grid-item ${meta.popular ? 'elevated' : ''}`}>
                <PlanCard
                  plan={plan}
                  meta={meta}
                  aiDetails={aiDetails}
                  isRecommended={isRecommended}
                  hasActivePlan={hasActivePlan}
                  onBuy={handleBuy}
                  onTrial={handleTrial}
                  delay={i * 0.1}
                  theme={theme}
                />
              </div>
            );
          })
        )}
      </div>

      {/* ── Support Info ── */}
      {!loading && !error && (
        <div className="glass-info-bar">
          <div className="info-item">
            <FaShieldAlt style={{ color: theme.accent }} /> <span>Bank-Grade Encryption</span>
          </div>
          <div className="info-item">
            <FaRobot style={{ color: theme.accent }} /> <span>AI Claims Automation</span>
          </div>
          <div className="info-item">
            <FaCheck style={{ color: theme.accent }} /> <span>Instant Coverage Activation</span>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button
              onClick={handleClose}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "#f8fafc", border: "none", borderRadius: "50%",
                width: 36, height: 36, fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>

            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: 24, 
                background: (PLAN_META[selected.plan.name] || PLAN_META.Starter).gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, color: 'white',
                boxShadow: `0 12px 24px ${(PLAN_META[selected.plan.name] || PLAN_META.Starter).glow}`
              }}>
                {(PLAN_META[selected.plan.name] || PLAN_META.Starter).icon}
              </div>
              <div style={{
                position: 'absolute', bottom: -6, right: -6,
                width: 28, height: 28, borderRadius: '50%',
                background: '#fff', border: '3px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <FaCheck style={{ color: theme.accent, fontSize: 12 }} />
              </div>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              {selected.mode === "trial" ? "Confirm Free Trial" : "Confirm Subscription"}
            </h2>

            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              {selected.mode === "trial"
                ? `Test the full benefits of ${selected.plan.name} for ${selected.plan.trialDays} days.`
                : `Activate ${selected.plan.name} coverage instantly for ₹${selected.plan.weeklyPremium}/week.`}
            </p>

            <div style={{
              background: "#f8fafc", borderRadius: 16, border: '1px solid #e2e8f0',
              padding: "16px", marginBottom: 20,
            }}>
              {[
                ["Plan", selected.plan.name],
                ["Coverage", `₹${selected.plan.coverageAmount.toLocaleString()}`],
                ["Initial Cost", selected.mode === "trial" ? "₹0.00" : `₹${selected.plan.weeklyPremium}`],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "6px 0", fontSize: 13,
                }}>
                  <span style={{ color: "#64748b", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: "#0f172a" }}>{val}</span>
                </div>
              ))}
            </div>

            <button
              className="buy-button"
              style={{
                background: theme.gradient,
                color: "#fff",
              }}
              onClick={handleProceedToPayment}
            >
              Confirm & Continue <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}