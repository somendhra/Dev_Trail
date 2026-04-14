import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyNotifications, markNotificationAsRead } from '../api';
import api from '../api';
import { FaBell } from 'react-icons/fa';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }

  .n-page {
    min-height: 100vh;
    background: #060B18;
    padding: 32px 24px;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
  .n-wrap { max-width: 860px; margin: 0 auto; }

  /* Header */
  .n-header { display:flex; align-items:center; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
  .n-icon-wrap {
    width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
    background: linear-gradient(135deg, #00D4AA, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(0,212,170,0.3);
  }
  .n-header-text { flex:1; min-width:0; }
  .n-header-text h2 {
    font-family: Sora, sans-serif; font-size: clamp(20px,2.5vw,26px);
    font-weight: 800; color: #F1F5F9; margin: 0 0 4px;
  }
  .n-header-text p { font-size:13px; color:rgba(255,255,255,0.45); margin:0; }
  .n-refresh {
    font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius:10px; padding:8px 18px; color:rgba(255,255,255,0.6); cursor:pointer;
    transition: all .2s; white-space:nowrap; flex-shrink:0;
    font-family: 'Inter', sans-serif;
  }
  .n-refresh:hover { background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.35); color: #00D4AA; }

  /* Stats */
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; }
  .stat-card {
    background: rgba(13,21,38,0.95);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 18px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .stat-card .s-label { font-size:11px; color:rgba(255,255,255,0.4); margin:0 0 8px; text-transform:uppercase; letter-spacing:.07em; font-weight:700; }
  .stat-card .s-val   { font-size:28px; font-weight:800; margin:0; font-family: Sora,sans-serif; }

  .section-label {
    font-size:11px; font-weight:700; color:rgba(255,255,255,0.35);
    text-transform:uppercase; letter-spacing:.07em; margin:0 0 12px;
  }

  /* List */
  .notif-list { display:flex; flex-direction:column; gap:9px; }

  .n-item {
    border-radius: 16px;
    padding: 16px 20px;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .2s;
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
    background: rgba(13,21,38,0.97);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    border-left: 4px solid #00D4AA;
  }
  .n-item.read {
    background: rgba(13,21,38,0.6);
    border: 1px solid rgba(255,255,255,0.05);
    opacity: 0.65;
  }

  .n-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:6px; }
  .n-dot.unread { background: #00D4AA; box-shadow: 0 0 8px rgba(0,212,170,0.5); animation: pulse 2s infinite; }
  .n-dot.read   { background: rgba(255,255,255,0.2); }

  .n-body { flex:1; min-width:0; }
  .n-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:5px; flex-wrap:wrap; }
  .n-title  { font-size:15px; font-weight:700; color:#F1F5F9; margin:0; }
  .n-time   { font-size:11px; color:rgba(255,255,255,0.35); white-space:nowrap; flex-shrink:0; margin-top:2px; }
  .n-msg    { font-size:13px; color:rgba(255,255,255,0.6); margin:0; line-height:1.6; word-break:break-word; }

  .n-badge { display:inline-block; font-size:11px; font-weight:700; border-radius:6px; padding:3px 10px; margin-top:9px; }
  .n-badge.unread { background: rgba(0,212,170,0.12); color: #00D4AA; border: 1px solid rgba(0,212,170,0.25); }
  .n-badge.read   { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); }

  /* Empty */
  .empty-box {
    background: rgba(13,21,38,0.95); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 70px 40px; text-align: center;
  }
  .empty-icon { width:68px; height:68px; border-radius:20px; margin:0 auto 18px; display:flex; align-items:center; justify-content:center; background:rgba(0,212,170,0.1); border:1px solid rgba(0,212,170,0.25); }
  .empty-box h3 { font-weight:700; color:#F1F5F9; font-size:16px; margin:0 0 6px; font-family:Sora,sans-serif; }
  .empty-box p  { font-size:13px; color:rgba(255,255,255,0.4); margin:0; }

  /* Spinner */
  .spinner-wrap { display:flex; justify-content:center; padding:70px 0; }
  .spinner { width:34px; height:34px; border-radius:50%; border:3px solid rgba(255,255,255,0.1); border-top-color:#00D4AA; animation:spin .7s linear infinite; }

  @media(max-width:600px){
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .n-item { padding:13px 14px; gap:11px; }
    .n-title { font-size:14px; }
    .n-msg   { font-size:12px; }
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadNotifications();
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
  const today  = notifications.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="n-page">
      <style>{STYLES}</style>
      <div className="n-wrap">

        {/* Header */}
        <div className="n-header">
          <div className="n-icon-wrap"><FaBell size={22} color="#fff" /></div>
          <div className="n-header-text">
            <h2>Notifications</h2>
            <p>Stay updated with your latest activity</p>
          </div>
          <button className="n-refresh" onClick={loadNotifications}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="s-label">Total</p>
            <p className="s-val" style={{ color: "#F1F5F9" }}>{notifications.length}</p>
          </div>
          <div className="stat-card">
            <p className="s-label">Unread</p>
            <p className="s-val" style={{ color: "#00D4AA" }}>{unread}</p>
          </div>
          <div className="stat-card">
            <p className="s-label">Today</p>
            <p className="s-val" style={{ color: "#A78BFA" }}>{today}</p>
          </div>
        </div>

        <p className="section-label">Recent</p>

        {/* Body */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon"><FaBell size={28} color="#00D4AA" /></div>
            <h3>No notifications yet</h3>
            <p>You'll see updates about your claims and account here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`n-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => !n.read && handleRead(n.id)}
              >
                <div className={`n-dot ${n.read ? 'read' : 'unread'}`} />
                <div className="n-body">
                  <div className="n-title-row">
                    <p className="n-title">{n.title}</p>
                    <span className="n-time">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="n-msg">{n.message}</p>
                  {n.type && (
                    <span className={`n-badge ${n.read ? 'read' : 'unread'}`}>{n.type}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}