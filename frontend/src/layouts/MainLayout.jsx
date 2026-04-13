import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A1020" }}>

      {/* Sidebar — desktop */}
      <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        minHeight: "100vh",
        background: "#0A1020",
        overflowY: "auto",
        paddingBottom: "80px",
      }}>
        {/* Inner page padding */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav — mobile */}
      <BottomNav />
    </div>
  );
}