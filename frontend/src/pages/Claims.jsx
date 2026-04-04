import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import {
  getPaymentHistory, claimPayment,
  getMyClaimRequests, submitClaimRequest, claimRequestPayout,
  checkParametric, detectFraud
} from "../api";
import {
  FaFileAlt, FaCloudRain, FaShieldAlt, FaHistory,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaLock, FaArrowLeft, FaCalendarAlt
} from 'react-icons/fa';

const defaultTheme = {
  gradient: "linear-gradient(135deg,#16a34a,#4ade80)",
  light: "#f0fdf4",
  accent: "#16a34a",
};

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNextMondayLabel() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function hasClaimedThisWeek(payments, requests) {
  const weekStart = getWeekStart();
  const paymentClaimed = payments.some(p => {
    if (!(p.isClaimed || p.status === 'CLAIMED')) return false;
    return new Date(p.claimedAt || p.updatedAt || p.createdAt) >= weekStart;
  });
  const requestClaimed = requests.some(r => {
    if (!r.isClaimed) return false;
    return new Date(r.claimedAt || r.updatedAt || r.createdAt) >= weekStart;
  });
  return paymentClaimed || requestClaimed;
}

const STYLES = `
  @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }

  .cl-wrap {
    max-width: 960px; margin: 0 auto;
    padding: 28px 32px; box-sizing: border-box; width: 100%;
  }
  .cl-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 16px;
    margin-bottom: 28px; flex-wrap: wrap;
  }
  .cl-header h2 {
    font-family: Sora, sans-serif;
    font-size: clamp(20px, 3vw, 26px);
    font-weight: 800; color: #0f172a; margin: 0 0 4px;
  }
  .cl-header p { font-size: 13px; color: #94a3b8; margin: 0; }

  .cl-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 12px;
    font-size: 13px; font-weight: 700; color: #fff;
    border: none; cursor: pointer;
    transition: opacity .2s, transform .15s;
    white-space: nowrap; flex-shrink: 0;
  }
  .cl-btn:hover  { opacity: .88; transform: translateY(-1px); }
  .cl-btn:active { transform: scale(.97); }

  .lock-banner {
    display: flex; align-items: flex-start; gap: 12px;
    background: #fef3c7; border: 1.5px solid #fde68a;
    border-radius: 14px; padding: 14px 18px;
    margin-bottom: 24px; animation: slideUp .3s ease both;
  }
  .lock-banner-text p    { font-size: 13px; font-weight: 700; color: #92400e; margin: 0 0 3px; }
  .lock-banner-text span { font-size: 12px; color: #b45309; line-height: 1.6; }

  .next-week-card {
    background: #fffbeb; border: 1.5px solid #fde68a;
    border-radius: 16px; padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    animation: slideUp .35s ease both;
    margin-bottom: 28px;
  }
  .next-week-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #fef3c7; display: flex;
    align-items: center; justify-content: center; flex-shrink: 0;
  }
  .next-week-card p { font-size: 14px; font-weight: 700; color: #92400e; margin: 0 0 3px; }
  .next-week-card span { font-size: 12px; color: #b45309; }

  .sec-label {
    font-size: 11px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .07em;
    margin: 0 0 12px; display: flex; align-items: center; gap: 7px;
  }
  .cl-card {
    background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
    padding: 16px 20px; display: flex; align-items: center;
    justify-content: space-between; gap: 14px;
    animation: slideUp .35s ease both; transition: box-shadow .15s; flex-wrap: wrap;
  }
  .cl-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: .04em; padding: 3px 8px; border-radius: 6px;
  }
  .b-pending  { background: #fef3c7; color: #92400e; }
  .b-approved { background: #d1fae5; color: #065f46; }
  .b-rejected { background: #fee2e2; color: #991b1b; }
  .b-claimed  { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }

  .lock-label {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; color: #b45309;
    background: #fef3c7; border: 1px solid #fde68a;
    border-radius: 8px; padding: 4px 10px; white-space: nowrap;
  }

  .act-btn {
    padding: 8px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 700; color: #fff;
    border: none; cursor: pointer; transition: opacity .2s;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .act-btn:hover { opacity: .85; }

  .hist-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .form-card {
    background: #fff; border: 1.5px solid #f1f5f9;
    border-radius: 20px; padding: 28px 32px;
    animation: slideUp .4s ease both;
    box-shadow: 0 8px 32px rgba(0,0,0,0.05);
  }
  .f-label {
    font-size: 11px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: .06em;
    display: block; margin-bottom: 8px;
  }
  .f-ctrl {
    width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0;
    border-radius: 12px; padding: 12px 16px;
    font-size: 13px; color: #0f172a; font-family: inherit;
    outline: none; transition: border-color .2s, background .2s;
  }
  .f-ctrl:focus { background: #fff; }
  textarea.f-ctrl { min-height: 110px; resize: none; }
  .f-note { font-size: 11px; color: #94a3b8; font-style: italic; margin: 0; line-height: 1.6; }

  .toast {
    margin-bottom: 20px; padding: 13px 16px; border-radius: 12px;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
    animation: slideUp .3s ease both;
  }
  .t-success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
  .t-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

  .empty-box {
    padding: 36px; text-align: center;
    background: #f8fafc; border: 1.5px dashed #e2e8f0; border-radius: 16px;
  }
  .empty-box p { font-size: 13px; color: #94a3b8; margin: 0; }
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid #e2e8f0;
    animation: spin .7s linear infinite; margin: 32px auto;
  }

  @media (max-width: 768px) { .cl-wrap { padding: 20px 18px; } }
  @media (max-width: 480px) {
    .cl-wrap   { padding: 16px 12px; }
    .form-card { padding: 20px 14px; }
    .cl-card   { gap: 10px; }
    .card-right { width: 100%; display: flex; justify-content: flex-end; }
  }
`;

