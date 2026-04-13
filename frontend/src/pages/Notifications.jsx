import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyNotifications, markNotificationAsRead } from '../api';
import api from '../api';
import { FaBell } from 'react-icons/fa';

// ─── same default as ChatSupport ───────────────────────────────────────────
const defaultTheme = {
  gradient: "linear-gradient(135deg,#16a34a,#4ade80)",
  light: "#f0fdf4",
  accent: "#16a34a",
};

const STYLES = `
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to   { transform:rotate(360deg); } }

  .n-wrap {
    max-width: 960px;          /* wider on large screens */
    margin: 0 auto;
    padding: 28px 32px;
    box-sizing: border-box;
    width: 100%;
  }

  /* header */
  .n-header { display:flex; align-items:center; gap:16px; margin-bottom:32px; flex-wrap:wrap; }
  .n-header-text { flex:1; min-width:0; }
  .n-header-text h2 {
    font-family: Sora, sans-serif;
    font-size: clamp(18px, 2.4vw, 26px);
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 3px;
  }
  .n-header-text p { font-size:13px; color:#94a3b8; margin:0; }

  .n-refresh {
    font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    background:transparent; border:1.5px solid #e2e8f0; border-radius:10px;
    padding:7px 16px; color:#94a3b8; cursor:pointer;
    transition: border-color .2s, color .2s;
    white-space:nowrap; flex-shrink:0;
  }

  /* stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 12px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: #f8fafc;
    border-radius: 14px;
    padding: 16px 18px;
    border: 1.5px solid #f1f5f9;
  }
  .stat-card .s-label {
    font-size:11px; color:#94a3b8; margin:0 0 6px;
    text-transform:uppercase; letter-spacing:.05em; font-weight:700;
  }
  .stat-card .s-val {
    font-size: 28px; font-weight:800; margin:0;
    font-family: Sora, sans-serif;
  }

  .section-label {
    font-size:11px; font-weight:700; color:#94a3b8;
    text-transform:uppercase; letter-spacing:.07em; margin:0 0 10px;
  }

  /* list */
  .notif-list { display:flex; flex-direction:column; gap:9px; }

  .n-item {
    border-radius: 16px;
    padding: 16px 20px;
    cursor: pointer;
    transition: transform .15s ease;
    animation: slideUp .4s ease both;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .n-item:nth-child(1){animation-delay:.04s}
  .n-item:nth-child(2){animation-delay:.09s}
  .n-item:nth-child(3){animation-delay:.14s}
  .n-item:nth-child(4){animation-delay:.19s}
  .n-item:nth-child(5){animation-delay:.24s}
  .n-item:hover { transform: translateX(4px); }

  .n-item.unread {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  }
  .n-item.read {
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    border-left-width: 4px !important;
    border-left-color: #e2e8f0 !important;
    opacity: 0.7;
  }

  .n-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:5px; }
  .n-dot.read { background: #cbd5e1; }

  .n-body { flex:1; min-width:0; }
  .n-title-row {
    display:flex; align-items:flex-start;
    justify-content:space-between; gap:10px;
    margin-bottom:5px; flex-wrap:wrap;
  }
  .n-title  { font-size:14px; font-weight:700; color:#0f172a; margin:0; }
  .n-time   { font-size:11px; color:#94a3b8; white-space:nowrap; flex-shrink:0; margin-top:2px; }
  .n-msg    { font-size:13px; color:#64748b; margin:0; line-height:1.6; word-break:break-word; }

  .n-badge      { display:inline-block; font-size:11px; font-weight:600; border-radius:6px; padding:3px 10px; margin-top:9px; }
  .n-badge.read { background:#f1f5f9; color:#94a3b8; border:0.5px solid #e2e8f0; }

  /* empty */
  .empty-box { background:#fff; border:1.5px solid #f1f5f9; border-radius:20px; padding:70px 40px; text-align:center; }
  .empty-icon { width:68px; height:68px; border-radius:20px; margin:0 auto 18px; display:flex; align-items:center; justify-content:center; }
  .empty-box h3 { font-weight:700; color:#475569; font-size:16px; margin:0 0 6px; }
  .empty-box p  { font-size:13px; color:#94a3b8; margin:0; }

  .spinner-wrap { display:flex; justify-content:center; padding:70px 0; }
  .spinner { width:34px; height:34px; border-radius:50%; border:3px solid #e2e8f0; animation:spin .7s linear infinite; }

  /* responsive */
  @media (max-width: 768px) {
    .n-wrap  { padding: 20px 20px; }
    .stat-card .s-val { font-size: 24px; }
  }
  @media (max-width: 480px) {
    .n-wrap  { padding: 16px 12px; }
    .n-item  { padding: 13px 14px; gap:11px; }
    .n-title { font-size: 13px; }
    .n-msg   { font-size: 12px; }
    .stat-card .s-val { font-size: 20px; }
    .stat-card { padding: 12px 12px; }
  }
`;

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const init = async () => {
      try {
        // ── same theme-fetch logic as ChatSupport ──────────────────────
        const u = await api.getCurrentUser();
        const partners = await api.getPartners();
        if (Array.isArray(partners)) {
          const p = partners.find(ptr => ptr.name === u.platform);
          if (p?.borderColor) {
            setTheme({
              gradient: `linear-gradient(135deg, ${p.borderColor}, ${p.borderColor}bb)`,
              light: `${p.borderColor}22`,
              accent: p.borderColor,
            });
          }
        }
      } catch (e) { console.error(e); }

      loadNotifications();
    };
    init();
  }, [navigate]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications();
      if (res && Array.isArray(res)) setNotifications(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRead = async (id) => {
    try { await markNotificationAsRead(id); loadNotifications(); }
    catch (e) { console.error(e); }
  };

  const unread = notifications.filter(n => !n.read).length;
  const today = notifications.filter(n =>
    new Date(n.createdAt).toDateString() === new Date().toDateString()
  ).length;

  // ── dynamic inline styles driven by theme (same as ChatSupport) ────────
  const unreadItemStyle = {
    borderLeft: `4px solid ${theme.accent}`,
    boxShadow: `0 4px 14px ${theme.accent}18`,
  };
  const unreadDotStyle = { background: theme.accent };
  const unreadBadgeStyle = { background: theme.light, color: theme.accent };
  const refreshHover = (e, enter) => {
    e.target.style.borderColor = enter ? theme.accent : '#e2e8f0';
    e.target.style.color = enter ? theme.accent : '#94a3b8';
  };

  return (
    <div className="n-wrap">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="n-header">
        <div style={{
          width: 52, height: 52, borderRadius: 18, flexShrink: 0,
          background: theme.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 20px ${theme.accent}33`,
        }}>
          <FaBell size={22} color="#fff" />
        </div>

        <div className="n-header-text">
          <h2>Notifications</h2>
          <p>Stay updated with your latest activity</p>
        </div>

        <button
          className="n-refresh"
          onClick={loadNotifications}
          onMouseEnter={e => refreshHover(e, true)}
          onMouseLeave={e => refreshHover(e, false)}
        >
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="s-label">Total</p>
          <p className="s-val" style={{ color: "#0f172a" }}>{notifications.length}</p>
        </div>
        <div className="stat-card">
          <p className="s-label">Unread</p>
          <p className="s-val" style={{ color: theme.accent }}>{unread}</p>
        </div>
        <div className="stat-card">
          <p className="s-label">Today</p>
          <p className="s-val" style={{ color: "#0f172a" }}>{today}</p>
        </div>
      </div>

      <p className="section-label">Recent</p>

      {/* ── Body ── */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" style={{ borderTopColor: theme.accent }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon" style={{ background: theme.light }}>
            <FaBell size={28} color={theme.accent} />
          </div>
          <h3>No notifications yet</h3>
          <p>You'll see updates about your claims and account here.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`n-item ${n.read ? 'read' : 'unread'}`}
              style={n.read ? {} : unreadItemStyle}
              onClick={() => !n.read && handleRead(n.id)}
            >
              <div
                className={`n-dot ${n.read ? 'read' : ''}`}
                style={n.read ? {} : unreadDotStyle}
              />
              <div className="n-body">
                <div className="n-title-row">
                  <p className="n-title">{n.title}</p>
                  <span className="n-time">{formatTime(n.createdAt)}</span>
                </div>
                <p className="n-msg">{n.message}</p>
                {n.type && (
                  <span
                    className={`n-badge ${n.read ? 'read' : ''}`}
                    style={n.read ? {} : unreadBadgeStyle}
                  >
                    {n.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}