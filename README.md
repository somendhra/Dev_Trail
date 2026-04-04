# 🛡️ GigShield — AI-Powered Parametric Insurance for India's Gig Economy

> *"Every rainstorm shouldn't mean an empty wallet."*

[![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-1a3a5c?style=for-the-badge)](https://devtrails.guidewire.com)
[![Phase](https://img.shields.io/badge/Current%20Phase-1%20%E2%80%94%20Seed-FFD700?style=for-the-badge)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Spring%20Boot%20%7C%20Python-0077B5?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution--gigshield)
- [Persona & Real-World Scenarios](#-persona--real-world-scenarios)
- [How the Platform Works](#-how-the-platform-works)
- [Weekly Premium Model](#-weekly-premium-model)
- [Parametric Triggers](#-parametric-triggers)
- [AI & ML Integration](#-ai--ml-integration)
- [Tech Stack](#-tech-stack)
- [Phase Roadmap](#-phase-roadmap)
- [Getting Started](#-getting-started)
- [Admin Credentials (Demo)](#-admin-credentials-demo)

---

## 🚨 The Problem

Picture this — Ravi is a Swiggy delivery partner in Chennai. He wakes up at 6 AM, fuels his bike, and gears up for a full day of deliveries. Then the sky opens up. A severe thunderstorm rolls in, roads flood, and delivery zones go dark. By evening, Ravi hasn't completed a single order. He's lost an entire day's wages — somewhere between ₹800 and ₹1,200 — with nothing to show for it and no safety net to fall back on.

This is not a rare event. It happens to **millions of gig workers across India** every time there's extreme heat, heavy rainfall, a local curfew, or any disruption outside their control. India's platform-based delivery workforce — working for Zomato, Swiggy, Blinkit, Amazon, and others — forms the backbone of our digital economy, yet they carry the full weight of income loss from events they didn't cause and can't prevent.

**The numbers tell the story clearly:**

- External disruptions wipe out **20–30% of a gig worker's monthly income**
- India has over **12 million gig delivery workers** with zero income protection
- Traditional insurance products are built around monthly/annual cycles, lengthy KYC, and manual claim processes — none of which fit gig worker reality
- When disruptions hit, workers bear **100% of the financial loss** with no recourse

**GigShield exists to fix that.**

---

## 💡 Our Solution — GigShield

GigShield is an **AI-driven parametric insurance platform** built from the ground up for India's food delivery workforce — specifically partners working with Zomato and Swiggy.

The core idea is simple but powerful: instead of waiting for a worker to file a claim, gather documents, prove their loss, and wait weeks for reimbursement — GigShield watches the weather, detects disruptions automatically, and **pays the worker before they even think to file**.

No forms. No waiting. No rejection disputes. Just automatic protection.

### How GigShield is Different from Traditional Insurance

| Feature | Traditional Insurance | GigShield |
|---|---|---|
| Claim process | Manual filing required | Auto-filed by AI when disruption is detected |
| Processing time | Days to weeks | Instant — milliseconds to wallet credit |
| Premium cycle | Monthly or annual | Weekly — aligned to gig earnings cycle |
| Pricing | Fixed, one-size-fits-all | Dynamic, hyper-local per district |
| Trigger | Worker-reported incident | Objective data — weather API, government alerts |
| Transparency | Opaque approval criteria | Parametric thresholds visible to workers upfront |
| UX | Dense forms, legal language | One-tap subscription, real-time push notifications |

---

## 👤 Persona & Real-World Scenarios

### Our Primary Persona: Food Delivery Partners (Zomato & Swiggy)

These workers typically:
- Earn **₹500–₹1,500 per day** depending on order volume, distance, and tips
- Work **8–12 hours outdoors** on bikes or cycles in all weather conditions
- Operate across **urban and semi-urban districts** across India
- Have **no employer benefits** — no sick leave, no paid time off, no rainy day coverage
- Live and plan **week to week** on their earnings cycle

### Scenario 1 — The Monsoon Shutdown
> Priya is a Swiggy partner in Bengaluru. IMD issues a heavy rainfall warning for her district. By 10 AM, rainfall has crossed 115mm. Orders dry up, restaurants halt deliveries, and roads are impassable. Priya doesn't file anything. GigShield's AI detected the threshold breach at 9:47 AM, auto-filed her claim, validated it against the weather data and her active policy, and credited ₹900 to her wallet by 10:05 AM. She gets a push notification: *"Disruption detected in your area. ₹900 has been credited to your wallet."*

### Scenario 2 — The Summer Heatwave
> During a May heatwave in Hyderabad, temperatures cross 47°C — well beyond any safe outdoor working threshold. Zomato partially shuts delivery in affected zones. GigShield detects the temperature breach for Arjun's district, verifies his active Pro plan, runs a fraud check in under 2 seconds, and auto-approves the payout. Arjun wakes up to a notification that his daily coverage has been credited.

### Scenario 3 — The Sudden Curfew
> A local administrative curfew is announced in parts of Pune with less than 2 hours' notice. Delivery zones go completely dark. Workers with active GigShield policies receive automatic claim approvals for the hours they couldn't work — without submitting a single screenshot or document.

### Scenario 4 — The Manual Edge Case
> Deepak's area didn't officially cross the weather threshold, but a hyperlocal road closure blocked his entire delivery zone. He opens GigShield, taps "File a Claim", describes what happened in two sentences, and submits. The AI engine cross-references his GPS history against the reported disruption zone and approves the claim within minutes. Fraud score: 14/100 — auto-approved.

---

## 🔄 How the Platform Works

GigShield operates as a two-sided platform — a **Worker Dashboard** and an **Admin Control Panel** — backed by a 24/7 AI monitoring engine.

### The Complete Application Lifecycle

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  STEP 1 — ONBOARDING
  ├── Worker selects gig platform (Zomato / Swiggy)
  ├── UI adapts branding: colors, logos, banners
  └── Worker registers with State + District (for hyperlocal risk tagging)

  STEP 2 — SUBSCRIPTION
  ├── AI calculates weekly premium based on district risk score
  ├── Worker selects a plan and subscribes (7-day free trial for new users)
  └── System prevents duplicate active policies for the same week

  STEP 3 — AI MONITORING (Every Hour, 24/7)
  ├── AutoClaimService polls live weather API per active worker's district
  ├── Data fetched: Temperature, Rainfall, Wind Speed, Humidity, AQI
  └── Compares against admin-configured parametric triggers

  STEP 4 — THRESHOLD BREACH → AUTO CLAIM
  ├── Disruption detected (e.g., Rainfall = 118mm in worker's district)
  ├── System auto-files a claim — zero worker action needed
  ├── Python AI Fraud Engine validates in < 2 seconds
  └── Claim auto-approved — no human intervention required

  STEP 5 — INSTANT PAYOUT & NOTIFICATION
  ├── Coverage amount credited to worker's digital wallet
  ├── Real-time push notification dispatched
  └── Policy cycle ends; renewal available for next week

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 👮 Admin Module

The Admin Module is the control center where all insurance logic and financial oversight lives.

| Feature | Description |
|---|---|
| **Plan Management** | Create and configure Starter, Smart, Pro, Max plans |
| **Trigger Configuration** | Define AI parametric triggers in JSON format |
| **Automated Claim Oversight** | View auto-approved claims and manually review flagged ones |
| **Fraud Risk Scores** | Every claim carries a 0–100 AI-generated fraud score |
| **Fund Management** | Track the central insurance fund — premium inflows and claim outflows |
| **Analytics Dashboard** | Active workers, claim rates, disruption heat maps by district |
| **Support System** | Direct messaging and real-time notification push to workers |

### 👤 Worker Module

Built for speed and clarity — designed for someone checking it between deliveries on a mid-range Android phone.

| Feature | Description |
|---|---|
| **Platform-Adaptive UI** | Zomato workers see red branding; Swiggy workers see orange |
| **Smart Subscription** | One-tap weekly insurance with AI premium displayed upfront |
| **Auto-Protection** | AI files and approves claims automatically — no action needed |
| **Manual Claims** | File edge-case claims with a short description and location |
| **Wallet Interface** | Instant balance visibility, payout amounts, and timestamps |
| **Real-Time Alerts** | Push notifications on disruption detection and payout credit |

---

## 💰 Weekly Premium Model

Gig workers don't think in months — they think in weeks. GigShield's entire pricing model is structured around that reality.

### The Four Plan Tiers

| Plan | Weekly Premium | Coverage per Disruption Day | Best For |
|---|---|---|---|
| **Starter** | ₹49 / week | ₹600 | New workers, lower-income zones |
| **Smart** | ₹89 / week | ₹900 | Mid-tier earners, moderate-risk districts |
| **Pro** | ₹149 / week | ₹1,200 | Experienced workers, high-traffic zones |
| **Max** | ₹249 / week | ₹2,000 | Full-time high earners, high-risk districts |

### How Dynamic Pricing Works

The weekly premium isn't fixed — it's calculated by our AI risk engine based on four factors:

**1. District Historical Risk Score**
Districts with a documented history of flooding, extreme heat, or frequent curfews carry higher risk multipliers. A Pro plan in flood-prone Patna costs more than the same plan in Shimla.

**2. Seasonal Adjustment**
Premiums shift during peak disruption seasons. Monsoon months (June–September) and summer heatwave periods (April–June) carry automatic seasonal surcharges — typically 10–18% on base premiums.

**3. Worker Tenure & Claim History**
New workers receive introductory pricing. Workers who've gone 8+ weeks without a claim get a loyalty discount applied automatically — rewarding honesty and reducing adverse selection.

**4. Platform & Earnings Tier**
Activity signals from partner platforms help model expected daily earnings. Coverage amounts are calibrated to actual income, not arbitrary fixed values.

### New User Free Trial

First-time users receive a **7-day free trial at the Smart tier** — no card required, no conditions. The best way to build trust with a delivery worker is to let them experience an auto-payout firsthand. Once they've seen ₹900 land in their wallet during a rainstorm without filing anything, the conversion writes itself.

---

## ⚡ Parametric Triggers

Parametric insurance lives or dies by the quality of its triggers. Here's how we've designed ours — built specifically around what actually stops a food delivery partner from working.

### Environmental Triggers

| Trigger Name | Parameter Monitored | Threshold | Operator | Coverage Type |
|---|---|---|---|---|
| Extreme Heat | Temperature (°C) | 45°C | > | Full day coverage |
| Heavy Rainfall | Rainfall (mm/hr) | 50mm | > | Full day coverage |
| Severe Flood | Accumulated rainfall (mm/day) | 100mm | > | Full day coverage |
| Dangerous Wind | Wind speed (km/h) | 60 km/h | > | Full day coverage |
| High Pollution | AQI Index | 300 | > | 50% coverage |

### Social / Administrative Triggers

| Trigger Name | Detection Method | Coverage Type |
|---|---|---|
| Unplanned Curfew | Government API / news feed integration | Full day coverage |
| Delivery Zone Closure | Platform API signal (Zomato/Swiggy zone data) | Prorated by hours closed |
| Local Strike | Manual admin trigger with verification | Full day coverage (manual review) |

### Trigger Configuration Format (Admin JSON)

Admins configure triggers through the dashboard using a simple JSON schema:

```json
{
  "situation": "Summer Heatwave",
  "factor": "temperature",
  "threshold": 45,
  "operator": ">",
  "unit": "celsius",
  "coverageType": "FULL_DAY",
  "cooldownHours": 24
}
```

```json
{
  "situation": "Monsoon Flood",
  "factor": "rainfall",
  "threshold": 100,
  "operator": ">",
  "unit": "mm_per_day",
  "coverageType": "FULL_DAY",
  "cooldownHours": 12
}
```

```json
{
  "situation": "Severe Air Pollution",
  "factor": "aqi",
  "threshold": 300,
  "operator": ">",
  "unit": "index",
  "coverageType": "HALF_DAY",
  "cooldownHours": 24
}
```

All active triggers are displayed to workers in plain language on their dashboard — full transparency on exactly what conditions trigger a payout.

---

## 🤖 AI & ML Integration

AI isn't a feature layer on top of GigShield — it runs the core of every financial decision the platform makes.

### 1. Dynamic Premium Calculation (Risk Engine)

A regression-based risk scoring model that runs weekly per worker and ingests:
- 5-year historical weather data for the worker's district
- Historical claim frequency and severity per district and season
- Worker profile signals: tenure, platform, earnings tier, claim history
- Real-time seasonal weather forecasts

**Output:** A district-level risk multiplier applied to base plan premiums. The model retrains monthly as new claims data flows in, improving accuracy over time.

### 2. Fraud Detection Engine (Python + FastAPI)

Every single claim — auto-filed or manual — passes through the fraud engine before any payout:

- **Anomaly Detection** — Flags claims where the reported disruption doesn't match actual weather station readings for that district
- **Location Validation** — Cross-references the worker's GPS activity log against the disruption zone boundaries
- **Duplicate Prevention** — Ensures no worker receives more than one payout per disruption event per active policy period
- **Behavioral Scoring** — Builds a rolling claim profile; workers with unusual claim frequency patterns are flagged for manual review

**Fraud Score Logic:**

| Score Range | Action |
|---|---|
| 0 – 20 | Auto-approved immediately |
| 21 – 60 | Approved + logged for audit review |
| 61 – 85 | Flagged for admin manual review |
| 86 – 100 | Auto-rejected + worker notified with reason |

### 3. AutoClaimService — The 24/7 Monitoring Heartbeat

```
Every Hour:
  ┌─────────────────────────────────────────────────────┐
  │  Fetch all active worker policies                   │
  │  For each worker:                                   │
  │    → Pull real-time weather for their district      │
  │    → Compare against all active parametric triggers │
  │    → If breach detected AND no claim this cycle:    │
  │        → Auto-create claim record                   │
  │        → Run fraud check (Python engine)            │
  │        → Score < 20  → Auto-approve + payout        │
  │        → Score 20-60 → Approve + audit log          │
  │        → Score > 60  → Flag for admin review        │
  └─────────────────────────────────────────────────────┘
```

### 4. Natural Language Claim Assistant *(Phase 2)*

For manual claims, workers will be able to describe what happened in plain language — or via voice-to-text in Hindi and regional languages. The AI assistant parses the description, extracts disruption details, and pre-fills the claim form automatically.

---

## 🛠️ Tech Stack

### Why This Stack?

We chose technologies that are production-proven, well-documented, and suited to the rapid iteration required across 6 weeks — without compromising the architectural quality expected of a real insurance platform.

### Frontend

| Technology | Role |
|---|---|
| **React.js** | Component-based SPA for both Worker Dashboard and Admin Panel |
| **Tailwind CSS** | Utility-first styling with dynamic platform-adaptive theming |
| **Framer Motion** | Smooth animations for wallet credits, claim status updates, onboarding |

**Why Web over Mobile?**
Delivery workers frequently switch phones, share devices, or use low-end handsets. A responsive web app with PWA capabilities reaches everyone without requiring an app store download, and still enables push notifications and offline access.

### Backend

| Technology | Role |
|---|---|
| **Java 17 + Spring Boot** | Core REST API — policy management, claims, wallet, auth |
| **Spring Security + JWT** | Stateless authentication for both worker and admin sessions |
| **Hibernate / JPA** | ORM layer — clean entity management with MySQL |
| **Spring Scheduler** | Powers the `AutoClaimService` hourly background monitoring job |

### AI Engine

| Technology | Role |
|---|---|
| **Python 3.11** | Core ML logic — fraud detection and risk scoring |
| **FastAPI** | High-performance API layer between Java backend and Python AI services |
| **scikit-learn** | Regression-based risk scoring and anomaly detection models |
| **OpenWeatherMap API** | Real-time weather data — temperature, rainfall, wind, humidity, AQI |

### Database & Payments

| Technology | Role |
|---|---|
| **MySQL** | Primary relational database — policies, claims, wallets, transactions |
| **Razorpay (Test Mode)** | Simulated instant wallet payouts for demo purposes |

### System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│              Worker Dashboard  |  Admin Control Panel        │
└────────────────────────┬─────────────────────────────────────┘
                         │  REST API (JWT Auth)
┌────────────────────────▼─────────────────────────────────────┐
│                  Spring Boot Backend (Java 17)                │
│                                                              │
│   PolicyService  │  ClaimService   │  WalletService          │
│   UserService    │  PlanService    │  NotificationService     │
│   AutoClaimService (Spring Scheduler — runs every 1 hour)    │
└───────────┬──────────────────────────────┬───────────────────┘
            │                              │
┌───────────▼──────────┐   ┌──────────────▼──────────────────┐
│       MySQL DB        │   │     Python AI Engine (FastAPI)  │
│                       │   │                                 │
│  Users    Policies    │   │  PremiumScorer (scikit-learn)   │
│  Plans    Claims      │   │  FraudDetector (anomaly model)  │
│  Wallets  Triggers    │   │  WeatherAPIClient (OWM)         │
│  Transactions         │   │  AutoClaimProcessor             │
└───────────────────────┘   └─────────────────────────────────┘
```

---

## 📅 Phase Roadmap

This project is built across **3 phases over 6 weeks** as part of Guidewire DEVTrails 2026. Each phase builds directly on the last — foundation, then full automation, then polish and scale.

---

### ✅ Phase 1 — Seed (Weeks 1–2): Ideation & Foundation

> **Theme:** *Ideate & Know Your Delivery Worker*
> **Deadline:** March 20, 2026
> **Status:** ✅ Complete

This phase is about deeply understanding the problem, making the right architectural and product decisions, and building the working foundation that Phase 2 and 3 will scale on.

**What We Defined & Built:**

- [x] Chosen delivery persona: Food Delivery Partners (Zomato & Swiggy)
- [x] Mapped the complete application lifecycle and all user flows
- [x] Designed 4-tier weekly premium model with dynamic AI pricing logic
- [x] Defined 5 environmental + 3 social parametric triggers with threshold values
- [x] Finalized full tech stack and system architecture
- [x] Built core Spring Boot project structure with JWT authentication
- [x] Created MySQL schema: Users, Plans, Policies, Claims, Wallets, Triggers
- [x] Implemented `PlanService` — seeds 4 default plans + triggers on startup
- [x] Built React frontend foundation with platform-adaptive theming (Zomato/Swiggy)
- [x] Integrated OpenWeatherMap API for real-time weather data polling
- [x] Built Admin Panel skeleton: plan management, user overview, claim dashboard
- [x] Built Python FastAPI AI engine scaffold with fraud scoring model structure

**Phase 1 Deliverables:**

- [x] README (this document)
- [ ] GitHub repository link *(add here)*
- [ ] 2-minute prototype walkthrough video *(add link here)*

---

### 🔲 Phase 2 — Scale (Weeks 3–4): Automation & Protection

> **Theme:** *Protect Your Worker*
> **Deadline:** April 4, 2026
> **Status:** 🔲 Upcoming

Phase 2 is where the platform comes fully alive. Every core flow needs to be demonstrable end-to-end — from a worker signing up for the first time to receiving an automatic payout without touching anything.

**Planned Deliverables:**

- [ ] Complete user registration and onboarding flow with platform selection and district geo-tagging
- [ ] Fully functional insurance policy management — purchase, active status, expiry, renewal
- [ ] Live dynamic premium calculation powered by the AI risk engine with district-level scoring
- [ ] Complete claims management system:
  - Auto-claim filing and instant approval when weather thresholds are breached
  - Manual claim submission with AI validation against GPS history
  - Fraud risk scores displayed on admin dashboard with review workflow
- [ ] Wallet system — fund crediting, balance display, full transaction history
- [ ] Real-time push notifications for claim approvals and disruption alerts
- [ ] 3–5 fully connected parametric triggers running against live weather API
- [ ] Admin analytics dashboard — active policy count, live claim feed, fund balance
- [ ] 2-minute demo video showing end-to-end claim automation

**AI Focus for Phase 2:**

- Deploy dynamic pricing ML model with district-level risk multipliers
- Implement fraud detection engine with GPS validation, weather verification, and duplicate prevention
- Tune fraud score thresholds against synthetic test claim data

---

### 🔲 Phase 3 — Soar (Weeks 5–6): Scale & Optimise

> **Theme:** *Perfect for Your Worker*
> **Deadline:** April 17, 2026
> **Status:** 🔲 Upcoming

Phase 3 is about hardening the intelligence, proving financial viability, and delivering a polished product that judges — and real workers — would actually trust.

**Planned Deliverables:**

- [ ] Advanced fraud detection:
  - GPS spoofing detection for workers claiming disruptions outside their actual location
  - Fake weather claim detection using historical data cross-referencing
  - Cross-platform delivery activity correlation (if platform API signals available)
- [ ] Instant payout system — Razorpay test mode integrated end-to-end for realistic payment demonstration
- [ ] Intelligent Worker Dashboard:
  - Weekly earnings protected (cumulative)
  - Active coverage status with days remaining
  - Disruption history and payout log
- [ ] Intelligent Admin Dashboard:
  - Loss ratios by district and plan tier
  - Predictive analytics — forecast next week's likely disruption claims based on weather models
  - Fund health projections
- [ ] Final 5-minute demo video with simulated disruption walkthrough (triggering a fake storm → auto-claim → instant wallet credit, all visible in real time)
- [ ] Final pitch deck (PDF) covering persona, AI architecture, fraud model, and business viability of weekly pricing model

---

## 🚀 Getting Started

### Prerequisites

```bash
# Java
Java 17+

# Node.js (for React frontend)
Node.js 18+

# Python (for AI engine)
Python 3.11+

# MySQL
MySQL 8.0+
```

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/gigshield.git
cd gigshield/backend

# Configure database in application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/gigshield
spring.datasource.username=your_username
spring.datasource.password=your_password

# Run the Spring Boot application
./mvnw spring-boot:run
# Plans and triggers are auto-seeded on startup
```

### AI Engine Setup

```bash
cd gigshield/ai-engine

# Install dependencies
pip install -r requirements.txt

# Set your OpenWeatherMap API key
export OWM_API_KEY=your_api_key_here

# Start the FastAPI server
uvicorn main:app --reload --port 8001
```

### Frontend Setup

```bash
cd gigshield/frontend

# Install dependencies
npm install

# Start the React development server
npm start
# Runs on http://localhost:3000
```

---

## 🔑 Admin Credentials (Demo)

```
Email:    Gigadmin@gmail.com
Password: gigadmin@123
```

> ⚠️ These credentials are for demonstration purposes only. Change before any production deployment.

---

## 👥 Team

> *Add your team member names, roles, and university here.*

| Name | Role |
|---|---|
| Member 1 | Backend (Spring Boot) |
| Member 2 | Frontend (React) |
| Member 3 | AI Engine (Python) |
| Member 4 | UI/UX & Product |

---

## 📄 License

This project is built for the Guidewire DEVTrails 2026 University Hackathon.

---

<div align="center">

**GigShield — Empowering India's Gig Economy with AI & Automation**

*Built with care for India's 12 million gig delivery workers.*

</div>
