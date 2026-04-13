import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

const NAV_LINKS = [
  { label: "Partners",    href: "#partners" },
  { label: "Coverage",   href: "#coverage" },
  { label: "Features",   href: "#features" },
  { label: "Pricing",    href: "#pricing" },
  { label: "How It Works", href: "#how" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage  = location.pathname === "/login" || location.pathname === "/register";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/profile") || location.pathname.startsWith("/claims") || location.pathname.startsWith("/plans") || location.pathname.startsWith("/payment") || location.pathname.startsWith("/reports") || location.pathname.startsWith("/insights") || location.pathname.startsWith("/notifications");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleLinks = (isAuthPage || isAdminPage || isDashboard)
    ? []
    : NAV_LINKS;

  if (isAdminPage || isDashboard) return null;

  return (
    <>
      <style>{`
        .nav-link {
          position: relative; font-size:14px; font-weight:500;
          color: rgba(241,245,249,0.65);
          text-decoration: none; padding: 4px 0;
          transition: color 0.2s;
        }
        .nav-link::after {
          content:''; position:absolute; bottom:-2px; left:0;
          width:0; height:2px; border-radius:99px;
          background: linear-gradient(90deg, #00D4AA, #7C3AED);
          transition: width 0.3s cubic-bezier(.22,.68,0,1.2);
        }
        .nav-link:hover { color: #F1F5F9; }
        .nav-link:hover::after { width: 100%; }

        .nav-cta {
          position: relative; overflow: hidden;
          padding: 9px 22px; border-radius: 10px;
          background: linear-gradient(135deg, #00D4AA, #7C3AED);
          color: #fff; font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(0,212,170,0.3);
        }
        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,212,170,0.45);
        }
        .nav-cta::after {
          content:''; position:absolute; top:0; left:-80%;
          width:50%; height:100%;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent);
          transform:skewX(-20deg);
        }
        .nav-cta:hover::after { animation: navShine 0.5s ease forwards; }
        @keyframes navShine { to { left: 130%; } }

        .nav-logo-icon {
          width:36px; height:36px; border-radius:10px;
          background: linear-gradient(135deg,#00D4AA,#7C3AED);
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:16px;
          box-shadow: 0 0 16px rgba(0,212,170,0.35);
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .nav-logo-icon:hover {
          box-shadow: 0 0 28px rgba(0,212,170,0.6);
          transform: scale(1.08) rotate(-4deg);
        }

        .mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          position: absolute; top: calc(100% + 8px); left: 16px; right: 16px;
          background: rgba(10,16,32,0.96);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 12px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .mobile-menu.open { display: flex; }
        .mobile-link {
          padding: 12px 16px; border-radius: 10px;
          color: rgba(241,245,249,0.7); font-size: 14px; font-weight: 500;
          text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .mobile-link:hover { background: rgba(255,255,255,0.06); color: #F1F5F9; }

        @keyframes hamburgerTop { to { transform: rotate(45deg) translate(5px, 5px); } }
        @keyframes hamburgerMid { to { opacity: 0; } }
        @keyframes hamburgerBot { to { transform: rotate(-45deg) translate(5px, -5px); } }
      `}</style>

      <header
        style={{
          position: "sticky", top: 0, zIndex: 999,
          background: scrolled ? "rgba(6,11,24,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
        }}
      >
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative",
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div className="nav-logo-icon">
              <FaShieldAlt />
            </div>
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800, fontSize: "17px",
              background: "linear-gradient(135deg,#F1F5F9,#94A3B8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              GigShield
            </span>
          </Link>

          {/* Desktop Nav */}
          {visibleLinks.length > 0 && (
            <nav style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden md:flex">
              {visibleLinks.map(link => (
                <a key={link.label} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isAuthPage && (
              <Link to="/register" className="nav-cta">
                Register Free →
              </Link>
            )}

            {/* Mobile Hamburger */}
            {visibleLinks.length > 0 && (
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="flex md:hidden"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "8px 10px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: "4px",
                }}
              >
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    display: "block", width: "18px", height: "2px",
                    background: "#94A3B8", borderRadius: "99px",
                    transition: "all 0.25s ease",
                  }} />
                ))}
              </button>
            )}
          </div>

          {/* Mobile Dropdown */}
          {mobileOpen && visibleLinks.length > 0 && (
            <div className="mobile-menu open">
              {visibleLinks.map(link => (
                <a key={link.label} href={link.href} className="mobile-link"
                   onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Link to="/register"
                style={{
                  display: "block", marginTop: "6px", padding: "12px 16px",
                  borderRadius: "10px", textAlign: "center",
                  background: "linear-gradient(135deg,#00D4AA,#7C3AED)",
                  color: "#fff", fontSize: "14px", fontWeight: 700,
                  textDecoration: "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Register Free →
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}