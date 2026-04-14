import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../components/DashboardCard";
import NotificationCard from "../components/NotificationCard";
import { IconBell, IconChat, IconCard, IconShield, IconMoney } from "../components/Icons";
import { FaLanguage } from "react-icons/fa";
import {
  getCurrentUser, getDashboardSummary, getPartners, getMyNotifications,
  getWorkerWeather,
} from "../api";

const TRANSLATIONS = {
  en: {
    welcomeBack: "Welcome back",
    weeklyPremium: "Weekly Premium",
    coverageAmount: "Coverage Amount",
    nextPayment: "Next Payment",
    yourWallet: "Your Wallet",
    recentPayments: "💳 Recent Payments",
    noPlanYet: "You Don't Have a Plan Yet",
    activePlan: "Active",
    freeTrial: "Free Trial",
    lastLogin: "Last login:",
    coverageStatus: "Coverage Status",
    liveDisruptionAlert: "Live Disruption Alert",
    totalProtected: "Total Protected This Week",
    disruptionsCovered: "Disruptions Covered",
    walletBalance: "Wallet Balance",
    quickActions: "Quick Actions",
    buyPlan: "Buy Plan",
    fileClaim: "File Claim",
    chatSupport: "Chat Support",
    notifications: "Notifications",
    viewReports: "View Reports",
    incompleteProfile: "Incomplete Profile Detected",
    employmentVerified: "Employment Verified",
    verificationFailed: "Verification Failed",
    verificationPending: "Verification Pending",
    partner: "Partner",
    yourPlatform: "🤝 Your Platform",
    coveredForGigs: "You are covered for gigs completed on this platform",
    recentNotifications: "Recent Notifications",
    noNewNotifications: "No new notifications",
  },
  hi: {
    welcomeBack: "वापसी पर स्वागत है",
    weeklyPremium: "साप्ताहिक प्रीमियम",
    coverageAmount: "कवरेज राशि",
    nextPayment: "अगला भुगतान",
    yourWallet: "आपका वॉलेट",
    recentPayments: "💳 हाल के भुगतान",
    noPlanYet: "आपके पास अभी तक कोई योजना नहीं है",
    activePlan: "सक्रिय",
    freeTrial: "निःशुल्क परीक्षण",
    lastLogin: "अंतिम बार चालू:",
    coverageStatus: "कवरेज स्थिति",
    liveDisruptionAlert: "लाइव व्यवधान चेतावनी",
    totalProtected: "इस सप्ताह कुल सुरक्षित",
    disruptionsCovered: "व्यवधान कवर किए गए",
    walletBalance: "वॉलेट बैलेंस",
    quickActions: "त्वरित कार्रवाई",
    buyPlan: "योजना खरीदें",
    fileClaim: "दावा करें",
    chatSupport: "चैट समर्थन",
    notifications: "सूचनाएं",
    viewReports: "रिपोर्ट देखें",
    incompleteProfile: "अपूर्ण प्रोफ़ाइल मिली",
    employmentVerified: "रोज़गार सत्यापित",
    verificationFailed: "सत्यापन विफल",
    verificationPending: "सत्यापन लंबित",
    partner: "पार्टनर",
    yourPlatform: "🤝 आपका प्लेटफॉर्म",
    coveredForGigs: "आप इस प्लेटफॉर्म पर पूरे किए गए गिग्स के लिए कवर किए गए हैं",
    recentNotifications: "हाल की सूचनाएं",
    noNewNotifications: "कोई नई सूचनाएं नहीं",
  },
  ta: {
    welcomeBack: "மீண்டும் வருக",
    weeklyPremium: "வாராந்திர பிரீமியம்",
    coverageAmount: "காப்பீட்டு தொகை",
    nextPayment: "அடுத்த கட்டணம்",
    yourWallet: "உங்களின் பணப்பை",
    recentPayments: "💳 சமீபத்திய கொடுப்பனவுகள்",
    noPlanYet: "உங்களிடம் இன்னும் எந்த திட்டமும் இல்லை",
    activePlan: "செயலிலுள்ளது",
    freeTrial: "இலவச சோதனை",
    lastLogin: "கடைசி உள்நுழைவு:",
    coverageStatus: "காப்பீட்டு நிலை",
    liveDisruptionAlert: "நேரடி இடையூறு எச்சரிக்கை",
    totalProtected: "இந்த வாரம் பாதுகாக்கப்பட்டது",
    disruptionsCovered: "இடையூறுகள் ஈடுசெய்யப்பட்டன",
    walletBalance: "பணப்பை இருப்பு",
    quickActions: "விரைவான செயல்கள்",
    buyPlan: "திட்டத்தை வாங்கு",
    fileClaim: "கோரிக்கை சமர்ப்பி",
    chatSupport: "அரட்டை ஆதரவு",
    notifications: "அறிவிப்புகள்",
    viewReports: "அறிக்கைகளைப் பார்க்க",
    incompleteProfile: "முழுமையற்ற சுயவிவரம்",
    employmentVerified: "வேலைவாய்ப்பு சரிபார்க்கப்பட்டது",
    verificationFailed: "சரிபார்ப்பு தோல்வியடைந்தது",
    verificationPending: "சரிபார்ப்பு நிலுவையில் உள்ளது",
    partner: "கூட்டாளர்",
    yourPlatform: "🤝 உங்கள் தளம்",
    coveredForGigs: "இந்த தளத்தில் முடிக்கப்பட்ட வேலைகளுக்கு நீங்கள் காப்பீடு செய்யப்பட்டுள்ளீர்கள்",
    recentNotifications: "சமீபத்திய அறிவிப்புகள்",
    noNewNotifications: "புதிய அறிவிப்புகள் இல்லை",
  },
  te: {
    welcomeBack: "తిరిగి స్వాగతం",
    weeklyPremium: "వారపు ప్రీమియం",
    coverageAmount: "కవరేజ్ మొత్తం",
    nextPayment: "తదుపరి చెల్లింపు",
    yourWallet: "మీ వాలెట్",
    recentPayments: "💳 ఇటీవలి చెల్లింపులు",
    noPlanYet: "మీకు ఇంకా ప్లాన్ లేదు",
    activePlan: "చురుకుగా",
    freeTrial: "ఉచిత ట్రయల్",
    lastLogin: "చివరి లాగిన్:",
    coverageStatus: "కవరేజ్ స్థితి",
    liveDisruptionAlert: "లైవ్ అంతరాయం హెచ్చరిక",
    totalProtected: "ఈ వారం మొత్తం రక్షణ",
    disruptionsCovered: "అంతరాయాలు కవర్ చేయబడ్డాయి",
    walletBalance: "వాలెట్ బ్యాలెన్స్",
    quickActions: "శీఘ్ర చర్యలు",
    buyPlan: "ప్లాన్ కొనండి",
    fileClaim: "క్లెయిమ్ చేయండి",
    chatSupport: "చాట్ మద్దతు",
    notifications: "నోటిఫికేషన్లు",
    viewReports: "నివేదికలను చూడండి",
    incompleteProfile: "అసంపూర్ణ ప్రొఫైల్",
    employmentVerified: "ఉపాధి ధృవీకరించబడింది",
    verificationFailed: "ధృవీకరణ విఫలమైంది",
    verificationPending: "ధృవీకరణ పెండింగ్‌లో ఉంది",
    partner: "భాగస్వామి",
    yourPlatform: "🤝 మీ ప్లాట్‌ఫారమ్",
    coveredForGigs: "ఈ ప్లాట్‌ఫారమ్‌లో పూర్తి చేసిన గిగ్‌ల కోసం మీరు కవర్ చేయబడ్డారు",
    recentNotifications: "ఇటీవలి నోటిఫికేషన్లు",
    noNewNotifications: "కొత్త నోటిఫికేషన్లు లేవు",
  }
};

