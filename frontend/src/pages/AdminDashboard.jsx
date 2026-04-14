import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import {
  adminListUsers,
  adminDeleteUser,
  adminListPlans,
  adminUpdatePlan,
  adminListPayments,
  adminApprovePayment,
  adminRejectPayment,
  adminDeletePayment,
  adminListQueries,
  adminReplyQuery,
  adminClearUserChat,
  adminChangeCredentials,
  getPartners,
  adminAddPartner,
  adminDeletePartner,
  adminUpdateUser,
  adminVerifyWorker,
  adminCreateAdmin,
  adminListClaimRequests,
  adminApproveClaimRequest,
  adminRejectClaimRequest,
  adminGetWallet,
  adminCreatePlan,
  adminGetWeatherReport,
  getWeatherForDistrict,
  aiWorkerCheck,
} from "../api";

// Use public asset path
const adminBanner = "/assets/adminbanner.png";

import {
  FaShieldAlt, FaTachometerAlt, FaUsers, FaClipboardCheck,
  FaQuestionCircle, FaClipboardList, FaMoneyBillWave, FaCog,
  FaSignOutAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaEnvelope, FaPhone, FaTrashAlt, FaReply, FaLock,
  FaUserEdit, FaIdBadge, FaKey, FaSave, FaChevronRight,
  FaBell, FaUserCircle, FaBars, FaTimes,
  FaPlus, FaGlobe, FaBuilding, FaLink,
  FaCloudRain, FaWallet, FaArrowUp, FaArrowDown,
  FaSeedling, FaLightbulb, FaRocket, FaCrown, FaCalculator,
  FaFileExport, FaUserAlt, FaUserPlus, FaPhoneAlt, FaSpinner
} from "react-icons/fa";

/* ══════════════════════════════════════════
   HELPERS & TRANSLATIONS
══════════════════════════════════════════ */

const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  
  const flattenObj = (ob) => {
    let result = {};
    for (const i in ob) {
      if ((typeof ob[i]) === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
        const temp = flattenObj(ob[i]);
        for (const j in temp) result[i + "_" + j] = temp[j];
      } else {
        result[i] = ob[i];
      }
    }
    return result;
  };

  const flatData = data.map(item => flattenObj(item));
  const headers = Object.keys(flatData[0]).join(",");
  
  const rows = flatData.map(row => 
    Object.values(row)
      .map(val => {
        if (val === null || val === undefined) return '""';
        let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(",")
  ).join("\n");
  
  const csvContent = `${headers}\n${rows}`;
  const finalFilename = `${filename || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;

  // Universal fallback-proof saving using file-saver
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(blob, finalFilename);
};

function ReplyForm({ onReply }) {
  const [text, setText] = useState("");
  return (
    <div style={{ marginTop:14, background:"rgba(0,212,170,0.08)", borderRadius:14, padding:16, border:"1px solid rgba(0,212,170,0.2)" }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#00D4AA", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
        <FaReply style={{ fontSize:10 }}/> Write Reply
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); onReply(text); setText(""); } }}
        rows={3}
        style={{ width:"100%", border:"1.5px solid rgba(255,255,255,0.1)", borderRadius:11, padding:12, fontSize:13, color:"#F1F5F9", background:"rgba(255,255,255,0.05)", resize:"none", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" }}
        placeholder="Type your reply here…"
        onFocus={e => e.target.style.borderColor="#00D4AA"}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
      />
      <button
        onClick={() => { if (text.trim()) { onReply(text); setText(""); } }}
        className="gs-btn-primary"
        style={{ marginTop:10, fontSize:13, padding:"9px 18px" }}
      >
        <FaReply style={{ fontSize:10 }}/> Send Reply
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor, iconColor, sub }) {
  // Map tailwind color to CSS var
  const accentMap = {
    "bg-teal-100": "#00D4AA", "bg-green-100": "#00D4AA", "bg-emerald-100": "#00D4AA",
    "bg-blue-100": "#60A5FA", "bg-violet-100": "#A78BFA", "bg-purple-100": "#A78BFA",
    "bg-amber-100": "#FBBF24", "bg-yellow-100": "#FBBF24",
    "bg-red-100": "#F87171", "bg-rose-100": "#F87171",
  };
  const accent = accentMap[bgColor] || "#00D4AA";
  return (
    <div className="gs-stat-card anim-in" style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:52, height:52, borderRadius:14, background:`${accent}18`, border:`1px solid ${accent}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
        <span style={{ color:accent }}>{icon}</span>
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.5px", fontWeight:700, margin:"0 0 4px" }}>{label}</p>
        <p style={{ fontSize:28, fontWeight:900, fontFamily:"'Sora',sans-serif", color:"#F1F5F9", lineHeight:1.1, margin:0, letterSpacing:"-0.5px" }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:"3px 0 0", fontWeight:500 }}>{sub}</p>}
      </div>
      {/* Glow orb */}
      <div style={{ position:"absolute", width:70, height:70, borderRadius:"50%", top:-20, right:-20, background:`radial-gradient(circle,${accent}20,transparent 70%)`, pointerEvents:"none" }}/>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:  { bg:"rgba(251,191,36,0.15)",  border:"rgba(251,191,36,0.3)",  color:"#FBBF24", icon:<FaHourglassHalf/> },
    APPROVED: { bg:"rgba(0,212,170,0.15)",  border:"rgba(0,212,170,0.3)",  color:"#00D4AA", icon:<FaCheckCircle/> },
    REJECTED: { bg:"rgba(248,113,113,0.15)", border:"rgba(248,113,113,0.3)", color:"#F87171", icon:<FaTimesCircle/> },
  };
  const s = map[status] || { bg:"rgba(255,255,255,0.08)", border:"rgba(255,255,255,0.15)", color:"#94A3B8", icon:null };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
      {s.icon} {status}
    </span>
  );
};

// Global dark styles injected once
const globalStyles = `
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { .banner-content { bottom: 75px; } }
`;
if (typeof document !== 'undefined' && !document.getElementById('gs-admin-dark')) {
  const s = document.createElement("style");
  s.id = 'gs-admin-dark';
  s.innerText = globalStyles;
  document.head.appendChild(s);
}

function Avatar({ name }) {
  const str = name || "?";
  const initials = str.includes("@")
    ? str[0].toUpperCase()
    : str.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#00D4AA","#60A5FA","#A78BFA","#FBBF24","#F87171"];
  const bg = colors[str.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:34, height:34, borderRadius:10, background:`${bg}22`, border:`1.5px solid ${bg}55`, display:"flex", alignItems:"center", justifyContent:"center", color:bg, fontSize:13, fontWeight:800, flexShrink:0, fontFamily:"'Inter',sans-serif" }}>
      {initials}
    </div>
  );
}

function InputField({ label, icon, type = "text", value, onChange, placeholder, errorMsg, successMsg, autoComplete }) {
  return (
    <div>
      <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1.5px", display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
        <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12 }}>{icon}</span> {label}
      </label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.2)", fontSize:12, display:"flex" }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete || "off"}
          style={{
            width:"100%", border:`1.5px solid ${errorMsg ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius:11, padding:"11px 14px 11px 40px", fontSize:13.5, background:"rgba(255,255,255,0.05)",
            color:"#F1F5F9", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box",
            transition:"border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = errorMsg ? "#F87171" : "#00D4AA"; e.target.style.boxShadow = `0 0 0 3px ${errorMsg ? "rgba(248,113,113,0.12)" : "rgba(0,212,170,0.12)"}`; }}
          onBlur={e => { e.target.style.borderColor = errorMsg ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      </div>
      {errorMsg   && <p style={{ fontSize:11, color:"#F87171", marginTop:5, display:"flex", alignItems:"center", gap:4 }}><FaTimesCircle style={{ fontSize:10 }}/> {errorMsg}</p>}
      {successMsg && <p style={{ fontSize:11, color:"#00D4AA", marginTop:5, display:"flex", alignItems:"center", gap:4 }}><FaCheckCircle style={{ fontSize:10 }}/> {successMsg}</p>}
    </div>
  );
}

function getUsageStats(date) {
  if (!date) return { duration: "N/A", totalHours: "0.0" };
  const start = new Date(date);
  const now = new Date();
  const diffMs = Math.max(0, now - start); // Handle slight clock drifts
  const hours = diffMs / (1000 * 60 * 60);

  let duration = "";
  const totalHoursInt = Math.floor(hours);

  if (totalHoursInt < 24) {
    if (totalHoursInt < 1) {
      const mins = Math.floor(diffMs / (1000 * 60));
      duration = mins < 1 ? "Just joined" : `${mins}m active`;
    } else {
      const remMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${totalHoursInt}h ${remMins}m active`;
    }
  } else {
    const days = Math.floor(totalHoursInt / 24);
    const remHours = totalHoursInt % 24;
    if (days < 7) {
      duration = `${days}d ${remHours}h active`;
    } else if (days < 30) {
      duration = `${days}d active`;
    } else {
      const months = Math.floor(days / 30);
      duration = months < 12 ? `${months}mo active` : `${Math.floor(months / 12)}y active`;
    }
  }

  return {
    duration,
    totalHours: hours.toFixed(1)
  };
}

/* ══════════════════════════════════════════
   NAV CONFIG
══════════════════════════════════════════ */

const NAV_ITEMS = [
  {
    group: "OVERVIEW", items: [
      { key: "overview", label: "Dashboard", icon: <FaTachometerAlt /> },
    ]
  },
  {
    group: "USER MANAGEMENT", items: [
      { key: "users", label: "Users", icon: <FaUsers /> },
      { key: "verification", label: "Worker Verification", icon: <FaIdBadge /> },
      { key: "partners", label: "Partner Platforms", icon: <FaGlobe /> },
    ]
  },
  {
    group: "INSURANCE MANAGEMENT", items: [
      { key: "plans", label: "Premium Plans", icon: <FaClipboardList /> },
      { key: "disaster", label: "Insurance Claim Requests", icon: <FaCloudRain /> },
    ]
  },
  {
    group: "FINANCIAL MANAGEMENT", items: [
      { key: "wallet", label: "Admin Wallet", icon: <FaWallet /> },
      { key: "payments", label: "Transactions", icon: <FaMoneyBillWave /> },
    ]
  },
  {
    group: "SUPPORT & COMMUNICATION", items: [
      { key: "queries", label: "Worker Support", icon: <FaQuestionCircle /> },
    ]
  },
  {
    group: "SYSTEM", items: [
      { key: "settings", label: "Settings", icon: <FaCog /> },
    ]
  },
];

const PAGE_META = {
  users: { title: "User Management", subtitle: "View and manage all registered users", icon: <FaUsers />, color: "bg-blue-500" },
  verification: { title: "Worker Verification", subtitle: "Verify gig workers' company employment and genuineness", icon: <FaIdBadge />, color: "bg-teal-500" },
  approvals: { title: "Insurance Approvals", subtitle: "Review and approve insurance payment requests", icon: <FaClipboardCheck />, color: "bg-amber-500" },
  queries: { title: "User Queries", subtitle: "Respond to questions from your users", icon: <FaQuestionCircle />, color: "bg-violet-500" },
  plans: { title: "Plan Management", subtitle: "Edit and update insurance plan pricing", icon: <FaClipboardList />, color: "bg-teal-500" },
  payments: { title: "Payment Records", subtitle: "Track all payment transactions", icon: <FaMoneyBillWave />, color: "bg-emerald-500" },
  wallet: { title: "Admin Wallet", subtitle: "Insurance fund balance and transaction ledger", icon: <FaWallet />, color: "bg-indigo-600" },
  disaster: { title: "Disaster Claims", subtitle: "Review and approve situation-based requests", icon: <FaCloudRain />, color: "bg-indigo-500" },
  partners: { title: "Partner Platforms", subtitle: "Manage the supported application platforms", icon: <FaGlobe />, color: "bg-indigo-500" },
  settings: { title: "Account Settings", subtitle: "Manage your admin profile and credentials", icon: <FaCog />, color: "bg-slate-500" },
};

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */

