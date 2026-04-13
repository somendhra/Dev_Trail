import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroBg from "../../../assets/LandingBanner.png";
import { FaInfoCircle, FaEnvelope, FaShieldAlt, FaLifeRing } from "react-icons/fa";
import { getPlans } from "../api";

/* ─────────────────────────────────────────────
   GLOBAL STYLES + KEYFRAMES
 ───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, body { font-family: 'Inter', sans-serif; }
  h1,h2,h3,h4 { font-family: 'Sora', sans-serif; }

  :root {
    --green:   #16a34a;
    --green-l: #22c55e;
    --green-d: #14532d;
    --slate:   #0f172a;
  }

  /* Hero fade-up */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fade-up    { animation: fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both; }
  .fade-up.d1 { animation-delay: 0.08s; }
  .fade-up.d2 { animation-delay: 0.20s; }
  .fade-up.d3 { animation-delay: 0.34s; }
  .fade-up.d4 { animation-delay: 0.48s; }

  /* Marquee */
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-inner {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
  }
  .marquee-inner:hover { animation-play-state: paused; }

  /* Partner card hover */
  .partner-card {
    transition: transform 0.35s cubic-bezier(.22,.68,0,1.4),
                box-shadow 0.3s ease,
                border-color 0.3s ease;
  }
  .partner-card:hover {
    transform: translateY(-10px) scale(1.06);
    box-shadow: 0 18px 44px rgba(22,163,74,0.20);
  }
  .partner-card img { transition: filter 0.3s ease; }
  .partner-card:hover img { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.2)); }

  /* Section cards */
  .disrupt-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .disrupt-card:hover { transform: translateY(-6px) scale(1.02); box-shadow:0 14px 36px rgba(0,0,0,0.10); }

  .feat-card { transition: background 0.3s, transform 0.3s; }
  .feat-card:hover { background: rgba(255,255,255,0.11) !important; transform: translateY(-4px); }

  .plan-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .plan-card:hover { transform: translateY(-8px); }

  .trust-card:hover .trust-icon { transform: scale(1.22) rotate(-6deg); }
  .trust-icon { transition: transform 0.35s cubic-bezier(.22,.68,0,1.4); display:inline-block; }

  .step-wrap { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .step-wrap:hover { transform: translateY(-5px); box-shadow:0 12px 28px rgba(0,0,0,0.09); }
  .step-circle { transition: background 0.3s, color 0.3s, transform 0.3s; }
  .step-wrap:hover .step-circle { background: var(--green); color: #fff; transform: scale(1.18); }

  /* Shine sweep */
  .cta-btn { position: relative; overflow: hidden; }
  .cta-btn::after {
    content:''; position:absolute; top:0; left:-80%;
    width:50%; height:100%;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.32) 50%, transparent 100%);
    transform: skewX(-20deg);
  }
  .cta-btn:hover::after { animation: shine 0.55s ease forwards; }
  @keyframes shine { to { left: 130%; } }

  /* Scroll reveal */
  .scroll-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