const defaultTheme = { gradient: "linear-gradient(135deg,#00D4AA,#7C3AED)", light: "rgba(0,212,170,0.08)", accent: "#00D4AA", banner: null };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .dash-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .dash-root h1, .dash-root h2, .dash-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes bannerIn {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .dash-banner  { animation: bannerIn 0.7s ease both; }
  .dash-card    { animation: scaleIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
  .dash-section { animation: fadeUp 0.5s ease 0.2s both; }

  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { 
    .banner-content { bottom: 75px; } 
    .dash-banner { --banner-pos: 100% center; }
  }

  .quick-action-btn {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 12px; border-radius: 12px; background: rgba(255,255,255,0.03);
    border: 1.5px solid rgba(255,255,255,0.07); cursor: pointer;
    transition: all 0.2s ease; text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .quick-action-btn:hover {
    transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    border-color: var(--accent); background: rgba(255,255,255,0.06);
  }
  .quick-action-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05); color: var(--accent);
  }
  .quick-action-text {
    font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9);
    letter-spacing: 0.2px;
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"][key] || key;

  const [user, setUser]         = useState(null);
  const [summary, setSummary]   = useState(null);
  const [loadingSum, setLoadingSum] = useState(true);
  const [themeDict, setThemeDict] = useState({});
  const [partners, setPartners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dashboardClaims, setDashboardClaims] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [payments, setPayments] = useState([]);

  // GigShield: Live weather alert state
  const [weather, setWeather]     = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const weatherIntervalRef = useRef(null);

  // Animated counter for earnings
  const [displayedEarnings, setDisplayedEarnings] = useState(0);
  const earningsTargetRef = useRef(0);

  const [dashboardData] = useState({
    lastLogin: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }),
  });


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Fetch user profile
    getCurrentUser()
      .then(res => {
        if (res && res.id) {
          setUser(res);
          localStorage.setItem("userName", res.name);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));

    // Fetch real subscription / payment summary
    getDashboardSummary()
      .then(res => {
        if (res && !res.error) setSummary(res);
      })
      .catch(() => {})
      .finally(() => setLoadingSum(false));

    // Fetch Notifications
    getMyNotifications().then(res => {
      if (res && Array.isArray(res)) setNotifications(res.slice(0, 3));
    }).catch(() => {});

    // Fetch Claims
    import("../api").then(api => {
      api.getMyClaimRequests().then(res => {
        if (res && Array.isArray(res)) setDashboardClaims(res);
      }).catch(() => {});
    });

    // Fetch Payout/Payment history
    import("../api").then(api => {
      if (api.getMyPayments) {
        api.getMyPayments().then(res => {
          if (Array.isArray(res)) setPayments(res.slice(0, 10));
        }).catch(() => {});
      }
    });

    // Live weather polling — every 3 minutes
    const fetchWeather = () => {
      getWorkerWeather()
        .then(res => { if (res && !res.error) setWeather(res); })
        .catch(() => {})
        .finally(() => setWeatherLoading(false));
    };
    fetchWeather();
    weatherIntervalRef.current = setInterval(fetchWeather, 3 * 60 * 1000);

    // Fetch Chat Unread Count
    import("../api").then(api => {
      api.getMyQueries().then(res => {
        if (Array.isArray(res)) {
          const unread = res.filter(q => (q.isFromAdmin || q.fromAdmin) && !q.readByUser).length;
          setUnreadChatCount(unread);
        }
      }).catch(() => {});
    });

    getPartners().then(res => {
      if (!res.error && Array.isArray(res)) {
        setPartners(res);
        const d = {};
        res.forEach(p => {
          d[p.name] = {
            gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
            light: p.borderColor ? `${p.borderColor}22` : "#f0fdf4",
            accent: p.borderColor || "#16a34a",
            banner: p.dashboardBannerUrl || null 
          };
        });
        setThemeDict(d);
      }
    }).catch(() => {});

    const handleReadEvent = () => setUnreadChatCount(0);
    window.addEventListener('chatRead', handleReadEvent);

    return () => {
      window.removeEventListener('chatRead', handleReadEvent);
      if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
    };
  }, [navigate]);

  // Animated earnings counter
  useEffect(() => {
    const approvedTotal = dashboardClaims
      .filter(c => c.status === 'APPROVED')
      .reduce((s, c) => s + (c.amount || 0), 0);
    earningsTargetRef.current = approvedTotal;
    let start = 0;
    const step = Math.ceil(approvedTotal / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, approvedTotal);
      setDisplayedEarnings(start);
      if (start >= approvedTotal) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [dashboardClaims]);

  // Helper derived values from backend summary
  const activePlan = summary?.activePlan || null;
  const planName   = activePlan?.name          || "No Plan";
  const premium    = activePlan?.weeklyPremium  || 0;
  const cov        = activePlan?.coverageAmount || 0;
  const risk       = activePlan?.riskLevel      || "—";
  const subStatus  = summary?.subscriptionStatus || "NONE";
  const nextPay    = summary?.nextPaymentDate
    ? new Date(summary.nextPaymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A1020" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#00D4AA", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const theme = themeDict[user.platform] || defaultTheme;
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div
      className="dash-root"
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
        className="dash-banner"
        style={{
          position: "relative",
          overflow: "hidden",
          height: "clamp(220px, 30vw, 280px)",
          ...(theme.banner
            ? {
              backgroundImage: `url(${theme.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "var(--banner-pos, center)",
              backgroundRepeat: "no-repeat",
            }
            : { background: theme.gradient }
          ),
        }}
      >
        {/* dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
        }} />

        {/* Global UI layer inside Banner */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <div className="relative" style={{ display: "flex", alignItems: "center" }}>
            <FaLanguage style={{ color: "#fff", fontSize: 18, position: "absolute", left: 12, pointerEvents: "none" }} />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              style={{
                appearance: "none", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.4)", color: "#fff",
                padding: "8px 32px 8px 38px", borderRadius: 12, outline: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              <option value="en" style={{background: "#1E293B", color: "#fff"}}>EN</option>
              <option value="hi" style={{background: "#1E293B", color: "#fff"}}>HI</option>
              <option value="ta" style={{background: "#1E293B", color: "#fff"}}>TA</option>
              <option value="te" style={{background: "#1E293B", color: "#fff"}}>TE</option>
            </select>
          </div>
        </div>

        {/* banner content — bottom left */}
        <div className="banner-content" style={{
          position: "absolute",
          left: 0, right: 0,
          zIndex: 2,
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
        }}>
          {/* Welcome Message */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", gap: 4,
          }}>
            <h1 style={{
              fontFamily: "Sora,sans-serif", fontWeight: 800,
              fontSize: "clamp(18px, 3.5vw, 24px)",
              color: "#ffffff", margin: 0, lineHeight: 1.15,
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}>
              {t("welcomeBack")}, {user.name.split(" ")[0]}!
            </h1>

            <div style={{
              fontSize: 14, fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}>
              {t("lastLogin")} {dashboardData.lastLogin}
            </div>
          </div>

          {/* Platform Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 20,
            padding: "6px 14px",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#4ade80", display: "inline-block", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>
              {user.platform} Partner
            </span>
          </div>

          {/* Employment Verification Badge */}
          {(() => {
            const vs = user.verificationStatus || "PENDING";
            const cfg = {
              VERIFIED: { bg: "rgba(0,212,170,0.25)", border: "rgba(0,212,170,0.5)", color: "#00D4AA", icon: "✅", text: t("employmentVerified") },
              REJECTED: { bg: "rgba(248,113,113,0.2)", border: "rgba(248,113,113,0.4)", color: "#F87171", icon: "❌", text: t("verificationFailed") },
              PENDING:  { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.35)", color: "#FBBF24", icon: "⏳", text: t("verificationPending") },
            };
            const c = cfg[vs] || cfg.PENDING;
            return (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg,
                backdropFilter: "blur(8px)", border: `1px solid ${c.border}`, borderRadius: 20, padding: "6px 14px" }}>
                <span style={{ fontSize: 13 }}>{c.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {c.text}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── DASHBOARD CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 48px", padding: "24px 20px 0", position: "relative", zIndex: 10 }}>

        {/* ── PROFILE INCOMPLETE WARNING ── */}
        {(!user.platform || !user.phone) && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div style={{
              background: "rgba(239, 68, 68, 0.05)",
              borderRadius: 20, border: "2px dashed rgba(239, 68, 68, 0.3)",
              padding: "24px 28px", display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: 20,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, background: "rgba(239, 68, 68, 0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0
                }}>
                  ⚠️
                </div>
                <div>
                  <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 800, color: "#fca5a5", margin: "0 0 4px" }}>
                    {t("incompleteProfile")}
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>
                    Please update your <strong style={{color:"#fff"}}>{!user.platform && "Service Platform"}{!user.platform && !user.phone && " and "}{!user.phone && "Phone Number"}</strong> in your profile. 
                    These details are required to unlock insurance coverage and payments.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/profile")}
                style={{
                  background: "#dc2626", color: "#fff", border: "none", borderRadius: 12,
                  padding: "12px 24px", fontFamily: "Sora,sans-serif", fontWeight: 700,
                  fontSize: 14, cursor: "pointer", transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)"
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Complete Profile →
              </button>
            </div>
          </div>
        )}

        {/* ── PENDING VERIFICATION ALERT ── */}
        {user.verificationStatus === "PENDING" && user.platform && user.phone && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div style={{
              background: "rgba(251,191,36,0.06)",
              borderRadius: 20, border: "1.5px solid rgba(251,191,36,0.3)",
              padding: "20px 28px", display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⏳</div>
                <div>
                  <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 16, fontWeight: 800, color: "#FBBF24", margin: "0 0 4px" }}>
                    Employment Verification Pending
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                    Your profile is under admin review. Your coverage remains active while we verify your updated details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile")}
                style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 12, padding: "10px 22px", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                View Profile →
              </button>
            </div>
          </div>
        )}

        {/* Plan Overview Cards */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          {loadingSum ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ height: 110, borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", animation: "shimmer 1.4s infinite" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <DashboardCard
                title={t("weeklyPremium")}
                value={premium > 0 ? `₹${premium}` : "—"}
                small={subStatus === "TRIAL" ? `🎁 ${t("freeTrial")}` : subStatus === "ACTIVE" ? `🟢 ${t("activePlan")}` : subStatus}
                icon={<IconShield className="w-5 h-5" />}
                accent="#6366f1"
              />
              <DashboardCard
                title={t("coverageAmount")}
                value={cov > 0 ? `₹${cov.toLocaleString("en-IN")}` : "—"}
                small="Policy Coverage"
                icon={<IconCard className="w-5 h-5" />}
                accent="#ec4899"
              />
              <DashboardCard
                title={t("nextPayment")}
                value={nextPay}
                small={risk !== "—" ? `${risk} Risk` : ""}
                icon={<IconBell className="w-5 h-5" />}
                accent="#f59e0b"
              />
              <DashboardCard
                title={t("yourWallet")}
                value={`₹${(user.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                small={`Pool: ₹${(summary?.totalInsuranceFund || 0).toLocaleString("en-IN")}`}
                icon={<IconMoney className="w-5 h-5" />}
                accent="#10b981"
              />
            </div>
          )}
        </div>

        {/* Recent Payments from backend */}
        {!loadingSum && summary?.recentPayments?.length > 0 && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px" }}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>{t("recentPayments")}</h3>
                {summary.recentPayments.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#F1F5F9" }}>{p.plan} Plan</span>
                      <span style={{ color: "#475569", marginLeft: 8, fontSize: 12 }}>{p.method.replace("_"," ")} · {new Date(p.date).toLocaleDateString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, color: "#F1F5F9" }}>{p.amount === 0 ? "Free" : `₹${p.amount}`}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: p.status === "SUCCESS" ? "rgba(0,212,170,0.15)" : "rgba(239,68,68,0.15)", color: p.status === "SUCCESS" ? "#00D4AA" : "#F87171" }}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No plan CTA */}
        {!loadingSum && subStatus === "NONE" && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div style={{ background: "linear-gradient(135deg,rgba(0,212,170,0.12),rgba(124,58,237,0.12))", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 22, padding: "40px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🛡️</div>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 900, fontSize: 22, color: "#F1F5F9", marginBottom: 8 }}>{t("noPlanYet")}</h3>
              <p style={{ color: "#64748B", marginBottom: 24, fontSize: 14 }}>Get covered today — start with a 7-day free trial, no payment required.</p>
              <button onClick={() => navigate("/plans")} style={{ background: "linear-gradient(135deg,#00D4AA,#7C3AED)", color: "#060B18", border: "none", borderRadius: 12, padding: "13px 32px", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,212,170,0.3)" }}>Browse Plans →</button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
             SECTION 1 + 3:  Coverage Status  ·  Live Disruption Alert
        ───────────────────────────────────────────────────────────────── */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Coverage Status Card */}
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "24px 24px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🛡️</span>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 16, color: "#F1F5F9", margin: 0 }}>
                  {t("coverageStatus")}
                </h3>
              </div>
              {loadingSum ? (
                <div style={{ height: 60, background: "rgba(255,255,255,0.04)", borderRadius: 12, animation: "shimmer 1.4s infinite" }} />
              ) : (
                <>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", borderRadius: 20, marginBottom: 12,
                    background: subStatus === "ACTIVE" || subStatus === "TRIAL" ? "rgba(0,212,170,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${subStatus === "ACTIVE" || subStatus === "TRIAL" ? "rgba(0,212,170,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: subStatus === "ACTIVE" || subStatus === "TRIAL" ? "#00D4AA" : "#F87171" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: subStatus === "ACTIVE" || subStatus === "TRIAL" ? "#00D4AA" : "#F87171", letterSpacing: "1px" }}>
                      {subStatus === "ACTIVE" ? "ACTIVE" : subStatus === "TRIAL" ? "FREE TRIAL" : "NO PLAN"}
                    </span>
                  </div>
                  {subStatus === "ACTIVE" || subStatus === "TRIAL" ? (
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
                      <div>📋 Plan: <strong style={{ color: "#F1F5F9" }}>{planName}</strong></div>
                      <div>📅 Valid: <strong style={{ color: "#F1F5F9" }}>Mon – Sun (this week)</strong></div>
                      <div>💰 Coverage: <strong style={{ color: "#00D4AA" }}>₹{cov.toLocaleString("en-IN")}</strong></div>
                    </div>
                  ) : (
                    <button onClick={() => navigate("/plans")} style={{
                      marginTop: 8, background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
                      color: "#060B18", border: "none", borderRadius: 12, padding: "11px 22px",
                      fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(0,212,170,0.25)"
                    }}>
                      Get Covered →
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Live Disruption Alert */}
            <div style={{
              background: weather?.parametricTriggered
                ? "rgba(239, 68, 68, 0.03)"
                : "rgba(34, 197, 94, 0.02)",
              borderRadius: 20, padding: "24px 24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: `1.5px solid ${weather?.parametricTriggered ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.1)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>
                  {weather?.parametricTriggered ? "🔴" : weather ? "🟢" : "🌐"}
                </span>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 16, color: "#F1F5F9", margin: 0 }}>
                  {t("liveDisruptionAlert")}
                </h3>
              </div>
              {weatherLoading ? (
                <div style={{ height: 60, background: "rgba(255,255,255,0.04)", borderRadius: 12, animation: "shimmer 1.4s infinite" }} />
              ) : weather ? (
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: weather.parametricTriggered ? "#fca5a5" : "#4ade80",
                    marginBottom: 10, lineHeight: 1.5,
                  }}>
                    {weather.alertMessage || (weather.parametricTriggered ? "⚠️ Disruption detected" : "✅ All Clear")}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "3px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                      🌡️ {weather.temperature}°C
                    </span>
                    <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "3px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                      💧 {weather.rainfall} mm
                    </span>
                    <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "3px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                      💨 {weather.windSpeedKmh} km/h
                    </span>
                    <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "3px 10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                      🌫️ AQI {weather.aqi}
                    </span>
                  </div>
                  {weather.isMockData && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>* Simulated data — live OWM data pending API activation</div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Set your district in profile to see live alerts</div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
             SECTION 2: Earnings Protected (animated counter)
        ───────────────────────────────────────────────────────────────── */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b, #312e81)",
            borderRadius: 20, padding: "28px 28px",
            boxShadow: "0 12px 40px rgba(79,70,229,0.25)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
          }}>
            {[
              {
                emoji: "💰",
                label: t("totalProtected"),
                value: `₹${displayedEarnings.toLocaleString("en-IN")}`,
                sub: "Approved payouts",
              },
              {
                emoji: "⚡",
                label: t("disruptionsCovered"),
                value: dashboardClaims.filter(c => c.status === "APPROVED").length,
                sub: "This week",
              },
              {
                emoji: "🏦",
                label: t("walletBalance"),
                value: `₹${(user.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`,
                sub: "Available for withdrawal",
              },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-section" style={{ marginBottom: 32 }}>
          <h3 style={{
            fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 700,
            color: "#F1F5F9", marginBottom: 16
          }}>
            {t("quickActions")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <button className="quick-action-btn" onClick={() => navigate("/plans")}>
              <div className="quick-action-icon">
                <IconCard className="w-5 h-5" />
              </div>
              <span className="quick-action-text">{t("buyPlan")}</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/claims")}>
              <div className="quick-action-icon">
                <IconShield className="w-5 h-5" />
              </div>
              <span className="quick-action-text">{t("fileClaim")}</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/chat")} style={{ position: 'relative' }}>
              <div className="quick-action-icon">
                <IconChat className="w-5 h-5" />
              </div>
              <span className="quick-action-text">{t("chatSupport")}</span>
              {unreadChatCount > 0 && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 800, padding: '2px 6px',
                  borderRadius: 10, minWidth: 18, textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}>
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/notifications")}>
              <div className="quick-action-icon">
                <IconBell className="w-5 h-5" />
              </div>
              <span className="quick-action-text">{t("notifications")}</span>
            </button>

            <button className="quick-action-btn" onClick={() => navigate("/reports")}>
              <div className="quick-action-icon">
                <IconMoney className="w-5 h-5" />
              </div>
              <span className="quick-action-text">{t("viewReports")}</span>
            </button>
          </div>
        </div>

        {/* Your Platform */}
        {partners.length > 0 && user?.platform && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div className="dash-card" style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>
                      {t("yourPlatform")}
                    </h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      {t("coveredForGigs")}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: 12,
                }}>
                  {partners.filter(p => p.name === user?.platform).map(p => (
                    <div key={p.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 10px",
                      border: `1.5px solid ${p.borderColor || "rgba(255,255,255,0.1)"}`,
                      transition: "all 0.2s ease",
                      boxShadow: `0 0 0 1px ${p.borderColor || "rgba(255,255,255,0.1)"}, 0 4px 12px rgba(0,0,0,0.3)`,
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: "rgba(0,0,0,0.3)", border: `1px solid ${p.borderColor || "rgba(255,255,255,0.1)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}>
                        <img src={p.logoUrl} alt={p.name}
                          style={{ maxWidth: 34, maxHeight: 28, objectFit: "contain" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                        textAlign: "center", lineHeight: 1.3,
                        width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications + Claims */}
        <div className="dash-section">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div className="lg:col-span-2">
              <div
                className="dash-card"
                style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                <div style={{ padding: "24px 24px 20px" }}>
                  <h3 style={{
                    fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700,
                    color: "#F1F5F9", marginBottom: 16
                  }}>
                    {t("recentNotifications")}
                  </h3>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">{t("noNewNotifications")}</p>
                    ) : (
                      notifications.slice(0, 5).map((notif, index) => (
                        <NotificationCard
                          key={index}
                          title={notif.title}
                          desc={notif.message}
                          time={new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          read={notif.read}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                className="dash-card"
                style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                <div style={{ padding: "24px 24px 20px" }}>
                  <h3 style={{
                    fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700,
                    color: "#F1F5F9", marginBottom: 16
                  }}>
                    Claim Status
                  </h3>
                  <div className="space-y-3">
                    {dashboardClaims.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No recent claims</p>
                    ) : (
                      dashboardClaims.slice(0, 5).map((claim, index) => {
                        const isClaimed = claim.claimed || claim.isClaimed;
                        return (
                          <div key={index} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-800/40 border border-gray-700/50 transition mb-2">
                            <div>
                              <div className="text-sm font-bold text-gray-200">{claim.situation?.replace('AI-AUTO: ', '') || 'Insurance'} Claim</div>
                              <div className="text-xs text-sky-400 font-bold mt-1">₹{claim.amount}</div>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 flex-shrink-0 rounded ${
                              isClaimed ? 'bg-gray-800 text-gray-400' :
                              claim.status === 'APPROVED' ? 'bg-green-900/40 text-green-400' :
                              claim.status === 'REJECTED' ? 'bg-red-900/40 text-red-400' :
                              'bg-amber-900/40 text-amber-400'
                            }`}>
                              {isClaimed ? 'CLAIMED' : claim.status}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {dashboardClaims.length > 0 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => navigate("/claims")}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        View Full History →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
             SECTION 5: Payout History
        ───────────────────────────────────────────────────────────────── */}
        {payments.length > 0 && (
          <div className="dash-section" style={{ marginBottom: 32 }}>
            <div className="dash-card" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "20px 24px" }}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>💸 Payout History</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                        {["Transaction ID", "Amount", "Date", "Method", "UPI Status"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s", ":hover": {background: "rgba(255,255,255,0.02)"} }}>
                          <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                            {p.gatewayReference || p.transactionId || `TXN-${p.id}`}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: "#F1F5F9" }}>
                            ₹{(p.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.5)" }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.5)" }}>{p.method || "UPI"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                              background: p.status === "SUCCESS" ? "rgba(34, 197, 94, 0.15)" : p.status === "PENDING" ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: p.status === "SUCCESS" ? "#4ade80" : p.status === "PENDING" ? "#facc15" : "#f87171",
                            }}>
                              {p.status === "SUCCESS" ? "✓ Credited" : p.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}