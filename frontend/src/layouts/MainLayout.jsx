import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {

  return (

    <div className="min-h-screen bg-gray-100">

      {/* Sidebar (Desktop only) */}
      <aside className="hidden lg:flex w-64 fixed left-0 top-0 h-screen bg-white shadow">
        <Sidebar />
      </aside>

      {/* Content */}
      <div className="lg:ml-64">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-6">
          <Outlet />
        </main>

      </div>

      {/* Bottom Nav (Mobile only) */}
      <BottomNav />

    </div>

  );
}