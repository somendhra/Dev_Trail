import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import {
  FaShieldAlt, FaHome, FaClipboardList, FaChartBar,
  FaUser, FaSignOutAlt, FaCommentDots, FaBell, FaBrain, FaFileAlt
} from "react-icons/fa";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

  .gs-sidebar {
    width: 256px; height: 100vh; display: flex; flex-direction: column;
    background: #060B18;
    border-right: 1px solid rgba(255,255,255,0.07);
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
    position: sticky; top: 0;
  }

  /* Logo */
  .gs-logo-wrap {
    display: flex; align-items: center; gap: 12px;
    padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .gs-logo-icon {
    width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
    background: linear-gradient(135deg, #00D4AA, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; color: #fff;
    box-shadow: 0 0 18px rgba(0,212,170,0.3);
  }
  .gs-logo-text {
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 16px;
    background: linear-gradient(135deg, #F1F5F9, #94A3B8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Nav */
  .gs-nav { flex: 1; padding: 18px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
  .gs-nav::-webkit-scrollbar { width: 4px; }
  .gs-nav::-webkit-scrollbar-track { background: transparent; }
  .gs-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

  /* Section label */
  .gs-section-label {
    font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.2); padding: 8px 12px 4px;
  }

  /* Nav item */
  .gs-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 12px; border-radius: 11px; text-decoration: none;
    font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.45);
    transition: all 0.2s ease; position: relative;
    border: 1px solid transparent;
  }
  .gs-item:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.07);
  }
  .gs-item.active {
    color: #00D4AA; background: rgba(0,212,170,0.1);
    border-color: rgba(0,212,170,0.2);
    font-weight: 600;
  }
  .gs-item.active .gs-item-icon { color: #00D4AA; }
  .gs-item-icon { font-size: 15px; flex-shrink: 0; }

  /* Badge */
  .gs-badge {
    margin-left: auto; min-width: 18px; height: 18px; padding: 0 5px;
    border-radius: 999px; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  /* Divider */
  .gs-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 6px 12px; }

  /* User card at bottom */
  .gs-user-card {
    margin: 0 12px 12px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 14px 14px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .gs-user-info { display: flex; align-items: center; gap: 10px; }
  .gs-avatar {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #00D4AA22, #7C3AED22);
    border: 1px solid rgba(0,212,170,0.3);
    display: flex; align-items: center; justify-content: center;
    color: #00D4AA; font-size: 14px; font-weight: 700;
  }
  .gs-user-name { font-size: 13px; font-weight: 600; color: #F1F5F9; line-height: 1.2; }
  .gs-user-role { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; }

  /* Logout btn */
  .gs-logout {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 9px 0; border-radius: 10px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 600; color: rgba(248,113,113,0.8);
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.15);
    transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .gs-logout:hover { background: rgba(239,68,68,0.15); color: #F87171; border-color: rgba(239,68,68,0.3); }

  /* Footer */
  .gs-footer {
    padding: 10px 20px 14px; font-size: 10px; color: rgba(255,255,255,0.15);
    border-top: 1px solid rgba(255,255,255,0.05); letter-spacing: 0.5px;
  }

  /* Active indicator dot */
  .gs-item.active::before {
    content: ''; position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
    width: 3px; height: 60%; border-radius: 99px;
    background: linear-gradient(180deg, #00D4AA, #7C3AED);
  }
`;

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard",     icon: FaHome,          label: "Dashboard" },
    ]
  },
  {
    label: "Insurance",
    items: [
      { to: "/plans",         icon: FaShieldAlt,     label: "Insurance Plans" },
      { to: "/claims",        icon: FaClipboardList, label: "Claims" },
    ]
  },
  {
    label: "Analytics",
    items: [
      { to: "/reports",       icon: FaFileAlt,       label: "Reports" },
      { to: "/insights",      icon: FaBrain,         label: "Latest News" },
    ]
  },
  {
    label: "Updates",
    items: [
      { to: "/notifications", icon: FaBell,          label: "Notifications", badgeKey: "notif" },
    ]
  },
  {
    label: "Account",
    items: [
      { to: "/profile",       icon: FaUser,          label: "My Profile" },
      { to: "/chat",          icon: FaCommentDots,   label: "Support Chat", badgeKey: "chat" },
    ]
  },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [badges, setBadges]   = useState({ notif: 0, chat: 0 });
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Worker");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const notifs = await api.getMyNotifications();
        const unread = Array.isArray(notifs) ? notifs.filter(n => !n.read).length : 0;

        const queries = await api.getMyQueries();
        const chatUnread = Array.isArray(queries)
          ? queries.filter(q => (q.isFromAdmin || q.fromAdmin) && !q.readByUser).length : 0;

        setBadges({ notif: unread, chat: chatUnread });
      } catch { }
    };

    fetchBadges();
    const iv = setInterval(fetchBadges, 30000);
    const onRead = () => setBadges(b => ({ ...b, chat: 0 }));
    window.addEventListener("chatRead", onRead);
    return () => { clearInterval(iv); window.removeEventListener("chatRead", onRead); };
  }, []);

  const logout = () => {
    ["token","userId","userName","isAdmin","adminEmail","adminUsername"].forEach(k => localStorage.removeItem(k));
    navigate("/login");
  };

  const initial = (userName || "W").charAt(0).toUpperCase();

  return (
    <aside className="gs-sidebar">
      <style>{STYLES}</style>

      {/* Logo */}
      <div className="gs-logo-wrap">
        <div className="gs-logo-icon"><FaShieldAlt /></div>
        <span className="gs-logo-text">GigShield</span>
      </div>

      {/* Nav */}
      <nav className="gs-nav">
        {NAV_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="gs-divider" />}
            <div className="gs-section-label">{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              const badge = item.badgeKey ? badges[item.badgeKey] : 0;
              const isActive = location.pathname === item.to ||
                (item.to === "/chat" && location.pathname === "/chat");
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`gs-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="gs-item-icon" />
                  {item.label}
                  {badge > 0 && (
                    <span className="gs-badge" style={{
                      background: item.badgeKey === "chat" ? "rgba(0,212,170,0.2)" : "rgba(239,68,68,0.2)",
                      color: item.badgeKey === "chat" ? "#00D4AA" : "#F87171",
                    }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* User card + Logout */}
      <div className="gs-user-card">
        <div className="gs-user-info">
          <div className="gs-avatar">{initial}</div>
          <div>
            <div className="gs-user-name">{userName}</div>
            <div className="gs-user-role">Gig Worker · Active</div>
          </div>
        </div>
        <button className="gs-logout" onClick={logout}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      <div className="gs-footer">© 2026 GigShield Platform</div>
    </aside>
  );
}