const BADGES = {
  PENDING: <span className="badge b-pending"><FaHourglassHalf size={7} /> Pending</span>,
  APPROVED: <span className="badge b-approved"><FaCheckCircle size={7} /> Approved</span>,
  REJECTED: <span className="badge b-rejected"><FaTimesCircle size={7} /> Rejected</span>,
  SUCCESS: <span className="badge b-approved"><FaCheckCircle size={7} /> Active</span>,
  CLAIMED: <span className="badge b-claimed">Claimed</span>,
};

export default function Claims() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);
  const [formData, setFormData] = useState({ situation: 'Summer', description: '' });

  // AI State
  const [parametric, setParametric] = useState(null);
  const [fraudRisk, setFraudRisk] = useState(null);

  const claimedThisWeek = useMemo(
    () => hasClaimedThisWeek(payments, requests),
    [payments, requests]
  );
  const nextWeekLabel = getNextMondayLabel();

  const flash = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, paramRes] = await Promise.allSettled([
        getPaymentHistory(),
        getMyClaimRequests(),
        checkParametric()
      ]);

      if (pRes.status === "fulfilled" && Array.isArray(pRes.value)) {
        setPayments(pRes.value.filter(p =>
          ["PENDING", "APPROVED", "REJECTED", "SUCCESS", "CLAIMED"].includes(p.status)
        ));
      }
      
      if (rRes.status === "fulfilled" && Array.isArray(rRes.value)) {
        setRequests(rRes.value);
      }

      if (paramRes.status === "fulfilled" && paramRes.value && !paramRes.value.error) {
        setParametric(paramRes.value);
      }

    } catch (e) { console.error("Error in loadData:", e); }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const init = async () => {
      try {
        const u = await api.getCurrentUser();
        const partners = await api.getPartners();
        if (Array.isArray(partners)) {
          const p = partners.find(ptr => ptr.name === u.platform);
          if (p?.borderColor) {
            setTheme({
              gradient: `linear-gradient(135deg,${p.borderColor},${p.borderColor}bb)`,
              light: `${p.borderColor}22`,
              accent: p.borderColor,
            });
          }
        }
      } catch (e) { console.error(e); }
      loadData();
    };
    init();
  }, [navigate]);

  // 🤖 AI Auto-File Claim for Parametric Trigger
  const handleAutoFile = async () => {
    if (!parametric?.parametric_check?.auto_trigger) return;
    const data = {
      situation: parametric.parametric_check.trigger_reasons[0].split(':')[0].toUpperCase(),
      description: `[AI PROACTIVE CLAIM]: ${parametric.parametric_check.trigger_reasons.join('. ')} Detected by AI Parametric Monitoring.`
    };
    const res = await submitClaimRequest(data);
    if (res.error) flash(res.error, 'error');
    else {
      flash("🤖 AI parametric claim auto-filed and verified!");
      loadData();
    }
  };

  const handleClaim = async (id, type) => {
    const res = type === 'request' ? await claimRequestPayout(id) : await claimPayment(id);
    if (res.error) { flash(res.error, 'error'); }
    else {
      const bal = res.newBalance !== undefined ? `₹${res.newBalance}` : 'updated';
      flash(`Claimed successfully! New Balance: ${bal}`);
      loadData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🤖 AI Fraud Check before submitting
    const fraudRes = await detectFraud({
      situation: formData.situation,
      claim_amount: 5000,
      coverage_amount: 6000
    });

    if (fraudRes?.action === 'REJECT_AUTO') {
      flash("⚠️ AI Engine flagged this request as highly suspicious. Submission restricted.", 'error');
      return;
    }

    const res = await submitClaimRequest(formData);
    if (res.error) { flash(res.error, 'error'); }
    else {
      flash(fraudRes?.fraud_analysis?.fraud_score > 0.4
        ? "Claim filed. AI flagged for additional verification."
        : "Claim request submitted! AI Verified."
      );
      setShowForm(false);
      loadData();
    }
  };

  const accentColor = { color: theme.accent };
  const iconBoxStyle = { background: theme.gradient, boxShadow: `0 4px 12px ${theme.accent}33` };
  const formFocus = (e) => { e.target.style.borderColor = theme.accent; };
  const formBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; };

  return (
    <div className="cl-wrap">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="cl-header">
        <div>
          <h2>Insurance <span style={accentColor}>Claims</span></h2>
          <p>Manage situation requests and payouts</p>
        </div>

        {/* File New Claim button — completely hidden if claimed this week */}
        {!claimedThisWeek && !showForm && (
          <button
            className="cl-btn"
            style={{ background: theme.gradient }}
            onClick={() => setShowForm(true)}
          >
            <FaFileAlt size={11} /> File New Claim
          </button>
        )}
        {showForm && (
          <button
            className="cl-btn"
            style={{ background: theme.gradient }}
            onClick={() => setShowForm(false)}
          >
            <FaArrowLeft size={11} /> View Claims
          </button>
        )}
      </div>

      {/* ── Toast ── */}
      {message && (
        <div className={`toast ${message.type === 'error' ? 't-error' : 't-success'}`}>
          {message.type === 'error' ? <FaTimesCircle size={13} /> : <FaCheckCircle size={13} />}
          {message.text}
        </div>
      )}

      {/* ════════════ FORM VIEW ════════════ */}
      {showForm ? (
        <div className="form-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div className="hist-icon" style={iconBoxStyle}>
              <FaCloudRain size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>
                New Situation Request
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Under your active insurance plan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="f-label">Situation Type</label>
              <select
                className="f-ctrl"
                value={formData.situation}
                onChange={e => setFormData({ ...formData, situation: e.target.value })}
                onFocus={formFocus} onBlur={formBlur}
              >
                <option value="Summer">🌡️ Summer / Extreme Heat</option>
                <option value="Rainy">🌧️ Heavy Rain / Floods</option>
                <option value="Winter">❄️ Winter / Cold Wave</option>
                <option value="Cyclone">🌀 Cyclone / Storm</option>
                <option value="Flood">🌊 Flash Flood</option>
                <option value="Accident">🚑 Road Accident</option>
                <option value="Pollution">😷 Severe Pollution / AQI Alert</option>
                <option value="Curfew">🚫 Curfew / Lockdown</option>
                <option value="Other">⚠️ Other Emergency</option>
              </select>
            </div>
            <div>
              <label className="f-label">Description / Reason</label>
              <textarea
                required
                className="f-ctrl"
                placeholder="Describe the situation and why you are unable to work..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                onFocus={formFocus} onBlur={formBlur}
              />
            </div>
            <p className="f-note">
              * AI checks weather conditions automatically. If your plan has a trigger for this situation
              and current weather matches the threshold, your claim is <strong>approved instantly</strong>.
              Only <strong>one successful claim per week</strong> is allowed.
              Next window opens the following Monday.
            </p>
            <button
              type="submit"
              className="cl-btn"
              style={{ background: theme.gradient, width: "100%", justifyContent: "center", padding: "14px" }}
            >
              Submit Request
            </button>
          </form>
        </div>

      ) : (
        /* ════════════ LIST VIEW ════════════ */
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Weekly lock notice — shown instead of action buttons */}
          {claimedThisWeek && (
            <div className="next-week-card">
              <div className="next-week-icon">
                <FaCalendarAlt size={20} color="#d97706" />
              </div>
              <div>
                <p>Weekly claim limit reached</p>
                <span>
                  You've already claimed insurance this week. Your next claim window
                  opens on <strong>{nextWeekLabel}</strong>. No new claims or payouts
                  can be made until then.
                </span>
              </div>
            </div>
          )}

          {/* ── Situation Requests ── */}
          <section>
            <p className="sec-label"><FaShieldAlt size={11} /> Situation Requests</p>
            {loading ? (
              <div className="spinner" style={{ borderTopColor: theme.accent }} />
            ) : requests.length === 0 ? (
              <div className="empty-box"><p>No situation requests filed yet.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {requests.map((req, i) => (
                  <div key={req.id} className="cl-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{req.situation}</span>
                        {req.isClaimed ? <span className="badge b-claimed">Claimed</span> : BADGES[req.status]}
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>
                        {req.description}
                      </p>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>Requested On</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>Coverage Payout</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>₹{req.amount}</span>
                        </div>
                        {req.isClaimed && (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, color: "#16a34a", textTransform: "uppercase", fontWeight: 800 }}>Status</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>Claimed Successfully</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-right" style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      {req.isClaimed ? (
                        <>
                          <span className="badge b-claimed">Claimed</span>
                          <span className="lock-label">
                            <FaLock size={9} /> Next window {nextWeekLabel}
                          </span>
                        </>
                      ) : req.status === 'APPROVED' && !claimedThisWeek ? (
                        <button
                          className="act-btn"
                          style={{ background: theme.accent }}
                          onClick={() => handleClaim(req.id, 'request')}
                        >
                          Claim Payout
                        </button>
                      ) : req.status === 'APPROVED' && claimedThisWeek ? (
                        <span className="lock-label">
                          <FaLock size={9} /> Opens {nextWeekLabel}
                        </span>
                      ) : req.status === 'REJECTED' ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", fontStyle: "italic" }}>Not eligible</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", fontStyle: "italic" }}>Under review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Insurance History ── */}
          <section>
            <p className="sec-label"><FaHistory size={11} /> Insurance History</p>
            {loading ? null : payments.length === 0 ? (
              <div className="empty-box"><p>No insurance history available.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {payments.map((p, i) => {
                  const isClaimed = p.status === 'CLAIMED' || p.isClaimed;
                  const isExpired = p.subStatus === 'EXPIRED' && !isClaimed;
                  const canClaim = (p.status === 'APPROVED' || p.status === 'SUCCESS') && !isClaimed && !claimedThisWeek;

                  return (
                    <div key={p.id} className="cl-card" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                        <div className="hist-icon" style={isClaimed ? { background: "#f1f5f9" } : iconBoxStyle}>
                          <FaShieldAlt size={18} color={isClaimed ? "#94a3b8" : "#fff"} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{p.plan} Plan</span>
                            {isClaimed ? (
                              <span className="badge b-claimed">Claimed</span>
                            ) : isExpired ? (
                              <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>Expired</span>
                            ) : (
                              <span className="badge" style={{ background: "#d1fae5", color: "#065f46" }}>Active</span>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>Purchased</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{new Date(p.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>Premium</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>₹{p.amount}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>Coverage</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>₹{p.coverage}</span>
                            </div>
                            {isClaimed && p.claimedAt && (
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: 9, color: "#16a34a", textTransform: "uppercase", fontWeight: 800 }}>Claimed On</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>{new Date(p.claimedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        {isClaimed ? (
                          <>
                            <span className="badge b-claimed">Claimed</span>
                            <span className="lock-label">
                              <FaLock size={9} /> Next window {nextWeekLabel}
                            </span>
                          </>
                        ) : canClaim ? (
                          <button
                            className="act-btn"
                            style={{ background: theme.accent }}
                            onClick={() => handleClaim(p.id, 'payment')}
                          >
                            Claim
                          </button>
                        ) : (p.status === 'APPROVED' || p.status === 'SUCCESS') && claimedThisWeek ? (
                          <span className="lock-label">
                            <FaLock size={9} /> Opens {nextWeekLabel}
                          </span>
                        ) : isExpired ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", fontStyle: "italic" }}>Policy Expired</span>
                        ) : (
                          BADGES[p.status] || <span className="badge" style={{ background: "#f1f5f9", color: "#64748b" }}>{p.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}