`;

const PARTNERS = [
  { src: "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", alt: "Zomato", bg: "#FFF1F0", border: "#fca5a5" },
  { src: "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", alt: "Swiggy", bg: "#FFF7ED", border: "#fdba74" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon", bg: "#FFFBEB", border: "#fcd34d" },
  { src: "https://play-lh.googleusercontent.com/0-sXSA0gnPDKi6EeQQCYPsrDx6DqnHELJJ7wFP8bWCpziL4k5kJf8RnOoupdnOFuDm_n=s256-rw", alt: "Flipkart", bg: "#EFF6FF", border: "#93c5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", alt: "Zepto", bg: "#FAF5FF", border: "#c4b5fd" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", alt: "Dunzo", bg: "#F0FDF4", border: "#86efac" },
];

const DISRUPTIONS = [
  { icon: "🌧️", title: "Heavy Rain", desc: "Income protection during severe rainfall events." },
  { icon: "🌫️", title: "Air Pollution", desc: "Coverage when AQI reaches dangerous levels." },
  { icon: "🚫", title: "Curfews", desc: "Financial safety during unexpected restrictions." },
  { icon: "🌊", title: "Floods", desc: "AI detects flooding and triggers instant payouts." },
];

const FEATURES = [
  { icon: "🛡️", color: "bg-green-100 text-green-600", title: "AI Risk Prediction", desc: "Predict disruptions using real-time weather and traffic data." },
  { icon: "📑", color: "bg-blue-100 text-blue-600", title: "Automatic Claims", desc: "Claims triggered automatically the moment a disruption is detected." },
  { icon: "💰", color: "bg-emerald-100 text-emerald-600", title: "Instant Payout", desc: "Workers receive compensation directly — no waiting, no forms, no delays." },
];

const TRUST = [
  { icon: "🤖", title: "AI Monitoring", desc: "Tracks weather, AQI, and civil disruptions in real time, 24 / 7." },
  { icon: "⚡", title: "Zero Claim Hassle", desc: "Claims auto-triggered — no manual forms, no waiting, no friction." },
  { icon: "💳", title: "Instant Compensation", desc: "Money hits your account the moment a disruption is confirmed." },
];

const STEPS = [
  { n: "1", bg: "bg-purple-100", text: "text-purple-700", title: "Register", desc: "Create your account in minutes." },
  { n: "2", bg: "bg-blue-100", text: "text-blue-700", title: "Choose Plan", desc: "Pick the coverage that fits your needs." },
  { n: "3", bg: "bg-amber-100", text: "text-amber-700", title: "AI Detects", desc: "We monitor disruptions around the clock." },
  { n: "4", bg: "bg-green-100", text: "text-green-700", title: "Auto Payout", desc: "Receive instant compensation, every time." },
];

function SectionHeading({ tag, title, subtitle, light = false }) {
  return (
    <div className="text-center mb-10 sm:mb-12 scroll-reveal">
      <span className={`inline-block text-[10px] sm:text-xs font-extrabold tracking-[0.22em] uppercase
                        px-3.5 py-1.5 rounded-full mb-3
                        ${light ? "bg-white/10 text-green-300 border border-green-700"
          : "bg-green-100 text-green-700 border border-green-200"}`}>
        {tag}
      </span>
      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight
                      ${light ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 text-sm sm:text-base ${light ? "text-green-200" : "text-slate-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getPlans();
        if (Array.isArray(res) && res.length > 0) {
          setPlans(res);
        } else {
          setPlans([
            { id: 1, name: "Starter", weeklyPremium: 29, trialDays: 7, features: ["Rain protection", "Basic AI monitoring"] },
            { id: 2, name: "Smart", weeklyPremium: 49, trialDays: 7, features: ["All weather protection", "Auto claims"] },
            { id: 3, name: "Pro", weeklyPremium: 79, trialDays: 7, features: ["Instant payout", "Priority support"] }
          ]);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Re-run observer whenever loading status changes for dynamic plans
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll(".scroll-reveal");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ color: "#0f172a" }}>
      <style>{STYLES}</style>
      <Navbar />

      <header
        className="relative w-full bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${heroBg})`, backgroundPosition: "center right" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/55 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8
                        h-[210px] sm:h-[270px] md:h-[340px] lg:h-[430px] flex items-center">
          <div className="max-w-[275px] sm:max-w-sm md:max-w-lg space-y-3 sm:space-y-4">
            <span className="fade-up d1 inline-block text-[10px] sm:text-xs font-extrabold tracking-widest
                             uppercase px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
              AI-Powered Protection
            </span>
            <h1 className="fade-up d2 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">
              Insurance for<br />
              <span style={{ color: "var(--green)" }}>Gig Workers</span>
            </h1>
            <p className="fade-up d3 text-[11px] sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Protect your income from heavy rain, floods,<br className="hidden sm:block" />
              pollution and automatically.
            </p>
            <Link
              to="/register"
              className="fade-up d4 cta-btn inline-flex items-center gap-2
                         px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl font-semibold
                         text-xs sm:text-sm text-white shadow-lg hover:scale-105 transition-transform duration-200"
              style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </header>

      <section id="partners" className="bg-white border-y border-slate-200 py-12 sm:py-16 overflow-hidden">
        <SectionHeading
          tag="Partners"
          title="Supported Delivery Platforms"
          subtitle="Trusted by workers across every major delivery app in India"
        />
        <div
          className="overflow-hidden w-full"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
          }}
        >
          <div className="marquee-inner py-3">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div
                key={i}
                className="partner-card flex-shrink-0 mx-3 sm:mx-4 flex flex-col
                           items-center justify-center rounded-2xl border-2 cursor-pointer"
                style={{
                  width: "clamp(120px, 15vw, 168px)",
                  height: "clamp(80px,  10vw, 110px)",
                  background: p.bg,
                  borderColor: p.border,
                  padding: "10px 18px",
                }}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  style={{
                    maxHeight: "clamp(30px, 4.5vw, 46px)",
                    maxWidth: "clamp(88px, 11vw, 128px)",
                    objectFit: "contain",
                    width: "100%",
                  }}
                />
                <span className="mt-2 text-[9px] sm:text-[11px] font-semibold text-slate-500 tracking-wide">
                  {p.alt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="coverage" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <SectionHeading
          tag="Coverage"
          title="Disruptions We Protect Against"
          subtitle="AI detects each event automatically — no manual reporting needed"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {DISRUPTIONS.map((d, i) => (
            <div
              key={i}
              className="disrupt-card scroll-reveal bg-white border border-slate-100
                         shadow-sm rounded-2xl p-5 sm:p-6 text-center"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="text-3xl sm:text-4xl mb-3">{d.icon}</div>
              <h4 className="font-bold text-sm sm:text-base text-slate-800">{d.title}</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionHeading
            tag="Features"
            title="Powerful, Automatic, Transparent"
            subtitle="Built for the realities of gig work in India"
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feat-card scroll-reveal bg-white/5 border border-white/10
                           rounded-2xl p-6 flex items-start gap-4"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center
                                 justify-center text-2xl ${f.color}`}>
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">{f.title}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionHeading
            tag="Pricing"
            title="Affordable Weekly Plans"
            subtitle="Flexible coverage starting at low weekly rates"
          />
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">
            {loading ? (
               [1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>)
            ) : (
              plans.map((p, i) => {
                const isPopular = p.name === "Smart" || i === 1;
                return (
                  <div
                    key={p.id}
                    className={`plan-card scroll-reveal rounded-2xl p-7 flex flex-col gap-5 border relative
                      ${isPopular
                        ? "border-green-400 shadow-2xl shadow-green-100 bg-gradient-to-b from-green-50 to-white"
                        : "border-slate-200 shadow-sm bg-white"}`}
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                    {isPopular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold
                                       tracking-widest uppercase px-4 py-1.5 rounded-full text-white shadow-md"
                        style={{ background: "var(--green)" }}>
                        Most Popular
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                      <div className="flex items-end gap-1 mt-2">
                        <span className="text-4xl font-extrabold" style={{ color: "var(--green)" }}>₹{p.weeklyPremium}</span>
                        <span className="text-slate-400 text-sm mb-1">per week</span>
                      </div>
                    </div>
                    <ul className="space-y-2.5 flex-1">
                      {p.features?.map((perk, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center
                                           justify-center text-xs font-bold shrink-0">✓</span>
                          {perk}
                        </li>
                      ))}
                      <li className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center
                                         justify-center text-xs font-bold shrink-0">✓</span>
                        {p.trialDays}-day free trial
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className={`cta-btn w-full py-3 text-center rounded-xl font-semibold text-sm transition-all duration-200
                        ${isPopular
                          ? "text-white shadow-md hover:shadow-green-300"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                      style={isPopular ? { background: "linear-gradient(135deg,#16a34a,#22c55e)" } : {}}
                    >
                      {isPopular ? "Get Started" : "Select Plan"}
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section id="why-us" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <SectionHeading
          tag="Why Us"
          title="Why Gig Workers Trust Us"
          subtitle="Designed around the challenges delivery workers face every day"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {TRUST.map((t, i) => (
            <div
              key={i}
              className="trust-card scroll-reveal bg-white border border-slate-100 shadow-sm
                         rounded-2xl p-7 text-center hover:shadow-lg transition-shadow duration-300"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="trust-icon text-4xl sm:text-5xl mb-4">{t.icon}</div>
              <h4 className="font-bold text-slate-800 text-base mb-2">{t.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg,#14532d 0%,#16a34a 55%,#22c55e 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center px-5 sm:px-8 scroll-reveal">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
            Protect Your Gig Income Today
          </h2>
          <p className="text-green-100 text-sm sm:text-base mb-8">
            Join thousands of delivery workers securing their earnings with AI-powered insurance.
          </p>
          <Link
            to="/register"
            className="cta-btn inline-flex items-center gap-2 bg-white text-green-700 font-extrabold
                       px-8 py-3.5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105
                       transition-all duration-200 text-sm sm:text-base"
          >
            Get Started Now →
          </Link>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <SectionHeading
          tag="Process"
          title="How It Works"
          subtitle="Four simple steps between you and financial protection"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="step-wrap scroll-reveal bg-white border border-slate-100 shadow-sm
                         rounded-2xl p-5 sm:p-6 text-center"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={`step-circle w-12 h-12 mx-auto rounded-full flex items-center justify-center
                                font-extrabold text-sm mb-4 ${s.bg} ${s.text}`}>
                {s.n}
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-1">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-slate-400 mb-8">
            {[
              { Icon: FaInfoCircle, label: "About", hover: "hover:text-green-400", col: "text-green-500" },
              { Icon: FaEnvelope, label: "Contact", hover: "hover:text-blue-400", col: "text-blue-500" },
              { Icon: FaShieldAlt, label: "Privacy", hover: "hover:text-purple-400", col: "text-purple-500" },
              { Icon: FaLifeRing, label: "Support", hover: "hover:text-orange-400", col: "text-orange-500" },
            ].map(({ Icon, label, hover, col }) => (
              <div key={label}
                className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 ${hover}`}>
                <Icon className={`text-base ${col}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
            © 2026 AI Gig Insurance Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}