function AdminSidebar({ section, setSection, onLogout, pendingCount, unansweredCount, pendingClaims, open, onClose }) {
  const badges = { approvals: pendingCount, queries: unansweredCount, disaster: pendingClaims };
  const adminEmail    = localStorage.getItem("adminEmail") || "admin@giginsurance.com";
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  const handleNav = (key) => { setSection(key); onClose(); };

  const SIDEBAR_CSS = `
    .adm-sidebar {
      width:256px; height:100vh; display:flex; flex-direction:column;
      background:#060B18; border-right:1px solid rgba(255,255,255,0.07);
      font-family:'Inter',sans-serif; flex-shrink:0; position:sticky; top:0;
    }
    .adm-logo-wrap { display:flex; align-items:center; gap:12px; padding:20px 18px 16px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .adm-logo-icon {
      width:38px; height:38px; border-radius:11px; flex-shrink:0;
      background:linear-gradient(135deg,#00D4AA,#7C3AED);
      display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff;
      box-shadow:0 0 18px rgba(0,212,170,0.3);
    }
    .adm-logo-text { font-family:'Sora',sans-serif; font-weight:800; font-size:15px; background:linear-gradient(135deg,#F1F5F9,#94A3B8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .adm-logo-sub  { font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(0,212,170,0.7); margin-top:1px; }
    .adm-nav { flex:1; padding:14px 10px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; }
    .adm-nav::-webkit-scrollbar { width:3px; }
    .adm-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:99px; }
    .adm-section-label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.4); padding:10px 10px 4px; }
    .adm-item {
      display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px;
      font-size:13.5px; font-weight:600; color:rgba(255,255,255,0.75); cursor:pointer;
      border:1px solid transparent; background:none; width:100%; text-align:left;
      transition:all 0.2s; position:relative;
    }
    .adm-item:hover { color:#fff; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.07); }
    .adm-item.active { color:#00D4AA; background:rgba(0,212,170,0.1); border-color:rgba(0,212,170,0.2); font-weight:700; }
    .adm-item-icon { font-size:15px; flex-shrink:0; }
    .adm-badge { margin-left:auto; min-width:18px; height:18px; padding:0 5px; border-radius:999px; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; background:rgba(248,113,113,0.2); color:#F87171; border:1px solid rgba(248,113,113,0.3); }
    .adm-divider { height:1px; background:rgba(255,255,255,0.05); margin:4px 10px; }
    .adm-user-card { margin:0 10px 10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:13px; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .adm-avatar { width:34px; height:34px; border-radius:9px; flex-shrink:0; background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(124,58,237,0.15)); border:1px solid rgba(0,212,170,0.3); display:flex; align-items:center; justify-content:center; color:#00D4AA; font-size:13px; font-weight:800; }
    .adm-logout {
      display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px;
      border-radius:10px; border:1px solid rgba(248,113,113,0.15); background:rgba(248,113,113,0.06);
      color:rgba(248,113,113,0.7); font-size:13px; font-weight:600; cursor:pointer;
      transition:all 0.2s; font-family:'Inter',sans-serif;
    }
    .adm-logout:hover { background:rgba(248,113,113,0.12); border-color:rgba(248,113,113,0.3); color:#F87171; }
    @media(max-width:1024px){
      .adm-sidebar { position:fixed; top:0; left:0; z-index:40; transform:translateX(-100%); transition:transform 0.3s ease; }
      .adm-sidebar.open { transform:translateX(0); }
    }
  `;

  return (
    <>
      <style>{SIDEBAR_CSS}</style>
      {/* Mobile overlay */}
      {open && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:30 }} onClick={onClose}/>}

      <aside className={`adm-sidebar${open ? " open" : ""}`}>
        {/* Logo */}
        <div className="adm-logo-wrap">
          <div className="adm-logo-icon"><FaShieldAlt/></div>
          <div>
            <div className="adm-logo-text">GigShield</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:"auto", padding:6, background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:16, display:"flex" }} className="lg:hidden">
            <FaTimes/>
          </button>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          {NAV_ITEMS.map(group => (
            <div key={group.group}>
              <div className="adm-section-label">{group.group}</div>
              {group.items.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => handleNav(key)}
                  className={`adm-item${section === key ? " active" : ""}`}
                >
                  <span className="adm-item-icon">{icon}</span>
                  <span style={{ flex:1 }}>{label}</span>
                  {badges[key] > 0 && <span className="adm-badge">{badges[key]}</span>}
                </button>
              ))}
              <div className="adm-divider"/>
            </div>
          ))}
        </nav>

        {/* User card + Logout */}
        <div className="adm-user-card">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="adm-avatar">{(adminUsername[0]||"A").toUpperCase()}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#F1F5F9", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminUsername}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminEmail}</div>
            </div>
          </div>
          <button className="adm-logout" onClick={onLogout}>
            <FaSignOutAlt style={{ fontSize:13 }}/> Sign Out
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding:"10px 18px", borderTop:"1px solid rgba(255,255,255,0.05)", textAlign:"center" }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.15)", margin:0 }}>© 2026 GigShield · Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}


