import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  adminListClaimRequests,
  adminApproveClaimRequest,
  adminRejectClaimRequest,
  adminGetWallet,
  adminCreatePlan,
  adminGetWeatherReport,
} from "../api";
import adminBanner from "../../../assets/adminbanner.png";
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
} from "react-icons/fa";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */

function ReplyForm({ onReply }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100">
      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <FaReply className="text-green-500" /> Write Reply
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onReply(text); setText(""); } }}
        rows={3}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white resize-none"
        placeholder="Type your answer here…"
      />
      <button
        onClick={() => { if (text.trim()) { onReply(text); setText(""); } }}
        className="mt-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
      >
        <FaReply className="text-xs" /> Send Reply
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor, iconColor, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all border border-gray-100">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgColor} rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</p>}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const map = {
    PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
    APPROVED: "bg-green-50 text-green-600 border border-green-200",
    REJECTED: "bg-red-50   text-red-500   border border-red-200",
  };
  const icons = { PENDING: <FaHourglassHalf />, APPROVED: <FaCheckCircle />, REJECTED: <FaTimesCircle /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {icons[status]} {status}
    </span>
  );
};

// Global styles for specific elements
const globalStyles = `
  .banner-content { bottom: 110px; }
  @media (max-width: 640px) { .banner-content { bottom: 75px; } }

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// Inject global styles once
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

function Avatar({ name }) {
  const str = name || "?";
  const initials = str.includes("@")
    ? str[0].toUpperCase()
    : str.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-400"];
  const color = colors[str.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function InputField({ label, icon, type = "text", value, onChange, placeholder, errorMsg, successMsg }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 focus:bg-white
            ${errorMsg ? "border-red-200 focus:ring-red-300 bg-red-50" : "border-gray-200 focus:ring-green-400"}`}
        />
      </div>
      {errorMsg && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FaTimesCircle /> {errorMsg}</p>}
      {successMsg && <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1"><FaCheckCircle /> {successMsg}</p>}
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

  const handleNav = (key) => {
    setSection(key);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-lg flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:shadow-sm lg:z-10
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow text-base">
              <FaShieldAlt />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Gig Insurance</p>
              <p className="text-xs font-semibold text-emerald-500 tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.group}</h3>
              <div className="space-y-0.5">
                {group.items.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNav(key)}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium
                      ${section === key
                        ? "bg-green-500 text-white shadow-md shadow-green-100"
                        : "text-gray-500 hover:bg-gray-50 hover:text-green-600"
                      }`}
                  >
                    <span className={`text-base shrink-0 transition-transform duration-200 ${section === key ? "" : "group-hover:scale-110"}`}>
                      {icon}
                    </span>
                    <span className="flex-1 text-left whitespace-nowrap">{label}</span>
                    {badges[key] > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[18px] text-center
                        ${section === key ? "bg-white/25 text-white" : "bg-red-500 text-white"}`}>
                        {badges[key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition text-sm font-medium"
          >
            <FaSignOutAlt className="text-base" /> Logout
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-300">© 2026 Gig Insurance · Admin v1.0</p>
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
  const [adminInfo, setAdminInfo] = useState({ email: "admin@giginsurance.com", username: "Admin" });
  const [settings, setSettings] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({ name: "", weeklyPremium: 0, coverageAmount: 0, trialDays: 7, riskLevel: "Moderate", features: "" });
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatText, setChatText] = useState("");
  const [replyMessageUser, setReplyMessageUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

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
    if (section === "users") loadUsers();
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

  const safeLoad = (fn, setter) => async () => {
    try {
      const res = await fn();
      if (res?.error) { navigate("/login"); return; }
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
    if(!window.confirm(`Are you sure you want to clear the chat for ${user.email}? This cannot be undone.`)) return;
    try {
      if (adminClearUserChat) await adminClearUserChat(user.id);
      setSelectedChatUser(null);
      await loadQueries();
      showMsg("Chat cleared for admin");
    } catch(e) { console.error(e); showMsg("Failed to clear chat", "error");}
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
      if (settings.email) setAdminInfo(p => ({ ...p, email: settings.email }));
      if (settings.username) setAdminInfo(p => ({ ...p, username: settings.username }));
      setSettings({ email: "", username: "", password: "", confirmPassword: "" });
    } catch { showMsg("Failed to update credentials", "error"); }
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

            <div className="inline-flex items-center gap-3 bg-black/30 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <FaBell className="text-white text-sm" />
              </div>
              <div>
                <p className="text-gray-300 text-xs">Pending tasks</p>
                <p className="text-2xl font-black text-white leading-none">{pendingApprovals + unansweredQ + pendingClaimReqs}</p>
              </div>
            </div>
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
              <th className="px-5 sm:px-6 py-3 text-left font-semibold">Address</th>
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
                  <td className="px-5 sm:px-6 py-3.5 text-xs text-gray-500">
                    {u.mandal || u.district || u.state ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-700">{u.mandal && `${u.mandal}, `}{u.district}</span>
                        <span className="text-[10px] uppercase tracking-wider">{u.state}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">No address</span>
                    )}
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-lg text-xs font-medium transition border border-red-100"
                    >
                      <FaTrashAlt className="text-[10px]" /> Delete
                    </button>
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
                    <td className="px-5 sm:px-6 py-3.5">
                      <span className="text-[10px] text-gray-400 font-medium italic">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"}</span>
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
      <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-2">
        {/* User List Sidebar */}
        <div className={`w-full sm:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 ${selectedChatUser ? "hidden sm:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active Support
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {usersWithQueries.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedChatUser(item.user)}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all border-b border-gray-50
                  ${activeUser?.id === item.id ? "bg-white shadow-sm ring-1 ring-inset ring-green-100" : "hover:bg-gray-100/50"}
                `}
              >
                <div className="relative">
                  <Avatar name={item.user?.name || item.user?.email} />
                  {item.hasUnanswered && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-1 leading-none mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.user?.name || "Anonymous"}</p>
                    <span className={`text-[9px] font-bold uppercase shrink-0 ${item.unreadCount > 0 ? "text-green-500" : "text-gray-400"}`}>
                      {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate font-medium flex-1 ${item.unreadCount > 0 ? "text-gray-700 font-bold" : "text-gray-400"}`}>
                      {item.lastMessage || "No message content"}
                    </p>
                    {item.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-green-500 text-white text-[10px] font-black rounded-full px-1 shadow-sm animate-bounce">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1 opacity-60">
                    <FaPhone className="text-[8px] text-green-600" />
                    <span className="text-[9px] text-green-700 font-black">{item.user?.phone || "—"}</span>
                  </div>
                </div>
                {/* Time removed from here as it's now in the name row */}
              </button>
            ))}
            {usersWithQueries.length === 0 && (
              <div className="p-12 text-center text-gray-300 text-sm italic">No active support chats</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedChatUser ? "hidden sm:flex" : "flex"}`}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChatUser(null)} className="sm:hidden text-gray-400 p-1 hover:text-gray-600">
                    <FaChevronRight className="rotate-180" />
                  </button>
                  <Avatar name={activeUser.name || activeUser.email} />
                  <div>
                    <p className="font-bold text-gray-800 text-base leading-tight">{activeUser.name || "User"}</p>
                    <div className="flex items-center gap-1.5 mt-1 bg-green-500 w-fit px-3 py-1 rounded-full border border-green-600 shadow-sm">
                      <FaPhone className="text-[10px] text-white" />
                      <p className="text-xs text-white font-black tracking-wider uppercase">{activeUser.phone || "No phone"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {/* Chat Stats or Actions */}
                   <button onClick={() => clearAdminChat(activeUser)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition">
                     Clear Chat
                   </button>
                </div>
              </div>

              {/* Messages Container */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 bg-[radial-gradient(#e2e8f0_0.8px,transparent_0.8px)] [background-size:24px_24px]">
                {/* Process messages into unified chat flow */}
                {(() => {
                  const unified = [];
                  activeMessages.forEach(q => {
                    if (q.isFromAdmin || q.fromAdmin) {
                      unified.push({ id: q.id, from: 'agent', text: q.answer, time: q.createdAt, replyTo: q.replyToMessage });
                    } else {
                      unified.push({ id: q.id, from: 'user', text: q.question, time: q.createdAt });
                    }
                  });
                  unified.sort((a,b) => new Date(a.time) - new Date(b.time));

                  return unified.map((m, i) => {
                    const isAgent = m.from === 'agent';
                    const currentDate = m.time ? new Date(m.time).toDateString() : null;
                    const prevDate = i > 0 && unified[i-1].time ? new Date(unified[i-1].time).toDateString() : null;
                    const showSeparator = currentDate && currentDate !== prevDate;
                    
                    const getFriendlyDate = (dateStr) => {
                      const d = new Date(dateStr);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);
                      if (d.toDateString() === today.toDateString()) return "Today";
                      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
                      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    };

                    return (
                      <React.Fragment key={i}>
                        {showSeparator && (
                          <div className="flex justify-center my-6 relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <span className="relative px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {getFriendlyDate(m.time)}
                            </span>
                          </div>
                        )}
                        <div className={`flex w-full ${isAgent ? "justify-start" : "justify-end"}`}>
                          <div 
                            className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed cursor-pointer hover:-translate-y-0.5 transition-transform
                            ${isAgent 
                              ? "bg-white text-gray-700 border border-gray-100 rounded-bl-none" 
                              : "bg-green-500 text-white rounded-br-none"}`}
                            onClick={() => { setReplyMessageUser(m); document.getElementById('chatInput').focus(); }}
                          >
                            {m.replyTo && (
                              <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 opacity-80 ${isAgent ? 'bg-gray-100 border-gray-300 text-gray-600' : 'bg-green-600 border-green-400 text-green-100'}`}>
                                <div className="font-bold mb-0.5">Replying to</div>
                                <div className="truncate opacity-90">{m.replyTo}</div>
                              </div>
                            )}
                            <p>{m.text}</p>
                            <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${isAgent ? "text-gray-300" : "text-green-100"} text-right`}>
                              {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                {replyMessageUser && (
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2 px-3">
                    <div className="flex flex-col text-xs text-gray-600">
                      <span className="font-bold">Replying to {replyMessageUser.from === 'agent' ? "Admin" : activeUser.name}</span>
                      <span className="truncate max-w-sm">{replyMessageUser.text}</span>
                    </div>
                    <button onClick={() => setReplyMessageUser(null)} className="text-gray-400 hover:text-red-500">
                      <FaTimes />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <textarea
                    id="chatInput"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplyChat(); } }}
                    placeholder="Type your reply here..."
                    style={{
                      flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16,
                      padding: "12px 16px", outline: "none", fontSize: 14, minHeight: 48, maxHeight: 120,
                      resize: "none", transition: "all 0.2s"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#16a34a"; e.target.style.background = "#fff"; }}
                    onBlur={e  => { e.target.style.borderColor = "#e2e8f0";   e.target.style.background = "#f8fafc"; }}
                  />
                  <button
                    onClick={handleReplyChat}
                    disabled={!chatText.trim() || isSending}
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: (chatText.trim() && !isSending) ? "linear-gradient(135deg,#16a34a,#4ade80)" : "#f1f5f9",
                      color: chatText.trim() ? "#fff" : "#cbd5e1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "none", cursor: chatText.trim() ? "pointer" : "default",
                      transition: "all 0.2s",
                      boxShadow: chatText.trim() ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
                    }}
                  >
                    <FaReply size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1">Press <strong>Enter</strong> to send</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-300 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
                <FaQuestionCircle className="text-3xl" />
              </div>
              <div>
                <p className="font-bold text-gray-400">Select a worker to start chatting</p>
                <p className="text-xs">Individual chat history will appear here</p>
              </div>
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
                <td className="px-5 sm:px-6 py-3.5">
                  <span className="text-[10px] text-gray-400 font-medium italic">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"}</span>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs"><FaCloudRain /></div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">🌦️ Live Weather Report — User Locations</p>
                <p className="text-xs text-gray-400">Real-time disaster risk monitoring across all registered user locations</p>
              </div>
            </div>
            <button onClick={loadWeatherReport} disabled={weatherLoading}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50">
              {weatherLoading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {weatherLoading ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">⏳ Fetching weather data for all locations…</div>
          ) : weatherReport.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-400 text-sm font-medium">No location data available</p>
              <p className="text-gray-300 text-xs mt-1">Weather reports will appear once users set their location in their profile</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left font-semibold">Location</th>
                    <th className="px-5 py-3 text-left font-semibold">📅 Date</th>
                    <th className="px-5 py-3 text-left font-semibold">👥 Users</th>
                    <th className="px-5 py-3 text-left font-semibold">🌡️ Temp °C</th>
                    <th className="px-5 py-3 text-left font-semibold">💨 Wind km/h</th>
                    <th className="px-5 py-3 text-left font-semibold">🌧️ Rain mm</th>
                    <th className="px-5 py-3 text-left font-semibold">☁️ Condition</th>
                    <th className="px-5 py-3 text-left font-semibold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {weatherReport.map((loc, i) => {
                    const risk = getRiskColor(loc.risk_index);
                    const condition = loc.weather_condition || loc.condition || "N/A";
                    const temp = loc.temperature != null ? Number(loc.temperature).toFixed(1) : "—";
                    const wind = loc.wind_speed != null ? Number(loc.wind_speed).toFixed(1) : "—";
                    const rain = loc.rainfall != null ? Number(loc.rainfall).toFixed(1) : "—";
                    return (
                      <tr key={i} className={`hover:bg-gray-50/60 transition ${parseFloat(loc.risk_index) >= 0.7 ? "bg-red-50/30" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-xs">{loc.district !== "—" ? loc.district : loc.state}</span>
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{loc.state}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            {loc.timestamp ? new Date(loc.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                            <FaUsers className="text-[10px]" /> {loc.usersInLocation || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-700">{temp}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-700">{wind}</td>
                        <td className="px-5 py-3.5 font-semibold text-blue-600">{rain}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600 max-w-[150px] truncate">{condition}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${risk.bg} ${risk.text} ${risk.border}`}>
                            {risk.label}
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
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{claimRequests.length}</span> total claim requests
              {pending.length > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{pending.length} need review</span>}
            </p>
            <button onClick={() => { loadClaimRequests(); loadWeatherReport(); }}
              className="text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition">
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
                  const loc = req.user?.state ? `${req.user?.district ? req.user.district + ", " : ""}${req.user.state}` : "—";
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
                        <span className="text-xs text-gray-600 font-medium">{loc}</span>
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
                              <button onClick={() => handleApproveClaimReq(req.id)}
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
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-white/90 text-sm">
                   <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                     <span className="text-[10px] text-indigo-200 uppercase font-black">Old Premiums</span>
                     <span className="font-bold">₹{(adminWallet.oldPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-indigo-300 font-black flex items-center justify-center w-6">+</span>
                   <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                     <span className="text-[10px] text-indigo-200 uppercase font-black">New Premiums</span>
                     <span className="font-bold">₹{(adminWallet.newPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-indigo-300 font-black flex items-center justify-center w-6">=</span>
                   <div className="flex flex-col px-3 py-2 bg-white/10 rounded-lg border border-white/20">
                     <span className="text-[10px] text-green-300 uppercase font-black">Gross Total</span>
                     <span className="font-black">₹{(adminWallet.totalPremiumCollected || 0).toLocaleString("en-IN")}</span>
                   </div>
                   <span className="text-red-300 font-black flex items-center justify-center w-6">-</span>
                   <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                     <span className="text-[10px] text-red-200 uppercase font-black">Total Claims</span>
                     <span className="font-bold">₹{(adminWallet.totalClaimsPaid || 0).toLocaleString("en-IN")}</span>
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
                    <th className="px-5 py-3 text-right font-semibold">Premium</th>
                    <th className="px-5 py-3 text-right font-semibold">Coverage</th>
                    <th className="px-5 py-3 text-right font-semibold">Net Balance</th>
                    <th className="px-5 py-3 text-left font-semibold">Payment / Reference</th>
                    <th className="px-5 py-3 text-left font-semibold">Cycle Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
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
                          <span className="font-bold text-gray-700 text-sm">
                            ₹{Number(premiumAmount).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-black text-sm ${!isCredit ? 'text-red-500' : 'text-indigo-600'}`}>
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
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                            {txn.date ? new Date(txn.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
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

      {/* Two-column cards — stack on mobile */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
            <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs"><FaIdBadge /></span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Account Information</p>
              <p className="text-xs text-gray-400">Your current admin details</p>
            </div>
          </div>
          <div className="p-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center text-white text-2xl shadow shrink-0">
                <FaUserCircle />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 leading-tight">{adminInfo.username}</p>
                <p className="text-xs font-semibold text-green-500 uppercase tracking-widest mt-0.5">Administrator</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <FaEnvelope className="text-gray-300 shrink-0" />
                  <span className="truncate">{adminInfo.email}</span>
                </p>
              </div>
            </div>
            {/* Info rows */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0 text-xs"><FaIdBadge /></div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Username</p>
                  <p className="font-bold text-gray-700 text-sm">{adminInfo.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0 text-xs"><FaEnvelope /></div>
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

        {/* Update credentials card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
            <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs"><FaUserEdit /></span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Update Credentials</p>
              <p className="text-xs text-gray-400">Leave blank to keep existing values</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <InputField
              label="New Username"
              icon={<FaIdBadge className="text-gray-300" />}
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder={`Current: ${adminInfo.username}`}
            />
            <InputField
              label="New Email"
              icon={<FaEnvelope className="text-gray-300" />}
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder={`Current: ${adminInfo.email}`}
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
            />
            <InputField
              label="Confirm Password"
              icon={<FaKey className="text-gray-300" />}
              type="password"
              value={settings.confirmPassword}
              onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
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
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */

  const sectionRenderers = {
    overview: renderOverview,
    users: renderUsers,
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            <FaBars />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs shrink-0">
              <FaShieldAlt />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                {section === "overview" ? "Dashboard" : (meta?.title || "Dashboard")}
              </p>
              <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          {/* Notification dot */}
          {(pendingApprovals + unansweredQ) > 0 && (
            <div className="relative">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <FaBell className="text-sm" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {pendingApprovals + unansweredQ}
              </span>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Toast */}
          {message && (
            <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 max-w-xs
              ${msgType === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
              {msgType === "error" ? <FaTimesCircle /> : <FaCheckCircle />}
              {message}
            </div>
          )}

          {/* Page heading (all pages except overview) */}
          {section !== "overview" && meta && (
            <div className="mb-5 flex items-center gap-3">
              <div className={`w-10 h-10 ${meta.color} rounded-xl flex items-center justify-center text-white text-base shadow-sm`}>
                {meta.icon}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">{meta.title}</h1>
                <p className="text-xs sm:text-sm text-gray-400">{meta.subtitle}</p>
              </div>
            </div>
          )}

          {(sectionRenderers[section] || renderOverview)()}
        </main>
      </div>
    </div>
  );
}