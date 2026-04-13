import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

export default function Navbar() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";
  const isAdminPage = location.pathname.startsWith("/admin");

  const navLinks = [
    { label: "Home",         href: "/" },
    { label: "Partners",     href: "#partners" },
    { label: "Coverage",     href: "#coverage" },
    { label: "Features",     href: "#features" },
    { label: "Pricing",      href: "#pricing" },
    { label: "Why Us",       href: "#why-us" },
    { label: "How It Works", href: "#how" },
  ];

  const visibleLinks = (isAuthPage || isAdminPage)
    ? navLinks.filter(l => l.label === "Home")
    : navLinks;

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <FaShieldAlt className="text-lg" />
          </div>
          <Link to="/" className="text-lg font-semibold text-gray-800">
            Gig Insurance
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {visibleLinks.map(link => (
              <a key={link.label} href={link.href} className="hover:text-green-600">
                {link.label}
              </a>
            ))}
          </nav>

          {!isAuthPage && !isAdminPage && (
            <Link
              to="/login"
              className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 shadow transition"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}