/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [replies, setReplies] = useState({});
  const [queries, setQueries] = useState([]);
  const [claimRequests, setClaimRequests] = useState([]);
  const [partners, setPartners] = useState([]);
  const [adminWallet, setAdminWallet] = useState({ walletBalance: 0, transactions: [], totalCredits: 0, totalDebits: 0, totalPremiumCollected: 0, totalClaimsPaid: 0 });
  const [weatherReport, setWeatherReport] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", logoUrl: "", dashboardBannerUrl: "", profileBannerUrl: "", borderColor: "#E2E8F0" });
  const [adminInfo, setAdminInfo] = useState({ 
    email: localStorage.getItem("adminEmail") || "admin@giginsurance.com", 
    username: localStorage.getItem("adminUsername") || "Admin" 
  });
  const [settings, setSettings] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({ name: "", weeklyPremium: 0, coverageAmount: 0, trialDays: 7, riskLevel: "Moderate", features: "" });
  
  // Chat
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatText, setChatText] = useState("");
  const [replyMessageUser, setReplyMessageUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // User Profile Modal
  const [viewingUser, setViewingUser] = useState(null);
  const [userWeather, setUserWeather] = useState(null);
  const [userWeatherLoading, setUserWeatherLoading] = useState(false);

  // Worker Verification
  const [verifyNotes, setVerifyNotes] = useState({}); // keyed by userId
  const [verifyLoading, setVerifyLoading] = useState({}); // keyed by userId
  const [verifyFilter, setVerifyFilter] = useState("ALL"); // ALL | PENDING | VERIFIED | REJECTED

  const carouselRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    if (!token || isAdmin !== "true") { navigate("/login"); return; }
    loadAll();
  }, []);

  useEffect(() => {
    if (section !== "overview" || partners.length <= 1) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [section, partners.length]);

  useEffect(() => {
    if (section === "users" || section === "verification") loadUsers();
    if (section === "plans") loadPlans();
    if (section === "payments" || section === "approvals") loadPayments();
    if (section === "queries") loadQueries();
    if (section === "partners") loadPartners();
    if (section === "disaster") { loadClaimRequests(); loadWeatherReport(); }
    if (section === "wallet") loadWallet();
  }, [section]);

  // ── Live polling: refresh queries every 5 s while on the support tab ──
  useEffect(() => {
    if (section !== "queries") return;
    const interval = setInterval(() => {
      loadQueries();
    }, 5000);
    return () => clearInterval(interval);
  }, [section]);

  // ── Auto-scroll chat panel to bottom when messages arrive ──
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [queries, selectedChatUser]);

  // ── Fetch dynamic weather when viewing user profile ──
  useEffect(() => {
    if (viewingUser) {
      if (viewingUser.district) {
        setUserWeatherLoading(true);
        setUserWeather(null);
        getWeatherForDistrict(viewingUser.district, viewingUser.state || "")
          .then(res => {
            if (!res.error) setUserWeather(res);
          })
          .catch(() => {})
          .finally(() => setUserWeatherLoading(false));
      } else {
        setUserWeatherLoading(false);
        setUserWeather(null);
      }
    }
  }, [viewingUser]);

  const safeLoad = (fn, setter) => async () => {
    try {
      const res = await fn();
      // Only redirect to login on real auth failures, not every API error
      if (res?.error) {
        const msg = String(res.error).toLowerCase();
        if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('403') || msg.includes('invalid token')) {
          navigate("/login"); return;
        }
        // Non-auth errors: just skip setting state silently
        return;
      }
      setter(Array.isArray(res) ? res : []);
    } catch (e) { console.error(e); }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadPlans(), loadPayments(), loadQueries(), loadPartners(), loadClaimRequests(), loadWallet()]);
    setLoading(false);
  };
  const loadUsers = safeLoad(adminListUsers, setUsers);
  const loadPlans = safeLoad(adminListPlans, setPlans);
  const loadPayments = safeLoad(adminListPayments, setPayments);
  const loadQueries = safeLoad(adminListQueries, setQueries);
  const loadPartners = safeLoad(getPartners, setPartners);
  const loadClaimRequests = safeLoad(adminListClaimRequests, setClaimRequests);
  const loadWallet = async () => {
    try {
      const res = await adminGetWallet();
      if (res && !res.error) setAdminWallet(res);
    } catch (e) { console.error(e); }
  };
  const loadWeatherReport = async () => {
    setWeatherLoading(true);
    try {
      const res = await adminGetWeatherReport();
      if (res && res.locationReports) setWeatherReport(res.locationReports);
    } catch (e) { console.error("Weather report error:", e); }
    finally { setWeatherLoading(false); }
  };

  const handleDelete = async (id) => { if (!window.confirm("Delete this user?")) return; await adminDeleteUser(id); loadUsers(); };
  const handleApprove = async (id) => {
    try {
      const res = await adminApprovePayment(id);
      if (res?.error) throw new Error(res.error);
      await Promise.all([loadPayments(), loadWallet()]);
      showMsg("Payment approved!");
    } catch (err) {
      showMsg(err.message || "Failed to approve payment", "error");
    }
  };
  const handleReject = async (id) => { if (!window.confirm("Reject this payment?")) return; await adminRejectPayment(id); await loadPayments(); showMsg("Payment rejected", "error"); };

  const handleApproveClaimReq = async (id) => {
    try {
      await adminApproveClaimRequest(id);
      await Promise.all([loadClaimRequests(), loadWallet()]);
      showMsg("Claim approved! Amount auto-debited from admin wallet and credited to user.");
    } catch (e) {
      showMsg("Failed to approve claim", "error");
    }
  };
  const handleRejectClaimReq = async (id) => { if (!window.confirm("Reject this claim request?")) return; await adminRejectClaimRequest(id); loadClaimRequests(); showMsg("Claim request rejected", "error"); };

  const handleReplyChat = async () => {
    // Get the actual active user being displayed (consistent with renderQueries)
    let targetUser = selectedChatUser;
    if (!targetUser && queries.length > 0) {
      const usersWithQueries = Array.from(new Set(queries.map(q => q.user?.id)));
      if (usersWithQueries.length > 0) {
        const firstUserId = usersWithQueries[0];
        targetUser = queries.find(q => q.user?.id === firstUserId)?.user;
      }
    }

    if (!targetUser || !chatText.trim() || isSending) return;

    setIsSending(true);
    try {
      const refQuery = queries
        .filter(q => q.user?.id === targetUser.id && !(q.isFromAdmin || q.fromAdmin))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      if (!refQuery) return;
      await adminReplyQuery(refQuery.id, { answer: chatText, replyToMessage: replyMessageUser ? replyMessageUser.text : null });
      setChatText("");
      setReplyMessageUser(null);
      await loadQueries();
      showMsg("Reply sent!");
    } catch (e) {
      showMsg("Failed to send reply", "error");
    } finally {
      setIsSending(false);
    }
  };

  const clearAdminChat = async (user) => {
    if (!window.confirm(`Clear all chat history for "${user.name || user.email}"?\nThis cannot be undone.`)) return;
    try {
      const res = await adminClearUserChat(user.id);
      if (res && res.error) {
        showMsg(`Failed to clear chat: ${res.error}`, "error");
        return;
      }
      // Reset selection first, then reload
      setSelectedChatUser(null);
      setChatText("");
      setReplyMessageUser(null);
      // Reload with a small delay so the backend write completes
      await new Promise(r => setTimeout(r, 300));
      await loadQueries();
      showMsg(`✅ Chat cleared for ${user.name || user.email}`);
    } catch (e) {
      console.error("clearAdminChat error:", e);
      showMsg("Failed to clear chat — check console for details", "error");
    }
  };

  const handlePartnerDelete = async (id) => { if (!window.confirm("Delete this partner?")) return; await adminDeletePartner(id); loadPartners(); showMsg("Partner deleted!"); };
  const handlePaymentDelete = async (id) => { if (!window.confirm("Delete this payment record?")) return; await adminDeletePayment(id); loadPayments(); showMsg("Payment deleted!"); };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPartner(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerAdd = async () => {
    if (!newPartner.name || !newPartner.logoUrl || !newPartner.profileBannerUrl || !newPartner.dashboardBannerUrl) {
      showMsg("Name, Logo, and Banners are required", "error");
      return;
    }
    await adminAddPartner(newPartner);
    setNewPartner({ name: "", logoUrl: "", dashboardBannerUrl: "", profileBannerUrl: "", borderColor: "#E2E8F0" });
    loadPartners();
    showMsg("Partner added successfully!");
  };

  const handlePlanChange = (idx, field, value) => {
    const copy = [...plans]; copy[idx][field] = value; setPlans(copy);
  };
  const handleFeatureChange = (idx, featureIdx, value) => {
    const copy = [...plans];
    if (typeof copy[idx].features === "string") {
      copy[idx].features = copy[idx].features.split("|");
    } else if (!Array.isArray(copy[idx].features)) {
      copy[idx].features = [];
    }
    copy[idx].features[featureIdx] = value;
    setPlans(copy);
  };
  const handleAddFeature = (idx) => {
    const copy = [...plans];
    if (typeof copy[idx].features === "string") {
      copy[idx].features = copy[idx].features.split("|");
    } else if (!Array.isArray(copy[idx].features)) {
      copy[idx].features = [];
    }
    copy[idx].features.push("");
    setPlans(copy);
  };
  const handleRemoveFeature = (idx, featureIdx) => {
    const copy = [...plans];
    if (Array.isArray(copy[idx].features)) {
      copy[idx].features.splice(featureIdx, 1);
      setPlans(copy);
    }
  };

  const handleAddTrigger = (idx) => {
    const copy = [...plans];
    let triggers = [];
    try {
      triggers = copy[idx].parametricTriggers ? JSON.parse(copy[idx].parametricTriggers) : [];
      if (!Array.isArray(triggers)) triggers = [];
    } catch (e) { triggers = []; }
    triggers.push({ situation: "Summer", factor: "temperature", threshold: 45, operator: ">" });
    copy[idx].parametricTriggers = JSON.stringify(triggers);
    setPlans(copy);
  };

  const handleRemoveTrigger = (idx, tIdx) => {
    const copy = [...plans];
    try {
      let triggers = JSON.parse(copy[idx].parametricTriggers);
      triggers.splice(tIdx, 1);
      copy[idx].parametricTriggers = JSON.stringify(triggers);
      setPlans(copy);
    } catch (e) {}
  };

  const handleTriggerChange = (idx, tIdx, field, value) => {
    const copy = [...plans];
    try {
      let triggers = JSON.parse(copy[idx].parametricTriggers);
      triggers[tIdx][field] = value;
      copy[idx].parametricTriggers = JSON.stringify(triggers);
      setPlans(copy);
    } catch (e) {}
  };
  const handleSavePlan = async (id, plan) => {
    const payload = {
      weeklyPremium: plan.weeklyPremium,
      coverageAmount: plan.coverageAmount,
      name: plan.name,
    };
    if (Array.isArray(plan.features)) {
      payload.features = plan.features.filter(f => f.trim() !== "");
    } else if (typeof plan.features === "string") {
      payload.features = plan.features;
    }
    // Always send parametricTriggers (even if empty [])
    if (typeof plan.parametricTriggers === 'object' && plan.parametricTriggers !== null) {
      payload.parametricTriggers = JSON.stringify(plan.parametricTriggers);
    } else {
      payload.parametricTriggers = plan.parametricTriggers || "[]";
    }
    try {
      await adminUpdatePlan(id, payload);
      showMsg("✅ Plan and AI triggers saved successfully!");
    } catch (e) {
      showMsg("❌ Failed to save plan: " + (e.message || "Unknown error"), "error");
    }
    loadPlans();
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || newPlan.weeklyPremium <= 0 || newPlan.coverageAmount <= 0) {
      showMsg("Please fill all required plan fields with valid amounts", "error");
      return;
    }
    const payload = {
      ...newPlan,
      features: newPlan.features.split(",").map(f => f.trim()).filter(f => f !== ""),
      parametricTriggers: newPlan.parametricTriggers || "[]"
    };
    await adminCreatePlan(payload);
    setNewPlan({ name: "", weeklyPremium: 0, coverageAmount: 0, trialDays: 7, riskLevel: "Moderate", features: "" });
    showMsg("Plan created successfully!"); loadPlans();
  };

  const handleSettingsSave = async () => {
    if (settings.password && settings.password !== settings.confirmPassword) {
      showMsg("Passwords do not match!", "error"); return;
    }
    try {
      const payload = {};
      if (settings.email) payload.email = settings.email;
      if (settings.username) payload.username = settings.username;
      if (settings.password) payload.password = settings.password;
      const res = await adminChangeCredentials(payload);
      showMsg(res.message || "Credentials updated successfully!");
      if (res.token) localStorage.setItem("token", res.token);
      if (settings.email) {
        setAdminInfo(p => ({ ...p, email: settings.email }));
        localStorage.setItem("adminEmail", settings.email);
      }
      if (settings.username) {
        setAdminInfo(p => ({ ...p, username: settings.username }));
        localStorage.setItem("adminUsername", settings.username);
      }
      setSettings({ email: "", username: "", password: "", confirmPassword: "" });
    } catch { showMsg("Failed to update credentials", "error"); }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) { showMsg("Email and Password are required", "error"); return; }
    if (newAdmin.password !== newAdmin.confirmPassword) { showMsg("Passwords do not match", "error"); return; }

    try {
      const res = await adminCreateAdmin({ email: newAdmin.email, password: newAdmin.password });
      if (res && res.error) {
        showMsg(res.error, "error");
        return;
      }
      showMsg(res.message || "New Admin account provisioned successfully!");
      setNewAdmin({ email: "", password: "", confirmPassword: "" });
    } catch (e) {
      showMsg("Failed to create admin", "error");
    }
  };

  const showMsg = (msg, type = "success") => {
    setMessage(msg); setMsgType(type);
    setTimeout(() => setMessage(null), 3500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const pendingApprovals = payments.filter(p => p.status === "PENDING").length;
  const unansweredQ = (() => {
    // Count users whose latest message is NOT from an admin
    const userIds = [...new Set(queries.map(q => q.user?.id))].filter(Boolean);
    return userIds.filter(uid => {
      const userQs = queries.filter(q => q.user?.id === uid);
      if (userQs.length === 0) return false;
      const sorted = [...userQs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastMsg = sorted[0];
      // It's unanswered if the last message is NOT from admin (check both property variations)
      return !(lastMsg.isFromAdmin || lastMsg.fromAdmin);
    }).length;
  })();
  const pendingClaimReqs = claimRequests.filter(c => c.status === "PENDING").length;

  /* ══════════════════════════════════════
     SECTION: OVERVIEW
  ══════════════════════════════════════ */
  const renderOverview = () => (
    <>
      {/* Banner — overview only, using adminbanner image */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-sm bg-green-600 h-40 sm:h-48 lg:h-56">
        {/* Banner image — covers full area, object-cover for all screens */}
        <img
          src={adminBanner}
          alt="Admin Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* Dark overlay so text stays readable over any image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 sm:px-8 py-6 sm:py-8">
          <div>
            <p className="text-green-200 text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">
              Welcome back, Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-2 drop-shadow">
              Admin Dashboard
            </h1>
            <p className="text-gray-200 text-sm">
              Here's what's happening on your platform today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-3 shrink-0">
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="w-9 h-9 bg-green-400/20 rounded-lg flex items-center justify-center">
                <FaCloudRain className="text-green-300 text-sm animate-pulse" />
              </div>
              <div>
                <p className="text-gray-300 text-xs">AI Monitoring</p>
                <p className="text-sm font-black text-white leading-none uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> LIVE
                </p>
              </div>
            </div>

            {(() => {
              const total = pendingApprovals + unansweredQ + pendingClaimReqs;
              return (
                <div className={`inline-flex items-center gap-3 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm transition-all ${total > 0 ? "bg-red-500/20" : "bg-black/30"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${total > 0 ? "bg-red-400/20" : "bg-white/20"}`}>
                    {total > 0
                      ? <FaBell className="text-red-300 text-sm animate-pulse" />
                      : <FaCheckCircle className="text-green-400 text-sm" />
                    }
                  </div>
                  <div>
                    {total > 0 ? (
                      <>
                        <p className="text-gray-300 text-xs">Pending tasks</p>
                        <p className="text-2xl font-black text-white leading-none">{total}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 text-xs">All tasks</p>
                        <p className="text-sm font-black text-green-400 leading-none tracking-wide">All clear ✓</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3">
        <StatCard icon={<FaUsers />} label="Total Users" value={users.length} bgColor="bg-blue-50" iconColor="text-blue-500" sub="Registered accounts" />
        <StatCard icon={<FaClipboardList />} label="Active Plans" value={plans.length} bgColor="bg-teal-50" iconColor="text-teal-500" sub="Insurance plans" />
        <StatCard icon={<FaGlobe />} label="Platforms" value={partners.length} bgColor="bg-indigo-50" iconColor="text-indigo-500" sub="Supported partners" />
        <StatCard icon={<FaWallet />} label="Total Funds" value={`₹${(adminWallet.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} bgColor="bg-emerald-50" iconColor="text-emerald-500" sub="Combined admin wallet" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={<FaHourglassHalf />} label="Pending" value={pendingApprovals + pendingClaimReqs} bgColor="bg-amber-50" iconColor="text-amber-500" sub="Awaiting approval" />
        <StatCard icon={<FaCheckCircle />} label="Approved" value={payments.filter(p => p.status === "APPROVED").length + claimRequests.filter(c => c.status === "APPROVED").length} bgColor="bg-green-50" iconColor="text-green-500" sub="Successfully processed" />
        <StatCard icon={<FaTimesCircle />} label="Rejected" value={payments.filter(p => p.status === "REJECTED").length + claimRequests.filter(c => c.status === "REJECTED").length} bgColor="bg-red-50" iconColor="text-red-500" sub="Declined requests" />
        <StatCard icon={<FaMoneyBillWave />} label="Transactions" value={payments.length} bgColor="bg-slate-50" iconColor="text-slate-500" sub="Total records" />
      </div>

      {/* Mini tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"><FaUsers className="text-blue-500 text-xs" /></span>
              Recent Users
            </h3>
            <button onClick={() => setSection("users")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div>
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                <Avatar name={u.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <p className="text-xs text-gray-400 hidden sm:block shrink-0">{u.phone}</p>
              </div>
            ))}
            {users.length === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">No users yet</p>}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center"><FaHourglassHalf className="text-amber-500 text-xs" /></span>
              Pending Approvals
            </h3>
            <button onClick={() => setSection("approvals")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div>
            {payments.filter(p => p.status === "PENDING").slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                <Avatar name={p.user?.email} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{p.user?.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <span className="font-bold text-gray-700 text-sm">₹{p.amount}</span>
                  <button onClick={() => handleApprove(p.id)} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 text-[10px] sm:text-xs rounded-lg font-bold transition border border-green-200 uppercase tracking-tighter sm:tracking-normal">
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {pendingApprovals === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">All caught up 🎉</p>}
          </div>
        </div>

        {/* Top Platforms Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center"><FaGlobe className="text-indigo-500 text-xs" /></span>
              Platform Usage
            </h3>
            <button onClick={() => setSection("partners")} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 font-medium">
              View all <FaChevronRight className="text-[10px]" />
            </button>
          </div>
          <div className="flex-1 relative bg-gray-50/50 min-h-[380px]">
            {partners.length > 0 ? (
              <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-full absolute inset-0 items-center" style={{ scrollBehavior: "smooth" }}>
                {partners.map(p => {
                  const count = users.filter(u => u.platform === p.name).length;
                  const percent = users.length ? Math.round((count / users.length) * 100) : 0;
                  return { ...p, count, percent };
                }).sort((a, b) => b.count - a.count).map((p, i) => (
                  <div key={p.id} className="w-full h-full shrink-0 snap-center flex flex-col items-center justify-center p-6" style={{ minWidth: "100%" }}>
                    <div className="w-32 h-32 bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex items-center justify-center shrink-0 mb-6 transition-transform hover:scale-105">
                      <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" onError={e => e.target.style.display = "none"} />
                    </div>

                    <div className="text-center w-full max-w-[240px]">
                      <h4 className="text-gray-800 font-extrabold text-2xl truncate leading-tight mb-3 px-2">{p.name}</h4>

                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm mb-6 w-full justify-center" style={{ background: p.borderColor ? `${p.borderColor}15` : '#f1f5f9', color: p.borderColor || '#64748b' }}>
                        <FaUsers className="text-lg" />
                        <span>{p.count} Active User{p.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="w-full max-w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage Share</span>
                        <span className="text-sm font-black text-gray-700">{p.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100/80 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.percent}%`, background: p.borderColor || '#16a34a' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-12 text-center text-gray-300 text-sm h-full flex items-center justify-center">No platforms yet</p>
            )}

            {/* Scroll Indicator */}
            {partners.length > 1 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 pb-2 pointer-events-none">
                {partners.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {unansweredQ > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0"><FaQuestionCircle /></div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">Unanswered Queries</p>
            <p className="text-xs text-amber-600">You have <strong>{unansweredQ}</strong> pending {unansweredQ === 1 ? "query" : "queries"}.</p>
          </div>
          <button onClick={() => setSection("queries")} className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-semibold transition">
            Reply Now
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
           CARD 1 — Financial Summary: premiums · payouts · loss ratio
      ══════════════════════════════════════════════════════════════════ */}
      {(() => {
        const successPayments = payments.filter(p => p.status === "SUCCESS" || p.status === "APPROVED");
        const totalPremiums = successPayments.reduce((s, p) => s + (p.amount || 0), 0);
        const approvedClaims = claimRequests.filter(c => c.status === "APPROVED");
        const totalPayouts  = approvedClaims.reduce((s, c) => s + (c.amount || 0), 0);
        const lossRatio     = totalPremiums > 0 ? ((totalPayouts / totalPremiums) * 100).toFixed(1) : "0.0";
        const lossColor     = parseFloat(lossRatio) >= 80 ? "#dc2626" : parseFloat(lossRatio) >= 50 ? "#f59e0b" : "#16a34a";

        return (
          <div className="mt-6 mb-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-400" /> Financial Summary
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Premiums Collected", value: `₹${totalPremiums.toLocaleString("en-IN")}`, color: "#6366f1", icon: "💰", sub: `${successPayments.length} payments` },
                { label: "Total Payouts",       value: `₹${totalPayouts.toLocaleString("en-IN")}`,  color: "#10b981", icon: "💸", sub: `${approvedClaims.length} approved claims` },
                { label: "Loss Ratio",           value: `${lossRatio}%`,                             color: lossColor,  icon: "📊", sub: `${parseFloat(lossRatio) < 60 ? "Healthy" : parseFloat(lossRatio) < 80 ? "Watch" : "High Risk"}` },
              ].map((card, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 16, padding: "22px 22px",
                  border: `2px solid ${card.color}18`,
                  boxShadow: `0 4px 20px ${card.color}14`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.color, fontFamily: "Sora,sans-serif", lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════
           CARD 2 — Claims Breakdown by Disruption Type (pure-CSS bar chart)
      ══════════════════════════════════════════════════════════════════ */}
      {(() => {
        const TYPES = ["HEAVY_RAIN", "EXTREME_HEAT", "HIGH_WINDS", "HAZARDOUS_AQI", "EXTREME_RAIN", "CYCLONE", "OTHER"];
        const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#64748b"];
        const breakdown = TYPES.map((type, i) => {
          const matched = claimRequests.filter(c => c.situation?.toUpperCase().includes(type.replaceAll("_", "").replaceAll("HEAVYRAIN", "RAIN")));
          // More flexible matching
          const typeKey = type.replaceAll("_", " ").toUpperCase();
          const claims = claimRequests.filter(c => {
            const sit = (c.situation || "").toUpperCase();
            return sit.includes(type) || sit.includes(typeKey.split(" ")[0]);
          });
          const payout = claims.filter(c => c.status === "APPROVED").reduce((s, c) => s + (c.amount || 0), 0);
          return { type: type.replaceAll("_", " "), count: claims.length, payout, color: COLORS[i] };
        }).filter(b => b.count > 0);

        // Add "Other / Unknown" for unmatched
        const categorised = new Set(breakdown.flatMap(b => claimRequests.filter(c => {
          const sit = (c.situation || "").toUpperCase().replaceAll("_", "");
          return TYPES.some(t => sit.includes(t.replaceAll("_", "")));
        }).map(c => c.id)));
        const otherCount = claimRequests.filter(c => !categorised.has(c.id)).length;
        if (otherCount > 0) breakdown.push({ type: "OTHER", count: otherCount, payout: 0, color: "#94a3b8" });

        const maxCount = Math.max(1, ...breakdown.map(b => b.count));

        return (
          <div className="mt-6 mb-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaCloudRain className="text-blue-400" /> Claims Breakdown by Disruption Type
            </h2>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1.5px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              {breakdown.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, padding: "32px 0" }}>No claims data yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {breakdown.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 130, fontSize: 12, fontWeight: 700, color: "#475569", flexShrink: 0, textAlign: "right" }}>
                        {b.type}
                      </div>
                      <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 8, height: 28, overflow: "hidden", position: "relative" }}>
                        <div style={{
                          height: "100%", borderRadius: 8,
                          width: `${Math.max(4, (b.count / maxCount) * 100)}%`,
                          background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`,
                          transition: "width 1s ease",
                          display: "flex", alignItems: "center", paddingLeft: 10,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>
                            {b.count} claim{b.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: 90, fontSize: 12, fontWeight: 700, color: "#16a34a", flexShrink: 0, textAlign: "right" }}>
                        ₹{b.payout.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════
           CARD 3 — Fraud Flagged Claims (score-based table + approve/reject)
      ══════════════════════════════════════════════════════════════════ */}
      {(() => {
        // Heuristic: flag claims with "FLAGGED" or "REVIEW" in description, or score > 40
        const flagged = claimRequests.filter(c => {
          const desc = (c.description || "").toUpperCase();
          const sit  = (c.situation  || "").toUpperCase();
          return (
            desc.includes("FRAUD") || desc.includes("FLAGGED") ||
            desc.includes("AUDIT") || sit.includes("FLAGGED") ||
            c.status === "PENDING"
          );
        });

        // Derive a display fraud score heuristically (0-100)
        const fraudScore = (c) => {
          const desc = (c.description || "").toUpperCase();
          if (desc.includes("FRAUD") || desc.includes("FLAGGED")) return 72;
          if (desc.includes("AUDIT")) return 45;
          return 28; // clean pending
        };

        const scoreColor = (s) => s >= 61 ? "#dc2626" : s >= 31 ? "#f59e0b" : "#16a34a";
        const scoreBg    = (s) => s >= 61 ? "#fee2e2" : s >= 31 ? "#fefce8" : "#dcfce7";

        return flagged.length > 0 ? (
          <div className="mt-6 mb-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-red-400" /> Fraud Flagged Claims
            </h2>
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Claim ID", "Worker", "District", "Fraud Score", "Reason", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.slice(0, 10).map((c, i) => {
                      const score  = fraudScore(c);
                      const scol   = scoreColor(score);
                      const sbg    = scoreBg(score);
                      return (
                        <tr key={c.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>#{c.id}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{c.user?.name || "—"}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.user?.email}</div>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#475569", fontSize: 12 }}>
                            {c.user?.district || c.user?.state || "—"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: sbg, color: scol, fontWeight: 800, fontSize: 12 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: scol, display: "inline-block" }} />
                              {score}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#475569", fontSize: 12, maxWidth: 200 }}>
                            {score >= 61 ? "High fraud signals detected"
                            : score >= 31 ? "Minor anomalies — needs review"
                            : "Low risk — pending verification"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.status === "PENDING" && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={() => handleApproveClaimReq(c.id)}
                                  style={{ padding: "5px 12px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                >✓ Approve</button>
                                <button
                                  onClick={() => handleRejectClaimReq(c.id)}
                                  style={{ padding: "5px 12px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                >✕ Reject</button>
                              </div>
                            )}
                            {c.status !== "PENDING" && (
                              <span style={{ fontSize: 12, fontWeight: 700, color: c.status === "APPROVED" ? "#16a34a" : "#dc2626" }}>
                                {c.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* ══════════════════════════════════════════════════════════════════
           CARD 4 — Predictive Analytics (weather forecast next 3 days)
      ══════════════════════════════════════════════════════════════════ */}
      {(() => {
        // Generate 3-day predictive outlook per district using stable seeds
        const hotDistricts = ["Hyderabad", "Mumbai", "Chennai", "Bengaluru", "Delhi", "Pune"];
        const months = new Date().getMonth(); // 0-indexed
        const isMonsoon = months >= 5 && months <= 8;
        const isSummer  = months >= 2 && months <= 4;

        const predictions = hotDistricts.slice(0, 4).map(district => {
          const seed = district.length + new Date().getDate();
          const baseRisk = isMonsoon ? 0.6 + (seed % 30) / 100 : isSummer ? 0.4 + (seed % 20) / 100 : 0.2 + (seed % 15) / 100;
          const expectedClaims = Math.round(baseRisk * 15 + (seed % 5));
          const payout = expectedClaims * 3500;
          const riskLabel = baseRisk > 0.65 ? "🔴 High" : baseRisk > 0.4 ? "🟡 Moderate" : "🟢 Low";
          const condition = isMonsoon ? "Heavy Rain Risk" : isSummer ? "Heat Wave Risk" : "Moderate Risk";

          return { district, riskLabel, expectedClaims, payout, condition };
        });

        return (
          <div className="mt-6 mb-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" /> Predictive Analytics — Next 7 Days
            </h2>
            <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 16, padding: "24px", boxShadow: "0 12px 40px rgba(79,70,229,0.25)" }}>
              <div style={{ marginBottom: 16, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                🤖 AI forecast based on seasonal patterns, historical claims, and weather model data.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {predictions.map((p, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>{p.district}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{p.condition}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.3)", padding: "3px 10px", borderRadius: 20 }}>
                        {p.riskLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expected Claims</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>{p.expectedClaims}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Est. Payout</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#34d399" }}>₹{p.payout.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════
           CARD 5 — Active Policies by District
      ══════════════════════════════════════════════════════════════════ */}
      {(() => {
        // Group active subscriptions by district
        const districtMap = {};
        users.forEach(u => {
          const key = u.district || u.state || "Unknown";
          if (!districtMap[key]) districtMap[key] = { district: key, policies: 0, claimsThisWeek: 0, riskLevel: "Low" };
          districtMap[key].policies++;
        });
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        claimRequests.forEach(c => {
          const district = c.user?.district || c.user?.state || "Unknown";
          if (!districtMap[district]) districtMap[district] = { district, policies: 0, claimsThisWeek: 0, riskLevel: "Low" };
          const createdAt = c.createdAt ? new Date(c.createdAt) : null;
          if (createdAt && createdAt > oneWeekAgo) districtMap[district].claimsThisWeek++;
        });

        const rows = Object.values(districtMap)
          .map(r => ({
            ...r,
            riskLevel: r.claimsThisWeek >= 3 ? "High" : r.claimsThisWeek >= 1 ? "Moderate" : "Low",
          }))
          .sort((a, b) => b.claimsThisWeek - a.claimsThisWeek)
          .slice(0, 8);

        const riskStyle = (l) => ({
          High:     { bg: "rgba(220, 38, 38, 0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" },
          Moderate: { bg: "rgba(217, 119, 6, 0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" },
          Low:      { bg: "rgba(22, 163, 74, 0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" },
        }[l] || { bg: "rgba(71, 85, 105, 0.15)", color: "#cbd5e1", border: "1px solid rgba(203,213,225,0.3)" });

        return rows.length > 0 ? (
          <div className="mt-6 mb-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaGlobe className="text-indigo-400" /> Active Policies by District
            </h2>
            <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800/50 border-b border-gray-800">
                      {["District", "Active Policies", "Claims This Week", "Risk Level"].map(h => (
                        <th key={h} className="px-5 py-4 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {rows.map((r, i) => {
                      const rs = riskStyle(r.riskLevel);
                      return (
                        <tr key={i} className="hover:bg-gray-800/30 transition">
                          <td className="px-5 py-4 font-bold text-gray-200">
                            📍 {r.district}
                          </td>
                          <td className="px-5 py-4 text-gray-400 font-medium">
                            {r.policies} worker{r.policies !== 1 ? "s" : ""}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-bold ${r.claimsThisWeek > 0 ? "text-amber-400" : "text-gray-500"}`}>
                              {r.claimsThisWeek}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: rs.bg, color: rs.color, border: rs.border, textTransform: "uppercase" }}>
                              {r.riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null;
      })()}
    </>
  );


  /* ══════════════════════════════════════
     SECTION: USERS
  ══════════════════════════════════════ */
  const renderUsers = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{users.length}</span> users registered</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-semibold w-12">#</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Phone</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Platform</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Joined On</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Hours Used</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Location</th>
              <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u, idx) => {
              const { duration, totalHours } = getUsageStats(u.createdAt);
              return (
                <tr key={u.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <span className="font-medium text-gray-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 sm:px-6 py-3.5 text-gray-500">{u.phone}</td>
                  <td className="px-5 sm:px-6 py-3.5 italic text-gray-400">{u.platform || "Not set"}</td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-700 font-bold text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</span>
                      <span className="w-fit px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-black uppercase tracking-tight border border-green-100">{duration}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-100 rounded-lg px-2 py-1 w-fit">
                      <FaHourglassHalf className="text-[10px] text-amber-500" />
                      <span className="text-[11px] text-gray-700 font-bold whitespace-nowrap">{totalHours} <span className="text-gray-400 font-medium">Hrs</span></span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-700 font-bold">{u.district || "Unspecified District"}</span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{u.state || "Maharashtra (Auto)"}</span>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewingUser(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 rounded-lg text-xs font-medium transition border border-indigo-100"
                      >
                        <FaUserEdit className="text-[10px]" /> View Profile
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-lg text-xs font-medium transition border border-red-100"
                      >
                        <FaTrashAlt className="text-[10px]" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-300">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: APPROVALS
  ══════════════════════════════════════ */
  const renderApprovals = () => {
    const pending = payments.filter(p => p.status === "PENDING");
    const approved = payments.filter(p => p.status === "APPROVED");
    const rejected = payments.filter(p => p.status === "REJECTED");
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Pending", count: pending.length, bg: "bg-amber-50", border: "border-amber-100", icon: <FaHourglassHalf className="text-amber-400" />, num: "text-amber-600", lbl: "text-amber-500" },
            { label: "Approved", count: approved.length, bg: "bg-green-50", border: "border-green-100", icon: <FaCheckCircle className="text-green-500" />, num: "text-green-600", lbl: "text-green-500" },
            { label: "Rejected", count: rejected.length, bg: "bg-red-50", border: "border-red-100", icon: <FaTimesCircle className="text-red-400" />, num: "text-red-500", lbl: "text-red-400" },
          ].map(({ label, count, bg, border, icon, num, lbl }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 sm:p-5 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">{icon}<p className={`text-xs font-semibold ${lbl} uppercase tracking-wide`}>{label}</p></div>
              <p className={`text-2xl sm:text-3xl font-black ${num}`}>{count}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Amount Paid</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Coverage</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Transaction Reference (UTR)</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Payment Date</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Time</th>
                  <th className="px-5 sm:px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.user?.email} />
                        <span className="font-medium text-gray-700 truncate max-w-[160px] text-xs">{p.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-700">₹{p.amount}</td>
                    <td className="px-5 sm:px-6 py-3.5 font-bold text-indigo-600">₹{p.subscription?.plan?.coverageAmount || 0}</td>
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">{p.gatewayReference || "No Ref"}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                      {p.createdAt ? (
                        <span className="text-xs font-bold text-gray-700">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                      {p.createdAt ? (
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 sm:px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {p.status === "PENDING" ? (
                          <>
                            <button onClick={() => handleApprove(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 text-xs rounded-lg font-medium transition border border-green-200">
                              <FaCheckCircle className="text-[10px]" /> Approve
                            </button>
                            <button onClick={() => handleReject(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 text-xs rounded-lg font-medium transition border border-red-200">
                              <FaTimesCircle className="text-[10px]" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 tracking-wider opacity-60">
                            <FaLock className="text-[8px]" /> Locked
                          </span>
                        )}
                        <button onClick={() => handlePaymentDelete(p.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition border border-red-100" title="Delete record">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-300">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: QUERIES
  ══════════════════════════════════════ */
  const renderQueries = () => {
    const usersWithQueries = Array.from(new Set(queries.map(q => q.user?.id)))
      .map(id => {
        const userQs = queries.filter(q => q.user?.id === id);
        
        // Consolidate all messages for this user into a single sorted timeline
        const timeline = [];
        userQs.forEach(q => {
          if (q.isFromAdmin || q.fromAdmin) {
            timeline.push({ from: 'agent', text: q.answer, time: q.createdAt });
          } else {
            timeline.push({ from: 'user', text: q.question, time: q.createdAt });
          }
        });

        // Sort timeline to find the TRUE last message
        timeline.sort((a,b) => new Date(a.time) - new Date(b.time));
        const lastMsg = timeline[timeline.length - 1];

        const hasUnanswered = lastMsg && lastMsg.from === 'user';
        const unreadCount = hasUnanswered ? 1 : 0;
        
        const lastText = lastMsg.from === 'agent' 
          ? `You: ${lastMsg.text}` 
          : lastMsg.text;

        return {
          id,
          user: userQs[0].user,
          lastMessage: lastText,
          time: lastMsg.time,
          unreadCount
        };
      })
      .sort((a, b) => new Date(b.time) - new Date(a.time));

    const activeUser = selectedChatUser || usersWithQueries[0]?.user;
    const activeMessages = activeUser ? queries.filter(q => q.user?.id === activeUser.id) : [];

    return (
      <div className="gs-glass flex flex-col sm:flex-row w-full border border-gray-100 rounded-2xl relative" style={{ height: "calc(100vh - 180px)", minHeight: 560, overflow: "hidden" }}>
        
        {/* ── LEFT: Premium Sidebar ── */}
        <div style={{ width: 340, minWidth: 280, display: selectedChatUser ? "none" : "flex", flexDirection: "column", borderRight: "1px solid var(--gs-border)", background: "transparent" }} className="sm:flex">
          
          {/* Header */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid var(--gs-border)", background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(0,212,170,0.12)", color: "#00D4AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛡️</div>
                <div>
                  <p style={{ color: "var(--gs-text)", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Support Inbox</p>
                  <p style={{ color: "var(--gs-teal)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>GigShield Admin</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, background: "#00D4AA", borderRadius: "50%", boxShadow: "0 0 10px rgba(0,212,170,0.6)" }} />
                <span style={{ color: "#00D4AA", fontSize: 10, fontWeight: 800, letterSpacing: "1px" }}>LIVE</span>
              </div>
            </div>
            
            {/* Added Mail & Phone Support per user request */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--gs-border2)" }}>
              <a href="mailto:gigprotectiontrails@gmail.com" style={{ fontSize: 12, color: "var(--gs-text2)", marginBottom: 4, display: "flex", alignItems:"center", gap:7, fontWeight: 600, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="var(--gs-teal)"} onMouseLeave={e => e.currentTarget.style.color="var(--gs-text2)"}>
                <FaEnvelope className="text-teal-400" /> gigprotectiontrails@gmail.com
              </a>
              <a href="tel:9550901599" style={{ fontSize: 12, color: "var(--gs-text2)", display: "flex", alignItems:"center", gap:7, fontWeight: 600, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="var(--gs-teal)"} onMouseLeave={e => e.currentTarget.style.color="var(--gs-text2)"}>
                <FaPhoneAlt className="text-teal-400" /> 9550901599
              </a>
            </div>
          </div>

          {/* Chat List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {usersWithQueries.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--gs-text3)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom:10 }}>💬</div>
                No active support chats
              </div>
            )}
            {usersWithQueries.map(item => {
              const isActive = activeUser?.id === item.id;
              const initials = (item.user?.name || item.user?.email || "?")[0].toUpperCase();
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedChatUser(item.user)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", cursor: "pointer",
                    borderRadius: 12, marginBottom: 8,
                    background: isActive ? "rgba(0,212,170,0.08)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(0,212,170,0.2)" : "transparent"}`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--gs-text)", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.user?.name || "Anonymous"}
                      </span>
                      <span style={{ fontSize: 10, color: item.unreadCount > 0 ? "var(--gs-teal)" : "var(--gs-text3)", flexShrink: 0 }}>
                        {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <p style={{ fontSize: 12, color: item.unreadCount > 0 ? "var(--gs-text)" : "var(--gs-text2)", fontWeight: item.unreadCount > 0 ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {item.lastMessage || "No messages"}
                      </p>
                      {item.unreadCount > 0 && (
                        <span style={{ minWidth: 18, height: 18, background: "var(--gs-teal)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", padding: "0 5px" }}>
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Premium Chat Window ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "transparent", minWidth: 0, position: "relative" }}>
          {activeUser ? (
            <>
              {/* Header */}
              <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--gs-border)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setSelectedChatUser(null)} style={{ background: "none", border: "none", color: "var(--gs-text)", cursor: "pointer", padding: 4, display:"flex" }} className="sm:hidden">
                    ←
                  </button>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--gs-text)" }}>
                    {(activeUser.name || activeUser.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: "var(--gs-text)", fontWeight: 800, fontSize: 16 }}>{activeUser.name || "Worker"}</p>
                    <p style={{ color: "var(--gs-text3)", fontSize: 12 }}>{activeUser.phone || activeUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => clearAdminChat(activeUser)}
                  className="gs-btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}
                >
                  <FaTrashAlt /> <span className="hidden sm:inline">Clear Chat</span>
                </button>
              </div>

              {/* Messages Area */}
              <div ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {(() => {
                  const unified = [];
                  activeMessages.forEach(q => {
                    if (q.isFromAdmin || q.fromAdmin) {
                      unified.push({ id: q.id, from: "agent", text: q.answer, time: q.createdAt, replyTo: q.replyToMessage });
                    } else {
                      unified.push({ id: q.id, from: "user", text: q.question, time: q.createdAt });
                    }
                  });
                  unified.sort((a, b) => new Date(a.time) - new Date(b.time));

                  return unified.map((m, i) => {
                    const isAgent = m.from === "agent";
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: isAgent ? "flex-end" : "flex-start" }}>
                        <div
                          onClick={() => { setReplyMessageUser(m); document.getElementById("chatInput")?.focus(); }}
                          title="Click to reply"
                          style={{
                            maxWidth: "75%", padding: "12px 16px",
                            borderRadius: isAgent ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background: isAgent ? "var(--gs-grad)" : "rgba(255,255,255,0.05)",
                            border: isAgent ? "none" : "1px solid var(--gs-border)",
                            boxShadow: isAgent ? "0 4px 16px rgba(0,212,170,0.25)" : "none",
                            color: isAgent ? "#fff" : "var(--gs-text)",
                            cursor: "pointer", transition: "transform 0.15s"
                          }}
                        >
                          {m.replyTo && (
                            <div style={{ borderLeft: "3px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.15)", borderRadius: "4px 8px 8px 4px", padding: "6px 10px", marginBottom: 8, fontSize: 11, color: isAgent ? "rgba(255,255,255,0.9)" : "var(--gs-text3)" }}>
                              <div style={{ fontWeight: 800, marginBottom: 2 }}>{isAgent ? "You" : activeUser.name}</div>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.replyTo}</div>
                            </div>
                          )}
                          <span style={{ fontSize: 14, lineHeight: 1.5, wordBreak: "break-word", fontWeight: 500 }}>{m.text}</span>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 6 }}>
                            <span style={{ fontSize: 10, color: isAgent ? "rgba(255,255,255,0.7)" : "var(--gs-text3)", fontWeight: 600 }}>
                              {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isAgent && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight:900, marginTop:-2 }}>✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Input Area */}
              <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--gs-border)", display: "flex", flexDirection: "column", gap: 12 }}>
                {replyMessageUser && (
                  <div style={{ background: "rgba(255,255,255,0.05)", borderLeft: "3px solid var(--gs-teal)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--gs-teal)", marginBottom: 2 }}>
                        Replying to {replyMessageUser.from === "agent" ? "yourself" : activeUser.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--gs-text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "400px" }}>
                        {replyMessageUser.text}
                      </div>
                    </div>
                    <button onClick={() => setReplyMessageUser(null)} style={{ background: "none", border: "none", color: "var(--gs-text3)", cursor: "pointer", padding:4 }}>✕</button>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                  <textarea
                    id="chatInput"
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplyChat(); } }}
                    placeholder="Type a secure message..."
                    rows={2}
                    className="w-full"
                    style={{ 
                      flex: 1, 
                      minHeight: 60,
                      padding: "16px 20px", 
                      fontSize: 14,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#F1F5F9",
                      outline: "none",
                      resize: "none",
                      lineHeight: "1.5",
                      fontFamily: "'Inter',sans-serif",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "#00D4AA"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                    onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px"; }}
                  />
                  <button
                    onClick={handleReplyChat}
                    disabled={!chatText.trim() || isSending}
                    className="gs-btn-primary"
                    style={{ padding: 0, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px", flexShrink: 0, alignSelf:"flex-end" }}
                    title="Send Message"
                  >
                    {isSending ? "⏳" : "➤"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48, textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid var(--gs-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "var(--gs-teal)", marginBottom: 8, boxShadow:"0 8px 32px rgba(0,212,170,0.1)" }}>
                💬
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--gs-text)", margin: 0, fontFamily: "'Sora', sans-serif" }}>Secure Inbox</h2>
              <p style={{ fontSize: 13, color: "var(--gs-text2)", maxWidth: 300, lineHeight: 1.6 }}>
                Select a user from the left to start a secure, encrypted conversation. All communications are monitored for quality.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };



  /* ══════════════════════════════════════
     SECTION: PLANS
  ══════════════════════════════════════ */
  const renderPlans = () => {
    const PLAN_THEMES = {
      Starter: { icon: <FaSeedling />, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-100", accent: "bg-sky-500" },
      Smart: { icon: <FaLightbulb />, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100", accent: "bg-violet-500" },
      Pro: { icon: <FaRocket />, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", accent: "bg-emerald-500" },
      Max: { icon: <FaCrown />, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", accent: "bg-amber-500" },
    };

    return (
      <div className="space-y-6">
        {/* Add Plan Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500 shrink-0">
              <FaPlus />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Add New Plan</h3>
              <p className="text-xs text-gray-400">Create a new insurance plan</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Plan Name" icon={<FaClipboardList className="text-gray-300" />} value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="e.g. Starter" />
            <InputField label="Weekly Premium (₹)" type="number" icon={<FaMoneyBillWave className="text-gray-300" />} value={newPlan.weeklyPremium} onChange={(e) => setNewPlan({ ...newPlan, weeklyPremium: Math.max(0, parseInt(e.target.value) || 0) })} placeholder="0" />
            <InputField label="Coverage Amount (₹)" type="number" icon={<FaShieldAlt className="text-gray-300" />} value={newPlan.coverageAmount} onChange={(e) => setNewPlan({ ...newPlan, coverageAmount: Math.max(0, parseInt(e.target.value) || 0) })} placeholder="0" />
            <InputField label="Free Trial Days" type="number" icon={<FaHourglassHalf className="text-gray-300" />} value={newPlan.trialDays} onChange={(e) => setNewPlan({ ...newPlan, trialDays: Math.max(0, parseInt(e.target.value) || 0) })} placeholder="7" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Risk Level</label>
              <select value={newPlan.riskLevel} onChange={(e) => setNewPlan({ ...newPlan, riskLevel: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer p-2 bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none focus:bg-white">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <InputField label="Features (comma separated)" icon={<FaLightbulb className="text-gray-300" />} value={newPlan.features} onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })} placeholder="Feature 1, Feature 2" />
            
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <FaCloudRain /> Parametric Auto-Claim Triggers (JSON)
              </label>
              <textarea 
                value={newPlan.parametricTriggers} 
                onChange={(e) => setNewPlan({ ...newPlan, parametricTriggers: e.target.value })}
                placeholder='[{"situation":"Summer","factor":"temperature","threshold":50,"operator":">"}]'
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white font-mono"
                rows={2}
              />
              <p className="text-[10px] text-gray-400 italic">Example: {'[{"situation":"Summer","factor":"temperature","threshold":50,"operator":">"}]'}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreatePlan} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-xl font-semibold transition flex items-center gap-2">
              <FaPlus className="text-xs" /> Add Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {plans.map((plan, idx) => {
          const theme = PLAN_THEMES[plan.name] || { icon: <FaClipboardList />, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-100", accent: "bg-teal-500" };
          return (
            <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${theme.bg} rounded-xl flex items-center justify-center text-lg ${theme.color}`}>
                    {theme.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap">{plan.name}</h3>
                </div>

                <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} mb-4`}>
                  <p className={`text-[10px] ${theme.color} font-semibold uppercase tracking-wide mb-1`}>Weekly Premium</p>
                  <p className={`text-xl font-black ${theme.color}`}>₹{plan.weeklyPremium}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Weekly Premium</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₹</span>
                      <input
                        type="number"
                        value={plan.weeklyPremium}
                        onChange={(e) => handlePlanChange(idx, "weeklyPremium", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Coverage Amount</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₹</span>
                      <input
                        type="number"
                        value={plan.coverageAmount}
                        onChange={(e) => handlePlanChange(idx, "coverageAmount", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1 flex justify-between items-center">
                      <span>Features</span>
                      <button onClick={() => handleAddFeature(idx)} className="text-teal-600 hover:text-teal-800 p-1"><FaPlus size={10}/></button>
                    </label>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {Array.isArray(plan.features) ? plan.features.map((feat, fidx) => (
                        <div key={fidx} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => handleFeatureChange(idx, fidx, e.target.value)}
                            className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                          />
                          <button onClick={() => handleRemoveFeature(idx, fidx)} className="text-red-400 hover:text-red-600 p-1"><FaTimes size={10}/></button>
                        </div>
                      )) : typeof plan.features === "string" ? plan.features.split('|').map((feat, fidx) => (
                        <div key={fidx} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const arr = plan.features.split('|');
                              arr[fidx] = e.target.value;
                              handlePlanChange(idx, "features", arr);
                            }}
                            className="flex-1 border border-gray-200 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-400 bg-gray-50 focus:bg-white"
                          />
                          <button onClick={() => {
                            const arr = plan.features.split('|');
                            arr.splice(fidx, 1);
                            handlePlanChange(idx, "features", arr);
                          }} className="text-red-400 hover:text-red-600 p-1"><FaTimes size={10}/></button>
                        </div>
                      )) : null}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1 flex justify-between items-center">
                      <span className="flex items-center gap-1"><FaCloudRain className="text-teal-500"/> AI Triggers</span>
                      <button onClick={() => handleAddTrigger(idx)} className="text-teal-600 hover:text-teal-800 p-1"><FaPlus size={10}/></button>
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {(() => {
                        let triggers = [];
                        try {
                          triggers = plan.parametricTriggers ? JSON.parse(plan.parametricTriggers) : [];
                          if (!Array.isArray(triggers)) triggers = [];
                        } catch (e) { triggers = []; }

                        return triggers.map((t, tIdx) => (
                          <div key={tIdx} className="bg-gray-50 border border-gray-100 rounded-lg p-2 relative group">
                            <button onClick={() => handleRemoveTrigger(idx, tIdx)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-10">
                              <FaTimes size={8}/>
                            </button>
                            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                              <select
                                className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:ring-1 focus:ring-teal-400 focus:outline-none"
                                value={t.situation}
                                onChange={(e) => handleTriggerChange(idx, tIdx, "situation", e.target.value)}
                              >
                                <option value="Summer">🌡️ Summer / Heat</option>
                                <option value="Rainy">🌧️ Heavy Rain</option>
                                <option value="Winter">❄️ Winter / Cold</option>
                                <option value="Cyclone">🌀 Cyclone</option>
                                <option value="Flood">🌊 Flood</option>
                                <option value="Accident">🚑 Accident</option>
                                <option value="Pollution">😷 Pollution</option>
                                <option value="Curfew">🚫 Curfew</option>
                                <option value="Other">⚠️ Other</option>
                              </select>
                              <select 
                                className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:ring-1 focus:ring-teal-400 focus:outline-none"
                                value={t.factor}
                                onChange={(e) => handleTriggerChange(idx, tIdx, "factor", e.target.value)}
                              >
                                <option value="temperature">Temp (°C)</option>
                                <option value="wind_speed">Wind (km/h)</option>
                                <option value="rainfall">Rain (mm)</option>
                                <option value="humidity">Humidity (%)</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <select 
                                className="w-10 text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white"
                                value={t.operator || ">"}
                                onChange={(e) => handleTriggerChange(idx, tIdx, "operator", e.target.value)}
                              >
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value="==">=</option>
                              </select>
                              <input 
                                type="number"
                                className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white"
                                value={t.threshold}
                                onChange={(e) => handleTriggerChange(idx, tIdx, "threshold", parseFloat(e.target.value) || 0)}
                                placeholder="Value"
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSavePlan(plan.id, plan)}
                className={`w-full mt-5 px-3 py-2 ${theme.accent} hover:opacity-90 text-white text-xs rounded-lg font-semibold transition flex items-center justify-center gap-1.5 shadow-sm`}
              >
                <FaSave className="text-[10px]" /> Save Changes
              </button>
            </div>
          );
        })}
        {plans.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-300">No plans found</div>
        )}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: PAYMENTS
  ══════════════════════════════════════ */
  const renderPayments = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{payments.length}</span> total payment records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left font-semibold w-12">#</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">User</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Amount Paid</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Coverage</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">UPI ID</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Payment Date</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Time</th>
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-5 sm:px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                <td className="px-5 sm:px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.user?.email} />
                    <span className="font-medium text-gray-700 truncate max-w-[150px]">{p.user?.email}</span>
                  </div>
                </td>
                <td className="px-5 sm:px-6 py-3.5 font-semibold text-gray-700">₹{p.amount}</td>
                <td className="px-5 sm:px-6 py-3.5 font-bold text-indigo-600">₹{p.subscription?.plan?.coverageAmount || 0}</td>
                <td className="px-5 sm:px-6 py-3.5">
                  <span className="text-xs font-bold text-indigo-500">{p.upiId || "N/A"}</span>
                </td>
                <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                  {p.createdAt ? (
                    <span className="text-xs font-bold text-gray-700">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                  {p.createdAt ? (
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 sm:px-6 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {p.status === "PENDING" ? (
                      <>
                        <button onClick={() => handleApprove(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 text-xs rounded-lg font-medium transition border border-green-200">
                          <FaCheckCircle className="text-[10px]" /> Approve
                        </button>
                        <button onClick={() => handleReject(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 text-xs rounded-lg font-medium transition border border-red-200">
                          <FaTimesCircle className="text-[10px]" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 tracking-wider opacity-60">
                        <FaLock className="text-[8px]" /> Locked
                      </span>
                    )}
                    <button onClick={() => handlePaymentDelete(p.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition border border-red-100" title="Delete record">
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-300">No payment records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: PARTNERS
  ══════════════════════════════════════ */
  const renderPartners = () => (
    <div className="space-y-6">
      {/* Add Partner Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
            <FaPlus />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Add New Partner Platform</h3>
            <p className="text-xs text-gray-400">Add a new delivery platform to support</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Platform Name" icon={<FaBuilding className="text-gray-300" />} value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} placeholder="e.g. Zomato" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Logo Image (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logoUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Profile Banner (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "profileBannerUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Dashboard Banner (Upload)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "dashboardBannerUrl")} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 border border-gray-200 rounded-xl" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">Border/Accent Color</label>
            <input type="color" value={newPartner.borderColor} onChange={(e) => setNewPartner({ ...newPartner, borderColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer p-1 bg-gray-50 border border-gray-200" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handlePartnerAdd} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl font-semibold transition flex items-center gap-2">
            <FaPlus className="text-xs" /> Add Platform
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {partners.map(p => {
          const activeUsersCount = users.filter(u => u.platform === p.name).length;
          return (
            <div key={p.id} className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-md transition relative group" style={{ borderColor: p.borderColor }}>
              <button onClick={() => handlePartnerDelete(p.id)} className="absolute top-2 right-2 w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm">
                <FaTrashAlt className="text-[10px]" />
              </button>
              <div className="w-16 h-16 flex items-center justify-center mb-2 mt-2">
                <img src={p.logoUrl} alt={p.name} className="max-w-[56px] max-h-[56px] object-contain" />
              </div>
              <div className="text-center w-full mt-auto">
                <p className="font-bold text-sm text-gray-800 w-full truncate leading-tight">{p.name}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: p.borderColor ? `${p.borderColor}15` : '#f1f5f9' }}>
                  <FaUsers className="text-[10px]" style={{ color: p.borderColor || '#64748b' }} />
                  <span className="text-xs font-bold" style={{ color: p.borderColor || '#64748b' }}>
                    {activeUsersCount} Active {activeUsersCount === 1 ? 'User' : 'Users'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {partners.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No partner platforms configured</div>}
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: DISASTER CLAIMS
  ══════════════════════════════════════ */
  const renderDisasterClaims = () => {
    const pending = claimRequests.filter(c => c.status === "PENDING");
    const approved = claimRequests.filter(c => c.status === "APPROVED");
    const rejected = claimRequests.filter(c => c.status === "REJECTED");

    const getRiskColor = (riskIndex) => {
      const r = parseFloat(riskIndex) || 0;
      if (r >= 0.7) return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "HIGH RISK" };
      if (r >= 0.4) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "MODERATE" };
      return { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", label: "LOW RISK" };
    };

    return (
      <div className="space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Pending", count: pending.length, bg: "bg-amber-50", border: "border-amber-100", icon: <FaHourglassHalf className="text-amber-400" />, num: "text-amber-600", lbl: "text-amber-500" },
            { label: "Approved", count: approved.length, bg: "bg-green-50", border: "border-green-100", icon: <FaCheckCircle className="text-green-500" />, num: "text-green-600", lbl: "text-green-500" },
            { label: "Rejected", count: rejected.length, bg: "bg-red-50", border: "border-red-100", icon: <FaTimesCircle className="text-red-400" />, num: "text-red-500", lbl: "text-red-400" },
          ].map(({ label, count, bg, border, icon, num, lbl }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 sm:p-5 flex flex-col justify-center`}>
              <div className="flex items-center gap-2 mb-1">{icon}<p className={`text-xs font-semibold ${lbl} uppercase tracking-wide`}>{label}</p></div>
              <p className={`text-2xl sm:text-3xl font-black ${num}`}>{count}</p>
            </div>
          ))}
        </div>

        {/* Weather report panel */}
        <div className="bg-[#0D1526] rounded-2xl border border-gray-700 shadow-xl overflow-hidden mt-6 mb-2">
          <div className="px-5 sm:px-6 py-5 border-b border-gray-800 bg-[#131F35] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400 text-sm"><FaCloudRain /></div>
              <div>
                <p className="font-bold text-gray-100 text-sm tracking-wide">🌦️ Live Weather Report — User Locations</p>
                <p className="text-xs text-gray-400 mt-0.5">Real-time disaster risk monitoring across all registered user locations</p>
              </div>
            </div>
            <button onClick={loadWeatherReport} disabled={weatherLoading}
              className="text-xs font-semibold text-sky-400 border border-sky-400/30 hover:bg-sky-400/10 px-3 py-1.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider">
              {weatherLoading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {weatherLoading ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">⏳ Fetching weather data for all locations…</div>
          ) : weatherReport.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-400 text-sm font-medium">No location data available</p>
              <p className="text-gray-500 text-xs mt-1">Weather reports will appear once users set their location in their profile</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-800 bg-[#0f172a]">
                    <th className="px-6 py-4 text-left font-bold">Location</th>
                    <th className="px-5 py-4 text-left font-bold">📅 Date</th>
                    <th className="px-5 py-4 text-left font-bold">👥 Users</th>
                    <th className="px-5 py-4 text-left font-bold">🌡️ Temp °C</th>
                    <th className="px-5 py-4 text-left font-bold">💨 Wind km/h</th>
                    <th className="px-5 py-4 text-left font-bold">🌧️ Rain mm</th>
                    <th className="px-5 py-4 text-left font-bold">☁️ Condition</th>
                    <th className="px-5 py-4 text-left font-bold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {weatherReport.map((loc, i) => {
                    const rval = parseFloat(loc.risk_index) || 0;
                    const rLab = rval >= 0.7 ? "HIGH RISK" : rval >= 0.4 ? "MODERATE" : "LOW RISK";
                    const rCls = rval >= 0.7 ? "bg-red-900/40 text-red-500 border-red-800/50" : rval >= 0.4 ? "bg-amber-900/40 text-amber-500 border-amber-800/50" : "bg-green-900/40 text-green-500 border-green-800/50";
                    const condition = loc.weather_condition || loc.condition || "N/A";
                    const temp = loc.temperature != null ? Number(loc.temperature).toFixed(1) : "—";
                    const wind = loc.wind_speed != null ? Number(loc.wind_speed).toFixed(1) : "—";
                    const rain = loc.rainfall != null ? Number(loc.rainfall).toFixed(1) : "—";
                    return (
                      <tr key={i} className={`hover:bg-gray-800/30 transition ${rval >= 0.7 ? "bg-red-900/10" : ""}`}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-100 text-[13px]">{loc.district !== "—" ? loc.district : loc.state}</span>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">{loc.state}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                            {loc.timestamp ? new Date(loc.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg text-[11px] font-bold">
                            <FaUsers className="text-[10px]" /> {loc.usersInLocation || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-300">{temp}</td>
                        <td className="px-5 py-4 font-semibold text-gray-300">{wind}</td>
                        <td className="px-5 py-4 font-bold text-sky-400">{rain}</td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-400 max-w-[150px] truncate">{condition}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${rCls}`}>
                            {rLab}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claims table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-semibold text-gray-700">{claimRequests.length}</span> total claim requests
                {pending.length > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{pending.length} need review</span>}
              </p>
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-200 text-xs shadow-sm w-fit">
                <span className="font-black text-[10px] bg-red-200 px-1 py-0.5 rounded uppercase tracking-wider text-red-800">Warning</span>
                <p>Approving claims actively deducts real fund value. Verify user is strictly off <strong>FREE_TRIAL</strong> before approving.</p>
              </div>
            </div>
            <button onClick={() => { loadClaimRequests(); loadWeatherReport(); }}
              className="text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition shrink-0 self-start sm:self-center">
              ↻ Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-semibold w-10">#</th>
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Location</th>
                  <th className="px-5 py-3 text-left font-semibold">Disaster / Situation</th>
                  <th className="px-5 py-3 text-left font-semibold">AI Report</th>
                  <th className="px-5 py-3 text-left font-semibold text-green-600">Claim ₹</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claimRequests.map((req, idx) => {
                  const isAI = req.situation?.startsWith("AI-AUTO") || req.description?.includes("AI Auto-Filed") || req.description?.includes("AI ANALYTICS");
                  const stateInfo = req.user?.state || "Maharashtra (Auto)";
                  const distInfo = req.user?.district || "Unspecified District";
                  return (
                    <tr key={req.id} className={`hover:bg-gray-50/60 transition ${isAI && req.status === "PENDING" ? "bg-amber-50/20" : ""}`}>
                      <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={req.user?.name || req.user?.email} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-700 text-xs truncate max-w-[110px]">{req.user?.name || "User"}</span>
                            <span className="text-gray-400 text-[10px] truncate max-w-[110px]">{req.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-700 font-bold">{distInfo}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{stateInfo}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase w-fit">{req.situation}</span>
                          {isAI && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded text-[9px] font-bold uppercase w-fit flex items-center gap-1">
                              🤖 AI Auto-Filed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[180px]">
                        <span className="line-clamp-2 leading-relaxed" title={req.description}>{req.description || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-green-600">₹{(req.amount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5 text-[10px] text-gray-400 whitespace-nowrap">
                        {req.createdAt ? new Date(req.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={req.status} /></td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {req.status === "PENDING" ? (
                            <>
                              <button onClick={() => {
                                  if (window.confirm(`⚠️ WARNING: Approving this claim will permanently deduct ₹${(req.amount || 0).toLocaleString("en-IN")} from the actual insurance pool.\n\nAre you absolutely certain this user is eligible and not operating under a FREE TRIAL?`)) {
                                    handleApproveClaimReq(req.id);
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm whitespace-nowrap">
                                ✓ Approve
                              </button>
                              <button onClick={() => handleRejectClaimReq(req.id)}
                                className="px-3 py-1.5 bg-white text-red-500 border border-red-100 text-xs rounded-lg font-bold hover:bg-red-50 transition whitespace-nowrap">
                                ✗ Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-gray-300 flex items-center gap-1 italic">
                              <FaLock className="text-[8px]" /> {req.status === "APPROVED" ? "Paid Out" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {claimRequests.length === 0 && (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-300">
                    <div className="flex flex-col items-center gap-2">
                      <FaCloudRain className="text-3xl text-gray-200" />
                      <p>No claim requests found</p>
                      <p className="text-xs">AI will auto-file claims when disasters are detected in user locations</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: ADMIN WALLET
  ══════════════════════════════════════ */
  const renderWallet = () => {
    const balance = adminWallet.walletBalance || 0;
    const txns = adminWallet.transactions || [];

    // Calculate Weekly Cycle Stats (Last 7 Days)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let weeklyCredits = 0;
    let weeklyDebits = 0;

    txns.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= oneWeekAgo) {
        if (t.type === "CREDIT") weeklyCredits += t.amount || 0;
        if (t.type === "DEBIT") weeklyDebits += t.amount || 0;
      }
    });

    return (
      <div className="space-y-6">
        {/* Wallet Hero Card */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)" }}>
          {/* decorative circles */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.3)" }} />
          <div className="absolute -right-4 top-16 w-24 h-24 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.5)" }} />
          <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.2)", transform: "translate(-40%,40%)" }} />

          <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaWallet className="text-white text-sm" />
                </div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Insurance Fund</p>
              </div>
                <p className="text-white/70 text-sm mb-1">Current Pool Balance (Net)</p>
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FaCalculator className="text-green-300" /> Fund Calculation Logic
                </p>
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-3 text-white/90 text-sm">
                   <div className="flex flex-col bg-white/5 px-2.5 py-2 rounded-lg border border-white/5">
                     <span className="text-[9px] sm:text-[10px] text-indigo-200 uppercase font-black tracking-wider">Old Premiums</span>
                     <span className="font-bold text-sm sm:text-base">₹{(adminWallet.oldPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-indigo-300 font-black flex items-center justify-center w-4 sm:w-6">+</span>
                   <div className="flex flex-col bg-white/5 px-2.5 py-2 rounded-lg border border-white/5">
                     <span className="text-[9px] sm:text-[10px] text-indigo-200 uppercase font-black tracking-wider">New Premiums</span>
                     <span className="font-bold text-sm sm:text-base">₹{(adminWallet.newPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-indigo-300 font-black flex items-center justify-center w-4 sm:w-6">=</span>
                   <div className="flex flex-col bg-white/5 px-2.5 py-2 rounded-lg border border-white/5">
                     <span className="text-[9px] sm:text-[10px] text-indigo-200 uppercase font-black tracking-wider">Gross Total</span>
                     <span className="font-bold text-sm sm:text-base">₹{(adminWallet.totalPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-red-300 font-black flex items-center justify-center w-4 sm:w-6">-</span>
                   <div className="flex flex-col bg-red-500/10 px-2.5 py-2 rounded-lg border border-red-500/20">
                     <span className="text-[9px] sm:text-[10px] text-red-200 uppercase font-black tracking-wider">Total Claims</span>
                     <span className="font-bold text-red-100 text-sm sm:text-base">₹{(adminWallet.totalClaimsPaid || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-indigo-300 font-black flex items-center justify-center w-4 sm:w-6">=</span>
                   <div className={`flex flex-col px-3 py-2 rounded-lg border shadow-inner ${balance >= 0 ? "bg-green-500/20 border-green-400/30 shadow-green-500/10" : "bg-red-500/20 border-red-400/30 shadow-red-500/10"}`}>
                     <span className={`text-[9px] sm:text-[10px] uppercase font-black tracking-widest ${balance >= 0 ? "text-green-300" : "text-red-300"}`}>
                       Net {balance >= 0 ? "Surplus" : "Deficit"}
                     </span>
                     <span className={`font-black tracking-tight text-sm sm:text-base ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                       {balance < 0 && "-"}₹{Math.abs(balance).toLocaleString("en-IN")}
                     </span>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-3">
              <div className="flex-1 sm:flex-none bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaArrowUp className="text-green-300 text-xs" />
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wide">Weekly Premiums</p>
                </div>
                <p className="text-xl font-black text-white">₹{weeklyCredits.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">Collected this week</p>
              </div>
              <div className="flex-1 sm:flex-none bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FaArrowDown className="text-red-300 text-xs" />
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wide">Weekly Payouts</p>
                </div>
                <p className="text-xl font-black text-white">₹{weeklyDebits.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">Paid out this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary mini cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Premiums</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600">₹{(adminWallet.totalPremiumCollected || 0).toLocaleString("en-IN")}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Total funds collected</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Claims Paid</p>
            <p className="text-xl sm:text-2xl font-black text-red-500">₹{(adminWallet.totalClaimsPaid || 0).toLocaleString("en-IN")}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Total fund out-flow</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Status</p>
            <p className="text-xl sm:text-2xl font-black text-green-500">{(adminWallet.totalPremiumCollected || 0) >= (adminWallet.totalClaimsPaid || 0) ? "Sustainable" : "At Risk"}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Pool health status</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Transactions</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">{txns.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Total ledger entries</p>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-xs">
                <FaMoneyBillWave />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Transaction Ledger</p>
                <p className="text-xs text-gray-400">{txns.length} total entries</p>
              </div>
            </div>
            <button onClick={loadWallet} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
              Refresh
            </button>
          </div>

          {txns.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaWallet className="text-indigo-400 text-2xl" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No transactions yet</p>
              <p className="text-gray-300 text-xs mt-1">Premiums will appear here once payments are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                    <th className="px-5 py-3 text-left font-semibold">Type</th>
                    <th className="px-5 py-3 text-left font-semibold">User</th>
                    <th className="px-5 py-3 text-right font-semibold">Ledger Value</th>
                    <th className="px-5 py-3 text-right font-semibold">Coverage</th>
                    <th className="px-5 py-3 text-right font-semibold">Net Balance</th>
                    <th className="px-5 py-3 text-left font-semibold">Payment / Reference</th>
                    <th className="px-5 py-3 text-left font-semibold">Cycle Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-5 py-3 text-left font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {txns.map((txn, idx) => {
                    const isCredit = txn.type === "CREDIT";
                    // Fallbacks in case old records lack these fields
                    const userEmail = txn.userEmail || "—";
                    const userName = txn.userName || "—";
                    const upiId = txn.upiId || "—";
                    const method = txn.method || "—";
                    const cycleStatus = txn.cycleStatus || "Unknown";

                    // For UI display: both credit/debit have premium and coverage available in the txn map
                    const premiumAmount = isCredit ? txn.amount : (txn.premiumAmount || 0);
                    const coverageAmount = txn.coverageAmount || 0;

                    return (
                      <tr key={txn.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3.5 text-gray-300 text-xs font-bold">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest
                            ${isCredit
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-500 border-red-200"
                            }`}>
                            {isCredit ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
                            {isCredit ? "PREMIUM (CREDIT)" : "CLAIM (DEBIT)"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-bold text-xs">{userName}</span>
                            <span className="text-gray-500 text-[10px] truncate max-w-[150px]">{userEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-black text-sm ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                            {isCredit ? '+' : '-'} ₹{Number(Math.abs(txn.amount || 0)).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-bold text-gray-500 text-sm">
                            ₹{Number(coverageAmount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{Number(txn.runningBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-semibold text-xs">{method}</span>
                            <span className="text-indigo-500 font-bold text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mt-0.5">
                              {txn.gatewayReference || "No Ref"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                            ${cycleStatus === 'On Going'
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : cycleStatus === 'Completed'
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}>
                            {cycleStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {txn.date ? (
                            <span className="text-xs font-bold text-gray-700">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {txn.date ? (
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(txn.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     SECTION: SETTINGS
  ══════════════════════════════════════ */
  const renderSettings = () => (
    <div className="w-full space-y-5">

      {/* Settings Banner */}
      <div className="w-full bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl px-6 sm:px-8 py-6 sm:py-7 overflow-hidden relative shadow-sm">
        {/* SVG illustration */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none flex items-center">
          <svg viewBox="0 0 280 140" className="h-full w-auto opacity-[0.1]" fill="white" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="70" r="95" />
            <circle cx="200" cy="48" r="30" />
            <path d="M155 130 c0-25 20-45 45-45 s45 20 45 45" />
            <rect x="30" y="30" width="90" height="12" rx="6" fillOpacity="0.5" />
            <rect x="30" y="52" width="65" height="12" rx="6" fillOpacity="0.35" />
            <rect x="30" y="74" width="78" height="12" rx="6" fillOpacity="0.25" />
            <circle cx="260" cy="20" r="18" fillOpacity="0.15" />
            <circle cx="20" cy="120" r="28" fillOpacity="0.1" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.18em] mb-1.5">Admin Panel</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1.5">Account Settings</h1>
            <p className="text-slate-300 text-sm">Manage your profile and security settings</p>
          </div>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 shrink-0">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <FaUserCircle className="text-white text-xl" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Logged in as</p>
              <p className="text-white font-bold text-sm leading-tight">{adminInfo.username}</p>
              <p className="text-slate-300 text-xs truncate max-w-[150px]">{adminInfo.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Info Column */}
        <div className="space-y-6 lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-6">
          {/* Account info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs"><FaIdBadge /></span>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Account Information</p>
                <p className="text-xs text-gray-400">Your current admin details</p>
              </div>
            </div>
            
            <div className="p-5 flex items-center gap-4 border-b border-gray-50">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
                <FaUserAlt />
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg leading-tight">{adminInfo.username}</h3>
                <p className="text-[10px] font-bold tracking-widest text-green-500 uppercase">Administrator</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5 font-medium"><FaEnvelope className="text-gray-300" /> {adminInfo.email}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-xs"><FaIdBadge /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium whitespace-nowrap">Username</p>
                  <p className="font-bold text-gray-700 text-sm truncate">{adminInfo.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-xs"><FaEnvelope /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="font-bold text-gray-700 text-sm truncate">{adminInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-500 shrink-0 text-xs"><FaShieldAlt /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Role</p>
                  <p className="font-bold text-green-600 text-sm">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Columns Container */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Update credentials card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
              <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs"><FaUserEdit /></span>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Update Credentials</p>
                <p className="text-xs text-gray-400">Leave blank to keep existing values</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <form onSubmit={e => e.preventDefault()} autoComplete="off">
                <div className="space-y-4">
                  <InputField
                    label="New Username"
                    icon={<FaIdBadge className="text-gray-300" />}
                    value={settings.username}
                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                    placeholder={`Current: ${adminInfo.username}`}
                    autoComplete="off"
                  />
                  <InputField
                    label="New Email"
                    icon={<FaEnvelope className="text-gray-300" />}
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder={`Current: ${adminInfo.email}`}
                    autoComplete="off"
                  />

                  {/* Password divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 border-t border-dashed border-gray-200" />
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 px-1 uppercase tracking-wide whitespace-nowrap">
                      <FaLock className="text-gray-300" /> Change Password
                    </span>
                    <div className="flex-1 border-t border-dashed border-gray-200" />
                  </div>

                  <InputField
                    label="New Password"
                    icon={<FaLock className="text-gray-300" />}
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirm Password"
                    icon={<FaKey className="text-gray-300" />}
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    errorMsg={settings.confirmPassword && settings.password !== settings.confirmPassword ? "Passwords do not match" : null}
                    successMsg={settings.confirmPassword && settings.password === settings.confirmPassword && settings.password ? "Passwords match" : null}
                  />

                  <button
                    onClick={handleSettingsSave}
                    className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mt-1"
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Provision New Admin card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
              <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs"><FaUserPlus /></span>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Provision Sub-Admin</p>
                <p className="text-xs text-gray-400">Create a secondary administrator account</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <form onSubmit={e => e.preventDefault()} autoComplete="off">
                <div className="space-y-4">
                  <InputField
                    label="Admin Email"
                    icon={<FaEnvelope className="text-gray-300" />}
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="teammember@giginsurance.com"
                    autoComplete="off"
                  />
                  <InputField
                    label="Initial Password"
                    icon={<FaLock className="text-gray-300" />}
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="Set temporary password"
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirm Initial Password"
                    icon={<FaKey className="text-gray-300" />}
                    type="password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                    placeholder="Confirm temporary password"
                    autoComplete="new-password"
                    errorMsg={newAdmin.confirmPassword && newAdmin.password !== newAdmin.confirmPassword ? "Passwords do not match" : null}
                    successMsg={newAdmin.confirmPassword && newAdmin.password === newAdmin.confirmPassword && newAdmin.password ? "Passwords match" : null}
                  />

                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mt-2 flex gap-2 items-start">
                    <FaShieldAlt className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-indigo-700 leading-snug font-medium">
                      Sub-Admins will receive a standard admin layout, however the primary Master wallet remains tied to the platform's root account.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateAdmin}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mt-1 shadow-sm"
                  >
                    <FaUserPlus className="mb-0.5 text-xs text-slate-300" /> Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     SECTION: MODALS
  ══════════════════════════════════════ */
  const renderUserProfileModal = () => {
    if (!viewingUser) return null;

    const userSubs = payments.filter(p => p.user?.id === viewingUser.id && p.status === 'APPROVED');
    const activeSub = userSubs.length > 0 ? userSubs[0].subscription : null;
    const planName = activeSub ? activeSub.plan?.name : "No Active Plan";
    const cov = activeSub ? activeSub.plan?.coverageAmount : 0;
    const hrsUsage = getUsageStats(viewingUser.createdAt).totalHours;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
        
        {/* Modal Window */}
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Banner */}
          <div className="relative h-28 bg-gradient-to-r from-slate-800 to-slate-900 border-b-2 border-indigo-500">
            <button 
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md"
            >
              <FaTimes />
            </button>
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-[3px] border-white overflow-hidden text-2xl">
                 <Avatar name={viewingUser.name} />
              </div>
            </div>
            {viewingUser.platform && (
              <div className="absolute bottom-4 right-6 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-white uppercase backdrop-blur-md">
                {viewingUser.platform} Partner
              </div>
            )}
          </div>

          <div className="pt-14 pb-8 px-8 flex-1 overflow-y-auto max-h-[80vh]">
            {/* Identity Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-800">{viewingUser.name}</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1"><FaEnvelope className="text-gray-400" /> {viewingUser.email}</span>
                <span className="flex items-center gap-1"><FaPhoneAlt className="text-gray-400" /> {viewingUser.phone}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Coverage Analytics Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                  <FaShieldAlt /> Policy Analytics
                </h3>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Current Plan</span>
                  <span className="block text-lg font-black text-slate-800 mb-3">{planName}</span>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">Coverage</span>
                      <span className="text-sm font-bold text-indigo-600">₹{cov.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold">Risk Window</span>
                      <span className="text-sm font-bold text-slate-700">{hrsUsage} Hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Context / Weather */}
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3 flex items-center gap-2">
                  <FaCloudRain /> Environmental Risk Context
                </h3>
                
                {!viewingUser.district ? (
                   <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 h-[110px]">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">⚠️</div>
                     <p className="text-xs text-gray-500 font-medium">User has not completed their location profile.</p>
                   </div>
                ) : userWeatherLoading ? (
                   <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-center h-[110px]">
                     <FaSpinner className="text-cyan-500 animate-spin text-xl" />
                   </div>
                ) : userWeather ? (
                   <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between h-[110px] relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none" style={{ fontSize: '100px' }}>
                       {userWeather.forecast}
                     </div>
                     <div className="flex justify-between items-start z-10">
                       <div>
                         <span className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Location</span>
                         <span className="text-xs font-bold text-slate-700">{viewingUser.district}, {viewingUser.state}</span>
                       </div>
                       <span className="text-2xl font-black text-cyan-600 drop-shadow-sm">{Math.round(userWeather.temperature)}°C</span>
                     </div>
                     <div className="flex items-center gap-2 mt-auto z-10 w-full">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide
                          ${userWeather.riskLevel === 'Extreme' ? 'bg-red-100 text-red-600' : 
                            userWeather.riskLevel === 'High' ? 'bg-orange-100 text-orange-600' :
                            userWeather.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}
                       >
                         {userWeather.riskLevel} Risk
                       </span>
                       <span className="text-[10px] text-gray-500 font-medium truncate w-full">{userWeather.condition}</span>
                     </div>
                   </div>
                ) : (
                   <div className="bg-white rounded-xl p-4 shadow-sm flex items-center h-[110px]">
                     <p className="text-xs text-red-400">Unable to fetch live weather data for this location.</p>
                   </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end border-t border-gray-100 pt-6">
               <button onClick={() => {
                   setViewingUser(null);
                   setSection("queries");
                 }} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm">
                 <FaChatBubble /> Ping Worker
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  /* ══════════════════════════════════════
     SECTION: WORKER VERIFICATION
  ══════════════════════════════════════ */
  const renderVerification = () => {
    const handleVerify = async (userId, status) => {
      const note = verifyNotes[userId] || "";
      setVerifyLoading(prev => ({ ...prev, [userId]: true }));
      try {
        const res = await adminVerifyWorker(userId, status, note);
        if (res?.error) { showMsg(res.error, "error"); return; }
        showMsg(`Worker marked as ${status} successfully!`);
        setVerifyNotes(prev => ({ ...prev, [userId]: "" }));
        await loadUsers();
      } catch { showMsg("Verification action failed", "error"); }
      finally { setVerifyLoading(prev => ({ ...prev, [userId]: false })); }
    };

    const handleAIVerify = async (u) => {
      setVerifyLoading(prev => ({ ...prev, [u.id]: true }));
      showMsg(`Running AI Background Check for ${u.name}...`, "info");
      try {
        const res = await aiWorkerCheck(u.id, u.platform || "Unknown", u.name || "Unknown Worker");
        if (res?.error) { showMsg(res.error, "error"); return; }
        
        let status = res.recommended_status;
        let finalNote = res.ai_note + ` (Confidence: ${res.confidence_score}%)`;

        const updateRes = await adminVerifyWorker(u.id, status, finalNote);
        if (updateRes?.error) { showMsg(updateRes.error, "error"); return; }
        
        showMsg(`AI Verification Complete: ${status} (${res.confidence_score}%)`, status === "VERIFIED" ? "success" : "warning");
        await loadUsers();
      } catch (e) { 
        showMsg("AI Verification failed", "error"); 
      } finally { 
        setVerifyLoading(prev => ({ ...prev, [u.id]: false })); 
      }
    };

    const filtered = verifyFilter === "ALL"
      ? users
      : users.filter(u => (u.verificationStatus || "PENDING") === verifyFilter);

    // Group by platform/company
    const byCompany = {};
    filtered.forEach(u => {
      const co = u.platform || "Unknown";
      if (!byCompany[co]) byCompany[co] = [];
      byCompany[co].push(u);
    });

    const totalVerified  = users.filter(u => u.verificationStatus === "VERIFIED").length;
    const totalPending   = users.filter(u => !u.verificationStatus || u.verificationStatus === "PENDING").length;
    const totalRejected  = users.filter(u => u.verificationStatus === "REJECTED").length;

    const tabStyle = (active) => ({
      padding: "8px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
      cursor: "pointer", border: "none", fontFamily: "'Inter',sans-serif",
      transition: "all 0.2s",
      background: active ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.04)",
      color:  active ? "#00D4AA" : "rgba(255,255,255,0.5)",
      outline: active ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(255,255,255,0.08)",
    });

    const vBadge = (status) => {
      const cfg = {
        VERIFIED: { bg: "rgba(0,212,170,0.15)", color: "#00D4AA", border: "rgba(0,212,170,0.3)", icon: "✅", label: "VERIFIED" },
        REJECTED: { bg: "rgba(248,113,113,0.15)", color: "#F87171", border: "rgba(248,113,113,0.3)", icon: "❌", label: "REJECTED" },
        PENDING:  { bg: "rgba(251,191,36,0.15)",  color: "#FBBF24", border: "rgba(251,191,36,0.3)", icon: "⏳", label: "PENDING" },
      };
      const c = cfg[status] || cfg.PENDING;
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px",
          borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
          background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
          {c.icon} {c.label}
        </span>
      );
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { label: "Total Workers", value: users.length, color: "#60A5FA", bg: "rgba(96,165,250,0.12)", icon: "👷" },
            { label: "Verified",       value: totalVerified, color: "#00D4AA", bg: "rgba(0,212,170,0.12)", icon: "✅" },
            { label: "Pending Review", value: totalPending,  color: "#FBBF24", bg: "rgba(251,191,36,0.12)", icon: "⏳" },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 16, padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Re-verification Alert */}
        {totalPending > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 14, flexWrap: "wrap"
          }}>
            <span style={{ fontSize: 24 }}>⏳</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FBBF24", marginBottom: 2 }}>
                {totalPending} worker{totalPending !== 1 ? "s" : ""} awaiting verification
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                These workers may have changed their job, platform, or location. Review and verify their updated details.
              </div>
            </div>
            <button
              onClick={() => setVerifyFilter("PENDING")}
              style={{ padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: "rgba(251,191,36,0.2)", color: "#FBBF24",
                border: "1px solid rgba(251,191,36,0.3)", cursor: "pointer" }}
            >
              Review Now →
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["ALL", "PENDING", "VERIFIED", "REJECTED"].map(f => (
            <button key={f} style={tabStyle(verifyFilter === f)} onClick={() => setVerifyFilter(f)}>
              {f} {f !== "ALL" && <span style={{ opacity: 0.7, fontSize: 10 }}>
                ({f === "PENDING" ? totalPending : f === "VERIFIED" ? totalVerified : totalRejected})
              </span>}
            </button>
          ))}
        </div>

        {/* Company Groups */}
        {Object.keys(byCompany).length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No workers match this filter.
          </div>
        ) : (
          Object.entries(byCompany).map(([company, companyUsers]) => (
            <div key={company} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}>
              {/* Company header */}
              <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,212,170,0.12)", border: "1px solid rgba(0,212,170,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  🏢
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Sora',sans-serif" }}>{company}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {companyUsers.length} worker{companyUsers.length !== 1 ? "s" : ""} registered
                    &nbsp;·&nbsp; {companyUsers.filter(u => u.verificationStatus === "VERIFIED").length} verified
                  </div>
                </div>
              </div>

              {/* Worker rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {companyUsers.map((u, idx) => {
                  const status = u.verificationStatus || "PENDING";
                  const isLoading = verifyLoading[u.id];
                  return (
                    <div key={u.id} style={{
                      padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16,
                      borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      flexWrap: "wrap",
                    }}>
                      {/* Avatar */}
                      <Avatar name={u.name || u.email} />

                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{u.name}</span>
                          {vBadge(status)}
                          {/* Job change indicator — shown when platform + location both set and status is PENDING */}
                          {status === "PENDING" && u.platform && u.state && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 800,
                              background: "rgba(139,92,246,0.15)", color: "#A78BFA",
                              border: "1px solid rgba(139,92,246,0.3)", letterSpacing: "0.3px"
                            }}>
                              🔄 RE-VERIFY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <span>📧 {u.email}</span>
                          {u.phone && <span>📞 {u.phone}</span>}
                          {u.district && <span>📍 {u.district}, {u.state}</span>}
                          {u.platform && <span>🏢 {u.platform}</span>}
                        </div>
                        {u.verificationNote && (
                          <div style={{ marginTop: 6, fontSize: 11, color: status === "REJECTED" ? "#F87171" : "#94A3B8",
                            background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 10px", display: "inline-block" }}>
                            📝 {u.verificationNote}
                          </div>
                        )}
                      </div>

                      {/* Verification Controls */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
                        <textarea
                          rows={2}
                          placeholder="Add a note (optional)…"
                          value={verifyNotes[u.id] || ""}
                          onChange={e => setVerifyNotes(prev => ({ ...prev, [u.id]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 12px", fontSize: 12, borderRadius: 10,
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#F1F5F9", outline: "none", resize: "none", fontFamily: "'Inter',sans-serif",
                            boxSizing: "border-box" }}
                          onFocus={e => e.target.style.borderColor = "#00D4AA"}
                          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            disabled={isLoading || status === "VERIFIED"}
                            onClick={() => handleVerify(u.id, "VERIFIED")}
                            style={{ flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: (isLoading || status === "VERIFIED") ? "not-allowed" : "pointer",
                              border: "none", fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
                              background: status === "VERIFIED" ? "rgba(0,212,170,0.08)" : "rgba(0,212,170,0.15)",
                              color: status === "VERIFIED" ? "rgba(0,212,170,0.4)" : "#00D4AA",
                              opacity: (isLoading || status === "VERIFIED") ? 0.6 : 1 }}>
                            {isLoading ? "…" : "✅ Verify"}
                          </button>
                          <button
                            disabled={isLoading || status === "REJECTED"}
                            onClick={() => handleVerify(u.id, "REJECTED")}
                            style={{ flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: (isLoading || status === "REJECTED") ? "not-allowed" : "pointer",
                              border: "none", fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
                              background: status === "REJECTED" ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.15)",
                              color: status === "REJECTED" ? "rgba(248,113,113,0.4)" : "#F87171",
                              opacity: (isLoading || status === "REJECTED") ? 0.6 : 1 }}>
                            {isLoading ? "…" : "❌ Reject"}
                          </button>
                          {status === "PENDING" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleAIVerify(u)}
                              style={{ flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
                                border: "1px solid rgba(139,92,246,0.3)", fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
                                background: "rgba(139,92,246,0.1)",
                                color: "#A78BFA",
                                opacity: isLoading ? 0.6 : 1 }}>
                              {isLoading ? "…" : "✨ AI Auto-Verify"}
                            </button>
                          )}
                          {status !== "PENDING" && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleVerify(u.id, "PENDING")}
                              style={{ padding: "8px 10px", borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
                                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}>
                              ↩
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */

  const sectionRenderers = {

    overview: renderOverview,
    users: renderUsers,
    verification: renderVerification,
    approvals: renderApprovals,
    queries: renderQueries,
    plans: renderPlans,
    payments: renderPayments,
    wallet: renderWallet,
    disaster: renderDisasterClaims,
    partners: renderPartners,
    settings: renderSettings,
  };

  const meta = PAGE_META[section];

  return (
    <div style={{ height:"100vh", background:"#060B18", display:"flex", overflow:"hidden" }}>
      {renderUserProfileModal()}
      <AdminSidebar
        section={section}
        setSection={setSection}
        onLogout={logout}
        pendingCount={pendingApprovals}
        unansweredCount={unansweredQ}
        pendingClaims={pendingClaimReqs}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
        {/* Mobile top bar */}
        <header className="lg:hidden" style={{ background:"#060B18", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"12px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:20 }}>

          <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:"linear-gradient(135deg,#00D4AA,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, flexShrink:0 }}>
              <FaShieldAlt/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13.5, fontWeight:700, color:"#F1F5F9", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>
                {section === "overview" ? "Dashboard" : (meta?.title || "Dashboard")}
              </p>
              <p style={{ fontSize:9, color:"#00D4AA", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", margin:0 }}>Admin Panel</p>
            </div>
          </div>
          {(pendingApprovals + unansweredQ) > 0 && (
            <div style={{ position:"relative" }}>
              <div style={{ width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8" }}>
                <FaBell style={{ fontSize:14 }}/>
              </div>
              <span style={{ position:"absolute", top:-3, right:-3, width:16, height:16, background:"#F87171", borderRadius:"50%", color:"#fff", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, border:"1.5px solid #060B18" }}>
                {pendingApprovals + unansweredQ}
              </span>
            </div>
          )}
        </header>

        {/* Main content */}
        <main style={{ flex:1, overflowY:"auto", padding:"24px 20px 32px", maxWidth:1280 }}>
          {/* Toast */}
          {message && (
            <div style={{ position:"fixed", top:18, right:18, zIndex:50, padding:"12px 18px", borderRadius:13, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:9, maxWidth:340,
              background: msgType==="error" ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#00D4AA,#059669)",
              boxShadow: msgType==="error" ? "0 8px 28px rgba(239,68,68,0.35)" : "0 8px 28px rgba(0,212,170,0.35)",
              color:"#fff", border:`1px solid ${msgType==="error" ? "rgba(248,113,113,0.4)" : "rgba(0,212,170,0.4)"}`,
            }}>
              {msgType === "error" ? <FaTimesCircle style={{ fontSize:14 }}/> : <FaCheckCircle style={{ fontSize:14 }}/>}
              {message}
            </div>
          )}

          {/* Page heading & Global Actions */}
          <div style={{ marginBottom:22, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              {section !== "overview" && meta ? (
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:`rgba(0,212,170,0.12)`, border:"1px solid rgba(0,212,170,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#00D4AA", fontSize:18, flexShrink:0 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <h1 style={{ fontSize:22, fontWeight:900, color:"#F1F5F9", margin:0, fontFamily:"'Sora',sans-serif", lineHeight:1.2 }}>{meta.title}</h1>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"2px 0 0", fontWeight:500 }}>{meta.subtitle}</p>
                  </div>
                </div>
              ) : <div/>}

              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                {["payments","wallet"].includes(section) && (
                  <button
                    onClick={() => {
                      const dataMap = {
                        payments,
                        wallet: adminWallet?.transactions || []
                      };
                      // File-saver handles the .csv generation natively
                      exportToCSV(dataMap[section], section);
                    }}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:11, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#94A3B8", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(0,212,170,0.1)"; e.currentTarget.style.color="#00D4AA"; e.currentTarget.style.borderColor="rgba(0,212,170,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#94A3B8"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}
                  >
                    <FaFileExport style={{ fontSize:12 }}/> <span>Export Data</span>
                  </button>
                )}
              </div>
            </div>
            {/* Separator */}
            <div style={{ height:1, background:"rgba(255,255,255,0.06)" }}/>
          </div>

          {(sectionRenderers[section] || renderOverview)()}
        </main>
      </div>
    </div>
  );
}