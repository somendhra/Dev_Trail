import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";
import Claims from "./pages/Claims";
import Notifications from "./pages/Notifications";
import ChatSupport from "./pages/ChatSupport";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";

import AdminDashboard from "./pages/AdminDashboard";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen font-sans bg-gray-100 text-gray-800">

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chat" element={<ChatSupport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Protected Admin area (separate layout) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </div>
  );
}