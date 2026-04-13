import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { buyPlan, getCurrentUser, getPartners, getDashboardSummary } from "../api";

const defaultTheme = { accent: "#16a34a", light: "#f0fdf4", gradient: "linear-gradient(135deg,#16a34a,#22c55e)" };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .pay-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pay-root h1, .pay-root h2, .pay-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes successPop {
    0%   { transform: scale(0.6); opacity: 0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  .pay-card {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 8px 32px rgba(15,23,42,0.09);
    animation: fadeUp 0.5s ease both;
  }

  .method-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 14px 18px;
    border: 2px solid #e2e8f0; border-radius: 14px;
    background: #fff; cursor: pointer; text-align: left;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }
  .method-btn:hover { border-color: var(--p-accent); background: var(--p-light); }
  .method-btn.active {
    border-color: var(--p-accent); background: var(--p-light);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .pay-input {
    width: 100%; padding: 13px 16px;
    border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s;
    background: #f8fafc;
  }
  .pay-input:focus { border-color: var(--p-accent); background: #fff; }

  .pay-btn-main {
    width: 100%; padding: 16px;
    border: none; border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .pay-btn-main:disabled { opacity: 0.6; cursor: not-allowed; }
  .pay-btn-main:not(:disabled):hover { filter: brightness(1.07); transform: translateY(-1px); }
  .pay-btn-main:not(:disabled):active { transform: scale(0.98); }

  .success-container {
    text-align: center; padding: 48px 24px;
    animation: successPop 0.55s cubic-bezier(.22,.68,0,1.2) both;
  }

  .card-input-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
`;

const PLAN_GRADIENTS = {
  Starter: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  Smart:   "linear-gradient(135deg, #7c3aed, #a78bfa)",
  Pro:     "linear-gradient(135deg, #10b981, #34d399)",
  Max:     "linear-gradient(135deg, #f59e0b, #fbbf24)",
};

const METHODS = [
  { id: "UPI",    label: "UPI",           icon: "📱", desc: "PhonePe, GPay, Paytm" },
  { id: "CARD",   label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "WALLET", label: "Mobile Wallet", icon: "👜", desc: "Paytm, Amazon Pay, Freecharge" },
];

export default function Payment() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const planId    = state?.planId   || null;
  const plan      = state?.plan     || "Starter";
  const price     = state?.price    || 40;
  const coverage  = state?.coverage || 6000;
  const trialDays = state?.trialDays || 7;
  const mode      = state?.mode     || "paid";  // "paid" | "trial"
  const features  = state?.features || [];
  const gradient  = PLAN_GRADIENTS[plan] || PLAN_GRADIENTS.Starter;

  const [method,      setMethod]      = useState(mode === "trial" ? "FREE_TRIAL" : "UPI");
  const [upiId,       setUpiId]       = useState("");
  const [cardNum,     setCardNum]     = useState("");
  const [cardName,    setCardName]    = useState("");
  const [cardExpiry,  setCardExpiry]  = useState("");
  const [cardCvv,     setCardCvv]     = useState("");
  const [wallet,      setWallet]      = useState("");
  const [processing,  setProcessing]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [result,      setResult]      = useState(null);
  const [theme,       setTheme]       = useState(defaultTheme);
  const [hasPlanAlert, setHasPlanAlert] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const u = await getCurrentUser();
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
        
        // ── Check if profile is complete (Phone, Platform, Location) ──
        if (u) {
          const missingFields = [];
          if (!u.phone) missingFields.push("Phone Number");
          if (!u.platform) missingFields.push("Service Platform");
          if (!u.state || (!u.district && !u.mandal)) missingFields.push("Location (State/District)");

          if (missingFields.length > 0) {
            setHasPlanAlert(true);
            setError(`⚠️ Profile Incomplete: Please update your ${missingFields.join(", ")} in your profile to purchase a plan. These details are required for identity verification and coverage.`);
            return;
          }
        }

        // ── Check if they already have a plan ──
        const summary = await getDashboardSummary();
        if (summary && !summary.error) {
          const s = summary.subscriptionStatus;
          if (s === "ACTIVE" || s === "TRIAL" || s === "PENDING") {
             setHasPlanAlert(true);
             setError("You already have an active or pending insurance plan. You cannot purchase another one until it expires.");
          }
        }
      } catch (err) { }
    };
    fetchTheme();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    if (!planId) navigate("/plans");
  }, [navigate, planId]);

  /* ── simulate card / UPI validation ──────────────────────────────────────── */
  function validate() {
    if (method === "UPI") {
      if (!upiId.trim()) { setError("Please enter the Transaction ID / UTR number from your payment app."); return false; }
      if (upiId.length < 8) { setError("Please enter a valid Transaction ID."); return false; }
    }
    if (method === "CARD") {
      if (cardNum.replace(/\s/g, "").length < 16) { setError("Enter a valid 16-digit card number"); return false; }
      if (!cardName.trim()) { setError("Enter cardholder name"); return false; }
      if (cardExpiry.length < 5) { setError("Enter valid expiry (MM/YY)"); return false; }
      if (cardCvv.length < 3)    { setError("Enter valid CVV"); return false; }
    }
    if (method === "WALLET" && !wallet) {
      setError("Please select a wallet"); return false;
    }
    return true;
  }

  useEffect(() => {
    // ── Load Razorpay Script ──
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function handlePay() {
    setError("");
    setProcessing(true);
    try {
      // 1. Create Order on Backend
      const api = await import("../api");
      const order = await api.createRazorpayOrder(price);
      const keyData = await api.getRazorpayKey();

      if (order?.error || keyData?.error) {
        setError(order?.error || keyData?.error);
        setProcessing(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: keyData.key, 
        amount: order.amount * 100,
        currency: "INR",
        name: "Gig Insurance Platform",
        description: `Premium for ${plan} Plan`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment on Backend
          try {
            // First, create the pending subscription record if not already there
            const subRes = await buyPlan({
              planId,
              method: "RAZORPAY",
              txnReference: response.razorpay_payment_id
            });

            const verifyRes = await import("../api").then(api => api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: subRes.paymentId || subRes.id
            }));

            if (verifyRes.success) {
              setResult({ status: "ACTIVE", plan, amountPaid: price, nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
              setSuccess(true);
            } else {
              setError("Payment verification failed: " + verifyRes.message);
            }
          } catch (e) {
            setError("Error processing verification. Please check your reports.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: "",
          contact: ""
        },
        theme: { color: theme.accent },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError("Failed to initialize payment gateway. Please try again.");
      setProcessing(false);
    }
  }

  /* ── Format card number with spaces ──────────────────────────────────────── */
  function fmtCardNum(v) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExpiry(v) {
    v = v.replace(/\D/g, "").slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v;
  }

  /* ── Success screen ─────────────────────────────────────────────────────── */
  if (success && result) {
    return (
      <div className="pay-root" style={{ 
        minHeight: "100vh", 
        background: "#f8fafc", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        "--p-accent": theme.accent,
        "--p-light": theme.light,
        "--p-gradient": theme.gradient
      }}>
        <style>{STYLES}</style>
        <div className="pay-card success-container" style={{ maxWidth: 420, width: "100%", margin: 16 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 26, color: "#0f172a", marginBottom: 8 }}>
            {result.status === "TRIAL" ? "Free Trial Activated!" : "Payment Successful!"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, marginBottom: 28 }}>
            {result.status === "TRIAL"
              ? `Your ${trialDays}-day free trial for the ${plan} plan has started. Enjoy full coverage!`
              : `Your ${plan} plan is now active. You're protected!`}
          </p>

          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px", marginBottom: 28, textAlign: "left" }}>
            {[
              ["Plan",           result.plan],
              ["Status",         result.status === "TRIAL" ? "🟡 Free Trial" : "🟢 Active"],
              ["Amount Paid",    result.amountPaid === 0 ? "₹0 (Free)" : `₹${result.amountPaid}`],
              ["Next Payment",   result.trialEndDate
                ? new Date(result.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : new Date(result.nextPaymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e2e8f0", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            className="pay-btn-main"
            style={{ background: theme.gradient, color: "#fff" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  /* ── Main payment UI ─────────────────────────────────────────────────────── */
  return (
    <div className="pay-root" style={{ 
      minHeight: "100vh", 
      background: "#f8fafc",
      "--p-accent": theme.accent,
      "--p-light": theme.light,
      "--p-gradient": theme.gradient
    }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "32px 24px 48px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(20px,4vw,28px)", color: "#fff", margin: "0 0 8px" }}>
          {mode === "trial" ? "🎁 Activate Free Trial" : "💳 Complete Your Payment"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15 }}>
          {mode === "trial"
            ? `Start your ${trialDays}-day free trial for the ${plan} plan — no charge today`
            : `You're subscribing to the ${plan} plan`}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "-28px auto 60px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

          {/* Order Summary */}
          <div className="pay-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 16 }}>
              📋 Order Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                ["Plan",          plan],
                ["Weekly Premium",`₹${price}`],
                ["Coverage",      `₹${Number(coverage).toLocaleString("en-IN")}`],
                ["Trial Period",  `${trialDays} days free`],
                ["Today's Charge", mode === "trial" ? "₹0 (Free Trial)" : `₹${price}`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14,
                }}>
                  <span style={{ color: "#64748b" }}>{k}</span>
                  <span style={{
                    fontWeight: 700,
                    color: k === "Today's Charge" ? "#16a34a" : "#0f172a",
                    fontSize: k === "Today's Charge" ? 16 : 14,
                  }}>{v}</span>
                </div>
              ))}
            </div>

            {features.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                  Included Benefits
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {features.map((f, i) => (
                    <span key={i} style={{
                      background: "#f0fdf4", color: "#16a34a",
                      padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    }}>✓ {f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="pay-card" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 16 }}>
              💳 Payment Method
            </h3>

            {/* Free trial button */}
            {mode === "trial" ? (
              <div style={{
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "2px solid #86efac", borderRadius: 14, padding: "20px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a" }}>
                  Free Trial — ₹0 Today
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  You will be charged ₹{price}/week after your {trialDays}-day trial ends.
                  You can cancel anytime before that.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`method-btn${method === m.id ? " active" : ""}`}
                    onClick={() => { setMethod(m.id); setError(""); }}
                  >
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.desc}</div>
                    </div>
                    {method === m.id && (
                      <span style={{ marginLeft: "auto", color: theme.accent, fontWeight: 800, fontSize: 18 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>💳</div>
                    <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                      Safe & Secure Payment
                    </h3>
                    <p style={{ fontSize: 14, color: "#64748b", maxWidth: 300, margin: "0 auto" }}>
                      Pay via Razorpay for instant activation. Supports UPI, Cards, and Netbanking.
                    </p>
                  </div>

                  {processing ? (
                    <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
                      <div style={{ width: 40, height: 40, margin: "0 auto 12px", border: `4px solid ${theme.light}`, borderTopColor: theme.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <div style={{ fontWeight: 800, color: theme.accent, fontSize: 16 }}>
                        Awaiting Gateway Response...
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handlePay}
                      style={{
                        width: "100%", maxWidth: 320, padding: "16px", background: theme.gradient,
                        color: "#fff", border: "none", borderRadius: "14px", fontWeight: 800,
                        fontSize: 18, cursor: "pointer", boxShadow: "0 10px 25px rgba(22,163,74,0.3)",
                        transition: "transform 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      🚀 Pay ₹{price} Now
                    </button>
                  )}
                  
                  <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: 20, opacity: 0.6 }} />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: 16, opacity: 0.6 }} />
                  </div>
                </div>

            {/* Card inputs */}
            {method === "CARD" && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#fff4f4", padding: "12px", borderRadius: "12px", border: "1px solid #fee2e2", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>
                    ⚠️ Card payments are temporarily disabled. Please use UPI for real-time activation.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Card Number</label>
                  <input className="pay-input" placeholder="1234 5678 9012 3456" value={cardNum}
                    onChange={e => { setCardNum(fmtCardNum(e.target.value)); setError(""); }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Cardholder Name</label>
                  <input className="pay-input" placeholder="Full name on card" value={cardName}
                    onChange={e => { setCardName(e.target.value); setError(""); }} />
                </div>
                <div className="card-input-grid">
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Expiry (MM/YY)</label>
                    <input className="pay-input" placeholder="MM/YY" value={cardExpiry}
                      onChange={e => { setCardExpiry(fmtExpiry(e.target.value)); setError(""); }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>CVV</label>
                    <input className="pay-input" placeholder="•••" type="password" maxLength={4} value={cardCvv}
                      onChange={e => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }} />
                  </div>
                </div>
              </div>
            )}

            {/* Wallet selector */}
            {method === "WALLET" && (
              <div style={{ marginTop: 20 }}>
                <div style={{ background: "#fff4f4", padding: "12px", borderRadius: "12px", border: "1px solid #fee2e2", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>
                    ⚠️ Wallet payments are temporarily disabled. Please use UPI for real-time activation.
                  </p>
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Select Wallet</label>
                <select
                  className="pay-input"
                  value={wallet}
                  onChange={e => { setWallet(e.target.value); setError(""); }}
                >
                  <option value="">— Choose wallet —</option>
                  {["Paytm Wallet", "Amazon Pay", "Freecharge", "Mobikwik", "Ola Money"].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 14, padding: "12px 16px",
                background: "#fef2f2", border: "1px solid #fca5a5",
                borderRadius: 10, color: "#dc2626", fontSize: 13, fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* PAY button */}
            {!processing && (
              <button
                className="pay-btn-main"
                style={{ background: hasPlanAlert ? "#e2e8f0" : theme.gradient, color: hasPlanAlert ? "#94a3b8" : "#fff", marginTop: 24 }}
                onClick={handlePay}
                disabled={processing || hasPlanAlert}
              >
                {hasPlanAlert ? (
                  "Plan Already Active"
                ) : mode === "trial"
                  ? `🎁 Activate Free Trial — ₹0 Today`
                  : `Proceed to Scan & Detect`
                }
              </button>
            )}


            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
              🔒 256-bit SSL encrypted &nbsp;|&nbsp; Your data is never stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
