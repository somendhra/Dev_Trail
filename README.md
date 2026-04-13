# 🛡️ GigShield — AI-Powered Parametric Insurance for India's Gig Economy

> *"Every rainstorm shouldn't mean an empty wallet."*

[![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-1a3a5c?style=for-the-badge)](https://devtrails.guidewire.com)
[![Phase](https://img.shields.io/badge/Current%20Phase-1%20%E2%80%94%20Seed-FFD700?style=for-the-badge)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Spring%20Boot%20%7C%20Python-0077B5?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Status-50%25%20Complete-yellow?style=for-the-badge)]()
[![Critical Missing](https://img.shields.io/badge/Critical%20Gap-Parametric%20Triggers%20Not%20Implemented-red?style=for-the-badge)]()

---

## ⚠️ **IMPORTANT: VERIFIED STATUS**

**Before using this README for presentations or documentation, please read this verification notice:**

This project has significant gaps between the original vision and current implementation:

### ✅ **ACTUALLY WORKING:**
- User registration & authentication (with JWT)
- Insurance plan management
- Subscription/policy purchase flow
- Admin dashboard with user management
- Basic payment gateway structure
- Notification system (mock email)
- Support query system
- Beautiful responsive UI (13 pages)

### ❌ **CRITICAL GAPS (Not Implemented):**
- **Parametric Triggers System** - Core insurance feature
- **Weather Data Integration** - No weather service  
- **Automatic Claim Processing** - AutoClaimService exists but not functional
- **Fraud Detection** - AIService is just a scaffold
- **Real-time Notifications** - No push notification system
- **Transaction History** - Wallet balance stored but no transaction tracking

**See [Known Issues & Things to Modify](#-known-issues--things-to-modify-verified) section for complete details.**

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution--gigshield)
- [Persona & Real-World Scenarios](#-persona--real-world-scenarios)
- [How the Platform Works](#-how-the-platform-works)
- [Weekly Premium Model](#-weekly-premium-model)
- [Parametric Triggers](#-parametric-triggers)
- [Tech Stack & Technologies Used](#-tech-stack--technologies-used)
- [Project Architecture](#-project-architecture)
- [Project Progress & Feature Completion Status](#-project-progress--feature-completion-status)
- [Features Completed](#-features-completed)
- [Features in Development](#-features-in-development)
- [Known Issues & Things to Modify](#-known-issues--things-to-modify)
- [Folder Structure](#-folder-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Phase Roadmap](#-phase-roadmap)
- [Getting Started](#-getting-started)
- [Admin Credentials (Demo)](#-admin-credentials-demo)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

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

## 🛠️ Tech Stack & Technologies Used

### Frontend Stack
- **React.js 18.2.0** - Component-based UI framework
- **React Router Dom 6.14.1** - Client-side routing
- **Tailwind CSS 3.4.0** - Utility-first styling framework
- **Vite 5.0.0** - Fast build tool and dev server
- **Firebase 12.10.0** - Authentication and backend services
- **React Icons 5.6.0** - Icon library
- **PostCSS 8.4.0** - CSS transformation
- **Autoprefixer 10.4.0** - CSS vendor prefixes

### Backend Stack
- **Java 17** - Primary language
- **Spring Boot 3.2.0** - Web framework
- **Spring Web** - REST API development
- **Spring Data JPA** - Object-Relational Mapping
- **Spring Security 6.5.9** - Authentication/Authorization
- **JWT (JJWT 0.11.5)** - JSON Web Tokens for stateless auth
- **MySQL Connector 8.4.0** - Database driver
- **Spring Boot Mail** - Email notifications
- **Razorpay Java 1.4.3** - Payment gateway SDK
- **Tomcat 10.1.52** - Embedded servlet container
- **Logback 1.4.14** - Logging framework
- **Spring Validation** - Bean validation

### Database
- **MySQL 8.0+** - Relational database
  - Users (with walletBalance field)
  - Partners
  - Admins  
  - Plans
  - Subscriptions
  - ClaimRequests
  - Payments
  - Notifications
  - Queries

### AI & ML Engine (Planned)
- **Python 3.11** - ML programming
- **FastAPI 0.115.0** - Python API server
- **Uvicorn 0.30.0** - ASGI server
- **Pydantic 2.10.0** - Data validation
- **scikit-learn** - Machine learning (to be implemented)

### External APIs & Services (Configured but Not Fully Integrated)
- **OpenWeatherMap API** - Weather data (needs integration)
- **Razorpay Payment Gateway** - Payment processing (test mode)

### Development Tools
- **Maven** - Java dependency management
- **Vite** - Frontend bundler
- **Playwright** - E2E testing (configured, not implemented)

---

## ✅ Actually Implemented Controllers

| Controller | Endpoints | Purpose |
|-----------|-----------|---------|
| **AuthController** | POST /auth/register, /auth/login | User & Partner authentication |
| **AdminController** | GET/PUT/DELETE admin operations | Admin panel & user management |
| **PartnerController** | Partner profile & info | Partner/delivery worker info |
| **PlanController** | GET /plans, plan details | Insurance plan management |
| **SubscriptionController** | POST/GET subscriptions | Policy purchase & management |
| **ClaimController** | POST/GET claims | Claim submission & tracking |
| **ClaimRequestController** | Claim request operations | Claim request handling |
| **PaymentGatewayController** | Razorpay order & verify | Payment processing |
| **NotificationController** | GET/PUT notifications | Notification management |
| **QueryController** | Support queries | Customer support queries |
| **AIController** | AI operations | AI/fraud detection (scaffold) |

---

## ✅ Actual Database Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| **User** | users | Partner/worker profile |
| **Partner** | partners | Delivery partner details |
| **Admin** | admins | Admin user accounts |
| **Plan** | plans | Insurance plan definitions |
| **Subscription** | subscriptions | User subscriptions/policies |
| **ClaimRequest** | claim_requests | Claim tracking |
| **Payment** | payments | Payment records |
| **Notification** | notifications | Alert notifications |
| **Query** | queries | Support queries |

---

## ✅ Actual Services Implemented

| Service | Purpose | Status |
|---------|---------|--------|
| **UserService** | User management | ✅ Implemented |
| **AdminService** | Admin operations | ✅ Implemented |
| **PlanService** | Plan operations | ✅ Implemented |
| **SubscriptionService** | Subscription management | ✅ Implemented |
| **ClaimService** | Claim processing | ✅ Implemented |
| **EmailService** | Email notifications | ✅ Partial (mock mode) |
| **RazorpayService** | Payment processing | ✅ Configured |
| **QueryService** | Support queries | ✅ Implemented |
| **AIService** | AI operations | 🔲 Scaffold only |
| **AutoClaimService** | Auto-claim scheduling | 🔲 Not connected |
| **MyUserDetailsService** | User authentication details | ✅ Implemented |

---

## ❌ NOT Implemented (Despite README Claims)

The following features mentioned in original README are **NOT currently implemented**:

- ❌ **Parametric Triggers System** - No trigger entity or detection
- ❌ **Weather Service** - No OpenWeatherMap integration
- ❌ **Fraud Detection** - No risk scoring or fraud checking
- ❌ **Wallet Service** - Only walletBalance field in User
- ❌ **Transaction Tracking** - No detailed transaction history
- ❌ **Automatic Claim Processing** - AutoClaimService exists but not functional
- ❌ **Trigger-based Payouts** - Weather monitoring not implemented
- ❌ **Real-time Notifications** - No push notification system
- ❌ **Monthly/Weekly Pricing** - No dynamic premium calculation
- ❌ **District-level Analytics** - No reporting system

---

## 🏗️ Project Architecture

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React.js)                       │
│  ┌──────────────┬──────────────┬──────────────┬─────────────────┐  │
│  │ Landing Page │ Worker       │  Admin Panel │ Chat Support   │  │
│  │              │ Dashboard    │              │ & Notifications│  │
│  └──────────────┴──────────────┴──────────────┴─────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │  REST API (JWT Authentication)
                         │  Port: 4000
┌────────────────────────▼────────────────────────────────────────────┐
│                Spring Boot Backend (Java 17)                        │
│  Port: 4000                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ REST API Controllers                                          │  │
│  │ ├─ AuthController (Login, Register, JWT generation)          │  │
│  │ ├─ AdminController (Admin operations)                        │  │
│  │ ├─ UserController (User profile management)                  │  │
│  │ ├─ PlansController (Insurance plans management)              │  │
│  │ ├─ PoliciesController (Policy purchase & status)             │  │
│  │ ├─ ClaimsController (Claim submission & tracking)            │  │
│  │ ├─ WalletsController (Wallet balance & transactions)         │  │
│  │ ├─ TriggersController (Parametric trigger config)            │  │
│  │ └─ NotificationsController (Alert management)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Service Layer                                                │  │
│  │ ├─ AuthService (authentication logic)                        │  │
│  │ ├─ UserService (user management)                             │  │
│  │ ├─ PlanService (plan operations)                             │  │
│  │ ├─ PolicyService (policy creation & management)              │  │
│  │ ├─ ClaimService (claim processing)                           │  │
│  │ ├─ WalletService (wallet transactions)                       │  │
│  │ ├─ AutoClaimService (automated claim filing & trigger check) │  │
│  │ ├─ NotificationService (push notifications)                  │  │
│  │ └─ WeatherService (weather API integration)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Scheduler (Spring Scheduler)                                 │  │
│  │ ├─ Auto-claim hourly job                                     │  │
│  │ ├─ Daily fraud checks                                        │  │
│  │ └─ Weekly premium recalculation                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────┬───────────────────────────────────┬───────────────────┘
             │                                   │
    ┌────────▼────────┐              ┌───────────▼──────────────┐
    │   MySQL (Port:  │              │  Python AI Engine        │
    │   3306)         │              │  (FastAPI) Port: 8000    │
    │                 │              │                          │
    │ ┌─────────────┐ │              │  ┌─────────────────────┐ │
    │ │ users       │ │              │  │ Fraud Detector      │ │
    │ ├─────────────┤ │              │  │ - Anomaly Detection │ │
    │ │ plans       │ │              │  │ - Location Check    │ │
    │ ├─────────────┤ │              │  │ - Duplicate Check   │ │
    │ │ policies    │ │              │  │                     │ │
    │ ├─────────────┤ │              │  ├─────────────────────┤ │
    │ │ claims      │ │              │  │ Risk Scorer         │ │
    │ ├─────────────┤ │              │  │ - Premium Calc      │ │
    │ │ wallets     │ │              │  │ - Regression Model  │ │
    │ ├─────────────┤ │              │  │                     │ │
    │ │ triggers    │ │              │  ├─────────────────────┤ │
    │ ├─────────────┤ │              │  │ Weather Service     │ │
    │ │ transactions│ │              │  │ - OpenWeatherMap    │ │
    │ └─────────────┘ │              │  └─────────────────────┘ │
    └─────────────────┘              └──────────────────────────┘
```

### Data Flow for Automatic Claim Processing

```
1. Hourly Trigger (Spring Scheduler)
   ↓
2. Fetch all active policies from database
   ↓
3. For each policy:
   a) Get worker's district
   b) Fetch current weather from OpenWeatherMap API
   c) Check against all parametric triggers
   ↓
4. If trigger breached AND no claim already filed this cycle:
   a) Create claim record
   b) Send to Python AI Engine via FastAPI
   ↓
5. AI Engine performs fraud check:
   a) Check for duplicate claims
   b) Validate location via GPS
   c) Score anomalies (0-100)
   ↓
6. Score-based decision:
   - Score 0-20: Auto-approved → Create transaction → Update wallet
   - Score 21-60: Approved + logged for audit
   - Score 61-100: Flagged for admin review → Sent to admin dashboard
   ↓
7. Notification service sends push alert to worker
   ↓
8. Wallet balance updated immediately for approved claims
```

---

## 📊 Project Progress & Feature Completion Status

### Overall Progress: **~50% Complete**

#### By Module:
- **Backend Core**: 65% ✅
- **Frontend UI**: 65% ✅
- **Payment Integration**: 40% 🔲
- **AI/ML Engine**: 30% 🔲
- **Testing & Deployment**: 10% 🔲

---

## ✅ Features Actually Completed

### Authentication & User Management
- ✅ User/Partner registration with email validation
- ✅ Login with OTP (email-based, mock mode available for testing)
- ✅ Admin authentication and login
- ✅ JWT token generation and validation
- ✅ User profile management
- ✅ Admin user management
- ✅ Role-based access control (Partner vs Admin)

### Insurance Plans & Subscriptions
- ✅ Multiple insurance plans with pricing tiers
- ✅ Plan selection and subscription flow
- ✅ Subscription activation and tracking
- ✅ Subscription status (TRIAL, PENDING, ACTIVE, EXPIRED, CANCELLED)
- ✅ Premium pricing model
- ✅ Auto-seeding of default plans on application startup
- ✅ Subscription management (view, renew, cancel)

### User Interface Pages
- ✅ Landing page with feature overview
- ✅ Login & registration pages
- ✅ Worker/Partner dashboard
- ✅ Plans page with details
- ✅ Payment/Wallet display
- ✅ Claims submission and tracking
- ✅ Notifications page
- ✅ Chat support interface
- ✅ Reports page
- ✅ Insights page
- ✅ Profile page
- ✅ Admin dashboard
- ✅ Navigation components (Navbar, Sidebar, Bottom Nav)
- ✅ Responsive design across all pages

### Database Schema (9 Entities)
- ✅ Users table with walletBalance field
- ✅ Partners table for delivery partner info
- ✅ Admins table for admin users
- ✅ Plans table with pricing and details
- ✅ Subscriptions table with status tracking
- ✅ ClaimRequests table for claim tracking
- ✅ Payments table for payment records
- ✅ Notifications table for alert management
- ✅ Query/Support table for customer support

### Admin Panel Features
- ✅ Admin login and authentication
- ✅ User management (view, edit, delete)
- ✅ Plan management (view, create, edit)
- ✅ Query/Support management with reply system
- ✅ Claims overview
- ✅ Basic analytics

### Payment & Wallet System
- ✅ Wallet balance tracking (in User entity)
- ✅ Payment gateway integration structure
- ✅ Razorpay configuration (in test mode)
- ✅ Payment order creation
- ✅ Payment verification logic

### Notifications & Support
- ✅ Notification system with status tracking
- ✅ Query/Support messaging system
- ✅ Email notifications (mock mode available)
- ✅ Notification cards and displays

### UI Components
- ✅ Navbar component
- ✅ Sidebar navigation
- ✅ Bottom navigation bar
- ✅ Payment/transaction cards
- ✅ Claims status display
- ✅ Plan cards with details
- ✅ Notification cards
- ✅ Profile cards
- ✅ Report cards
- ✅ Chat message components
- ✅ Protected route wrapper

---

## 🔲 Features in Development / Missing

### Parametric Triggers System
- 🔲 Trigger definition and configuration system (NOT IMPLEMENTED)
- 🔲 Environmental trigger detection (heat, rainfall, flooding, wind, pollution)
- 🔲 Social/Administrative triggers (curfues, zone closures)
- 🔲 Trigger threshold breach detection
- 🔲 Weather data integration for trigger monitoring

### Automatic Claim Processing
- 🔲 Automatic claim filing when triggers are breached
- 🔲 Hourly scheduled claim check job
- 🔲 Real-time weather API polling
- 🔲 Automatic claim approval workflow

### Fraud Detection & AI
- 🔲 AI fraud scoring engine
- 🔲 Anomaly detection model
- 🔲 GPS location validation
- 🔲 Duplicate claim prevention
- 🔲 Connection between Python AI engine and Java backend

### Weather Integration
- 🔲 Live OpenWeatherMap API integration
- 🔲 Real-time weather data fetching
- 🔲 District-level weather monitoring
- 🔲 Weather alert system

### Real-time Features
- 🔲 Push notifications for disruption alerts
- 🔲 Real-time claim processing feedback
- 🔲 WebSocket integration for live updates
- 🔲 Live weather data updates on dashboard

### Analytics & Reporting
- 🔲 Claims statistics and trends
- 🔲 Fraud analytics
- 🔲 District-wise claim reports
- 🔲 Premium collection analytics
- 🔲 Predictive analytics for claim forecasting

### Advanced Features
- 🔲 Claim dispute/appeal system
- 🔲 Chat support integration with AI
- 🔲 Mobile-specific optimizations
- 🔲 Progressive Web App (PWA) capabilities
- 🔲 Offline access features

---

## ⚠️ Known Issues & Things to Modify (VERIFIED)

### 🔴 CRITICAL ISSUES (Must Fix)

1. **No Parametric Triggers System**
   - **Impact:** Automatic claims cannot be filed based on weather or disruptions
   - **Status:** Not started
   - **Fix Needed:** 
     - Create Trigger entity and TriggerRepository
     - Build trigger configuration system
     - Implement trigger breach detection logic
   - **Files to Create:** TriggerService, TriggerController, Trigger.java model

2. **No Wallet/Transaction Management** 
   - **Issue:** Wallet balance stored in User table, but no transaction tracking
   - **Impact:** Cannot properly track payment history or wallet changes
   - **Status:** Partial (balance field exists, no transaction logic)
   - **Fix Needed:**
     - Create comprehensive transaction tracking
     - Implement wallet credit/debit operations
     - Build transaction history display
   - **Note:** Payment table exists but needs proper transaction linking

3. **OTP Email Delivery - Mock Mode Only** 🔴
   - **Issue:** Email notifications only work in mock mode
   - **Workaround:** `EMAIL_MOCK_ENABLED=true` logs OTP to console
   - **Fix Needed:** Configure real SMTP credentials
   - **Files Involved:** [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties)

4. **Automatic Claim Processing Not Connected** 🔴
   - **Issue:** AutoClaimService exists but weather monitoring not implemented
   - **Impact:** Workers don't receive automatic payouts
   - **Fix Needed:** 
     - Implement weather API polling
     - Connect trigger checking logic
     - Link to fraud detection engine
   - **Files Involved:** AutoClaimService.java, need WeatherService

5. **No Weather Service** 🔴
   - **Issue:** OpenWeatherMap API integration missing
   - **Impact:** Cannot fetch real-time weather data for trigger checking
   - **Fix Needed:**
     - Create WeatherService with OWM API integration
     - Add API key configuration
     - Implement error handling
   - **Files to Create:** WeatherService.java

6. **Python AI Engine Not Connected** 🔴
   - **Issue:** AIService exists but no communication with Python backend
   - **Impact:** No fraud detection or risk scoring happening
   - **Fix Needed:**
     - Implement HTTP client to call Python FastAPI endpoints
     - Create request/response models
     - Handle AI engine failures gracefully
   - **Files Involved:** AIService.java, need to call ai-model endpoints

### 🟡 HIGH PRIORITY ISSUES (Should Fix)

7. **No Fraud Detection Service** 🟡
   - **Issue:** AIService skeleton exists but not fully implemented
   - **Fix Needed:**
     - Complete fraud detection logic
     - Implement location validation
     - Add duplicate prevention
   - **Files Involved:** AIService.java

8. **Payment Integration Incomplete** 🟡
   - **Issue:** Razorpay configured but not fully integrated with wallet
   - **Fix Needed:**
     - Link payment confirmations to wallet updates
     - Implement payment verification
     - Add payment failure handling
   - **Files Involved:** PaymentGatewayController, RazorpayService

9. **Frontend-Backend API Sync Issues** 🟡
   - **Issue:** Some API endpoints may not match between frontend and backend
   - **Fix Needed:**
     - Audit all API calls in [frontend/src/api.js](frontend/src/api.js)
     - Verify endpoints match backend routing
     - Add proper error handling
   - **Files Involved:** [frontend/src/api.js](frontend/src/api.js), all controllers

10. **JWT Token Persistence** 🟡
    - **Issue:** Frontend may not properly store/manage JWT tokens
    - **Fix Needed:**
      - Implement localStorage/sessionStorage
      - Add token refresh logic
      - Implement auto-logout on expiry
    - **Files Involved:** [frontend/src/api.js](frontend/src/api.js)

11. **No Test Coverage** 🟡
    - **Issue:** Unit and integration tests not implemented
    - **Status:** 0% code coverage
    - **Fix Needed:** Create tests using JUnit 5, Jest, Playwright
    - **Files Involved:** All test directories are empty

12. **Security Issues** 🟡
    - **Issues:**
      - Demo credentials visible in README (Gigadmin@gmail.com)
      - Database credentials in application.properties
      - No HTTPS enforcement
      - No rate limiting
      - No CSRF protection
    - **Fix Needed:** Implement Spring Security best practices
    - **Priority:** Before any production deployment

### 🟢 MEDIUM PRIORITY (Should Improve)

13. **Database Design** 🟢
    - Missing proper notification status tracking
    - Could optimize query repository more
    - Missing proper indexes for performance

14. **Error Handling** 🟢
    - Inconsistent error responses across endpoints
    - Missing proper validation messages
    - Need standardized error format

15. **Logging** 🟢
    - Minimal logging in services
    - No request/response logging
    - Missing debug information

16. **Documentation** 🟢
    - No inline code comments
    - Missing API documentation/Swagger
    - No deployment guide
    - Missing database schema documentation

---

## 📁 Folder Structure

```
gigshield/
│
├── README.md                          # Project documentation (this file)
├── pyrightconfig.json                 # Python type checking configuration
├── start.bat                          # Windows startup script (runs all services)
├── start.sh                           # Unix/Linux startup script
│
├── backend/                           # Spring Boot Backend (Java 17)
│   ├── pom.xml                        # Maven dependencies and build config
│   ├── Dockerfile                     # Docker containerization for backend
│   │
│   ├── src/main/java/com/example/aiinsurance/
│   │   ├── AiInsuranceApplication.java    # Spring Boot entry point
│   │   ├── AdminInitializer.java          # Initialization logic (seed data)
│   │   │
│   │   ├── controller/                    # REST API Endpoints (11 controllers)
│   │   │   ├── AuthController.java        # User/Partner registration & login
│   │   │   ├── AdminController.java       # Admin panel operations
│   │   │   ├── PartnerController.java     # Delivery partner management
│   │   │   ├── PlanController.java        # Insurance plans API
│   │   │   ├── SubscriptionController.java# Subscription/policy management
│   │   │   ├── ClaimController.java       # Claim operations
│   │   │   ├── ClaimRequestController.java# Claim request handling
│   │   │   ├── PaymentGatewayController.java # Razorpay integration
│   │   │   ├── NotificationController.java# Alert management
│   │   │   ├── QueryController.java       # Support queries
│   │   │   └── AIController.java          # AI operations (scaffold)
│   │   │
│   │   ├── service/                       # Business Logic Layer (11 services)
│   │   │   ├── UserService.java           # User/Partner management
│   │   │   ├── AdminService.java          # Admin operations
│   │   │   ├── PlanService.java           # Insurance plan operations
│   │   │   ├── SubscriptionService.java   # Subscription lifecycle
│   │   │   ├── ClaimService.java          # Claim processing & approval
│   │   │   ├── RazorpayService.java       # Payment gateway operations
│   │   │   ├── EmailService.java          # Email notifications (mock mode)
│   │   │   ├── QueryService.java          # Support query management
│   │   │   ├── AIService.java             # AI operations (scaffold)
│   │   │   ├── AutoClaimService.java      # Auto-claim scheduler (not connected)
│   │   │   └── MyUserDetailsService.java  # User authentication details
│   │   │
│   │   ├── model/                         # JPA Entity Classes (9 entities)
│   │   │   ├── User.java                  # Worker/Partner user with walletBalance
│   │   │   ├── Partner.java               # Delivery partner details
│   │   │   ├── Admin.java                 # Admin user accounts
│   │   │   ├── Plan.java                  # Insurance plan definitions
│   │   │   ├── Subscription.java          # User subscriptions (not Policy)
│   │   │   ├── ClaimRequest.java          # Claim requests (not Claim)
│   │   │   ├── Payment.java               # Payment records (not Transaction)
│   │   │   ├── Notification.java          # Alert notifications
│   │   │   └── Query.java                 # Support/query messages
│   │   │
│   │   ├── repository/                    # JPA Repository Interfaces (9 repos)
│   │   │   ├── UserRepository.java
│   │   │   ├── PartnerRepository.java
│   │   │   ├── AdminRepository.java
│   │   │   ├── PlanRepository.java
│   │   │   ├── SubscriptionRepository.java
│   │   │   ├── ClaimRequestRepository.java
│   │   │   ├── PaymentRepository.java
│   │   │   ├── NotificationRepository.java
│   │   │   └── QueryRepository.java
│   │   │
│   │   └── security/                      # Security Configuration
│   │       ├── SecurityConfig.java        # Spring Security setup
│   │       ├── JwtAuthenticationFilter.java # JWT token filter
│   │       ├── JwtProvider.java           # JWT token generation/validation
│   │       └── CustomUserDetailsService.java # User details for auth
│   │
│   ├── src/main/resources/
│   │   ├── application.properties         # Application configuration
│   │   │                                  # Database, email, API keys
│   │   ├── application-test.properties    # Test configuration
│   │   │
│   │   └── static/images/                 # Static assets
│   │       ├── zomato-logo.png
│   │       ├── swiggy-logo.png
│   │       └── ... other images
│   │
│   ├── src/test/java/com/example/aiinsurance/
│   │   ├── controller/                    # Controller tests (NOT YET IMPLEMENTED)
│   │   │   ├── AdminControllerTest.java
│   │   │   └── AuthControllerTest.java
│   │   └── service/                       # Service tests (NOT YET IMPLEMENTED)
│   │       └── PlanServiceTest.java
│   │
│   └── target/                            # Build output (generated)
│       ├── classes/
│       ├── test-classes/
│       ├── surefire-reports/              # Test reports
│       └── ai-insurance-backend-0.0.1-SNAPSHOT.jar.original
│
├── frontend/                          # React Frontend (Vite)
│   ├── package.json                   # NPM dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.cjs             # Tailwind CSS customization
│   ├── postcss.config.cjs              # PostCSS plugins
│   ├── index.html                     # HTML entry point
│   ├── Dockerfile                     # Docker containerization
│   │
│   ├── src/
│   │   ├── main.jsx                   # React entry point (renders App)
│   │   ├── App.jsx                    # Root App component & routes
│   │   ├── api.js                     # Axios API client & endpoints
│   │   ├── firebase.js                # Firebase initialization
│   │   ├── index.css                  # Global styles
│   │   │
│   │   ├── pages/                     # Page components (full pages)
│   │   │   ├── Landing.jsx            # Home page with features
│   │   │   ├── Login.jsx              # User login page
│   │   │   ├── Register.jsx           # User registration page
│   │   │   ├── Dashboard.jsx          # Worker main dashboard
│   │   │   ├── Plans.jsx              # Insurance plan selection
│   │   │   ├── Claims.jsx             # Claims submission & history
│   │   │   ├── Notifications.jsx      # Alerts & notifications
│   │   │   ├── Payment.jsx            # Wallet & payment display
│   │   │   ├── Profile.jsx            # User profile settings
│   │   │   ├── ChatSupport.jsx        # Chat support interface
│   │   │   ├── Insights.jsx           # Analytics & insights
│   │   │   ├── Reports.jsx            # Report generation
│   │   │   └── AdminDashboard.jsx     # Admin control panel
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx             # Top navigation bar
│   │   │   ├── Sidebar.jsx            # Side navigation
│   │   │   ├── BottomNav.jsx          # Mobile bottom navigation
│   │   │   ├── PlanCard.jsx           # Insurance plan card
│   │   │   ├── ClaimCard.jsx          # Claim status card
│   │   │   ├── DashboardCard.jsx      # Dashboard info card
│   │   │   ├── NotificationCard.jsx   # Notification display
│   │   │   ├── ProfileCard.jsx        # User profile card
│   │   │   ├── ReportCard.jsx         # Report display card
│   │   │   ├── ChatMessage.jsx        # Chat message bubble
│   │   │   ├── DateSeparator.jsx      # Date divider
│   │   │   ├── Icons.jsx              # Custom SVG icons
│   │   │   └── ProtectedRoute.jsx     # Auth-protected route wrapper
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx         # Main layout wrapper
│   │   │
│   │   └── data/
│   │       └── locations.js           # District/location data
│   │
│   ├── test-results/                  # E2E test results
│   └── tmp-blank-debug.spec.js         # Temporary test file
│
├── ai-model/                          # Python AI Engine (FastAPI)
│   ├── Dockerfile                     # Docker containerization
│   ├── requirements.txt                # Python dependencies
│   │
│   └── main.py                        # FastAPI application entry point
│       ├── FraudDetectionModel        # Fraud scoring logic
│       ├── RiskScoringModel           # Premium calculation
│       ├── WeatherDataClient          # Weather API integration
│       └── Routes                     # API endpoints (/fraud-check, /risk-score)
│
├── assets/                            # Project assets
│   └── system-architecture.png        # Architecture diagram
│
├── docs/                              # Documentation
│   ├── architecture.md                # System architecture overview
│   └── workflow.md                    # Parametric trigger workflow
│
└── .gitignore                         # Git ignore rules
```

---

## 🔧 Installation & Setup

### Prerequisites

Before starting, ensure you have installed:

```bash
# Java 17+
java -version

# Node.js 18+
node --version

# Python 3.11+
python --version

# MySQL 8.0+
mysql --version

# Maven 3.8+
mvn --version

# Git
git --version
```

### Step 1: Clone and Navigate

```bash
git clone <repository-url>
cd gigshield
```

### Step 2: Backend Setup (Spring Boot)

```bash
cd backend

# Update database configuration
# Edit src/main/resources/application.properties with your MySQL credentials
# Example:
# spring.datasource.url=jdbc:mysql://localhost:3306/gigshield
# spring.datasource.username=root
# spring.datasource.password=your_password

# Install dependencies and build
mvn clean install

# Run the backend
mvn spring-boot:run
# Backend will start on http://localhost:4000
```

### Step 3: AI Engine Setup (Python FastAPI)

```bash
cd ai-model

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OWM_API_KEY=your_openweathermap_api_key  # Get from openweathermap.org
export EMAIL_MOCK_ENABLED=true  # For development

# Start the AI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# AI Engine will start on http://localhost:8000
```

### Step 4: Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (if needed)
# Create .env.local file with API URL:
# VITE_API_URL=http://localhost:4000

# Start development server
npm run dev
# Frontend will start on http://localhost:5173
```

### Automatic Startup (Windows)

For convenience, use the provided startup script:

```bash
# In the root directory
.\start.bat
# This will open 3 terminals and start:
# 1. Backend (Spring Boot) - Port 4000
# 2. AI Engine (FastAPI) - Port 8000
# 3. Frontend (Vite) - Port 5173
```

### Unix/Linux Startup

```bash
# In the root directory
chmod +x start.sh
./start.sh
```

---

## 🚀 Running the Application

### Manual Startup (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
# Running on http://localhost:4000
```

**Terminal 2 - AI Engine:**
```bash
cd ai-model
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
# Running on http://localhost:8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

Then open your browser to: **http://localhost:5173**

### Accessing the Application

- **Worker Dashboard:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin
- **Backend API:** http://localhost:4000/api
- **AI Engine Docs:** http://localhost:8000/docs (Swagger UI)

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend

# Run all unit tests
mvn test

# Run specific test class
mvn test -Dtest=AdminControllerTest

# Generate test report
mvn surefire-report:report
# Report location: target/site/surefire-report.html
```

### Run Frontend Build

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

### Run E2E Smoke Tests (Windows)

```bash
cd backend

# OTP & Login flow test
powershell -ExecutionPolicy Bypass -File e2e-otp-dashboard-smoke.ps1

# Authentication smoke test
powershell -ExecutionPolicy Bypass -File smoke-test-auth.ps1
```

### Playwright Tests (E2E)

```bash
cd frontend

# List available tests
npx playwright@1.53.0 test --list

# Run all tests
npx playwright@1.53.0 test

# Run specific test file
npx playwright@1.53.0 test tmp-blank-debug.spec.js

# Run in debug mode
npx playwright@1.53.0 test --debug
```

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

## Environment Variables Configuration

### Backend (.env or application.properties)

```properties
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=gigshield
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# Email Configuration (Mock Mode - for development)
EMAIL_MOCK_ENABLED=true
# Optional: Real SMTP configuration
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587

# JWT Configuration
JWT_SECRET_KEY=your_secret_key_here_at_least_32_characters_long
JWT_EXPIRATION_MS=86400000

# OpenWeatherMap API
OWM_API_KEY=get_from_openweathermap.org

# Application Port
SERVER_PORT=4000

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:4000
VITE_AI_ENGINE_URL=http://localhost:8000
```

### AI Engine (.env)

```env
OWM_API_KEY=your_openweathermap_api_key
BACKEND_API_URL=http://localhost:4000/api
ML_MODEL_PATH=./models/fraud_detector.pkl
```

---

## 🔄 Common Workflows & Commands

### Development Workflow

```bash
# 1. Start backend
cd backend
mvn spring-boot:run

# 2. Start AI engine (in new terminal)
cd ai-model
source venv/bin/activate
uvicorn main:app --reload --port 8000

# 3. Start frontend (in new terminal)
cd frontend
npm run dev

# 4. Access application
# Worker: http://localhost:5173
# Admin: http://localhost:5173/admin
# API Docs: http://localhost:8000/docs
```

### Quick Database Reset

```bash
# Reset MySQL database (remove all data)
mysql -u root -p gigshield -e "DROP DATABASE gigshield; CREATE DATABASE gigshield;"

# Then restart backend (will auto-seed plans and triggers)
cd backend
mvn spring-boot:run
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: dist/ folder ready for deployment

# Backend build
cd backend
mvn clean package -DskipTests
# Output: target/ai-insurance-backend-0.0.1-SNAPSHOT.jar
```

### Docker Deployment

```bash
# Build Docker images
docker build -t gigshield-backend ./backend
docker build -t gigshield-frontend ./frontend
docker build -t gigshield-ai ./ai-model

# Run with Docker Compose (requires docker-compose.yml)
docker-compose up -d
```

---

## 🆘 Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend won't start on Port 4000 | Port already in use | `lsof -i :4000` or `netstat -ano \| findstr :4000` to find process |
| OTP not sending | Email not configured | Use mock mode: `EMAIL_MOCK_ENABLED=true` |
| Frontend can't connect to backend | CORS issue or wrong API URL | Check `VITE_API_URL` in .env.local |
| Database connection error | MySQL not running | Start MySQL service or check credentials |
| AI engine not responding | FastAPI not running on port 8000 | Check if port is available or change in uvicorn command |
| Claims not auto-filing | AutoClaimService not implemented | This is a known issue - see "Things to Modify" section |
| Fraud scores not updating | Python engine not connected | This is a known issue - needs backend-to-Python integration |

---

## 📞 Support & Getting Help

### For Development Issues:

1. **Check the GitHub Issues** - search for similar problems
2. **Check this README** - especially "Known Issues & Things to Modify" section
3. **Check Application Logs:**
   - Backend: Console output from `mvn spring-boot:run`
   - AI Engine: Console output from uvicorn
   - Frontend: Browser Developer Tools (F12)
4. **Check Database:**
   ```bash
   mysql -u root -p gigshield -e "SELECT * FROM users LIMIT 5;"
   ```

### For Test Data:

Admin credentials are pre-configured in `backend/src/main/java/com/example/aiinsurance/AdminInitializer.java`

Default plans are seeded automatically on first run:
- **Basic Plan:** ₹20/week, ₹300 max payout
- **Standard Plan:** ₹40/week, ₹600 max payout
- **Premium Plan:** ₹60/week, ₹1000 max payout
- **Smart Plan:** ₹50/week, ₹900 max payout + 7-day trial

---

## 🤝 Contributing

We welcome contributions! Here's how to contribute:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them:
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** with a detailed description

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation accordingly
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

---

## 📚 Additional Resources

### Documentation Files

- [System Architecture](docs/architecture.md) - Detailed architecture diagrams and component descriptions
- [Workflow & Triggers](docs/workflow.md) - Parametric trigger definitions and claim workflows

### External References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Razorpay Documentation](https://razorpay.com/docs/)

---

## 📊 Project Statistics

### Codebase Overview

- **Total Lines of Code:** ~7,500+
- **Backend (Java):** ~3,000 lines
- **Frontend (React/JSX):** ~3,200 lines
- **AI Engine (Python):** ~150 lines (scaffold only)
- **Database Entities:** 9 (actual)
- **Controllers:** 11
- **Services:** 11
- **Repositories:** 9

### Actual Feature Status

- **Fully Implemented:** 13 major features
- **Partially Implemented:** 6 features (missing core logic)
- **Not Implemented:** 16 planned features
- **Scaffolded Only:** AI Services

### Critical Gaps

- ❌ No Parametric Trigger System
- ❌ No Weather Integration  
- ❌ No Actual Fraud Detection
- ❌ No Automatic Claim Processing
- ❌ No Transaction History Tracking
- ❌ No Real-time Notifications

---

## ⭐ Key Features Status - Honest Assessment

| Feature | Status | What Works | What's Missing |
|---------|--------|-----------|-----------------|
| User Registration | ✅ Complete | Full registration flow with OTP | Real email (mock mode only) |
| User Authentication | ✅ Complete | JWT tokens, login, admin auth | Token persistence on frontend |
| Insurance Plans | ✅ Complete | Plan creation, viewing, admin panel | Dynamic pricing (not implemented) |
| Subscriptions | ✅ Complete | Buy plans, track status | Auto-renewal logic |
| Payment Gateway | 🟡 Partial | Razorpay configured, orders created | Payment verification incomplete |
| Claims Management | 🟡 Partial | Submit claims, view history | Auto-filing NOT implemented |
| Notifications | 🟡 Partial | Create/view notifications | Email delivery (mock only) |
| Admin Dashboard | ✅ Complete | User management, plan management | Analytics NOT implemented |
| Wallet Balance | 🟡 Partial | Display balance (in User table) | Transaction history NOT tracked |
| Support/Queries | ✅ Complete | Submit queries, admin replies | Chat integration missing |
| **Parametric Triggers** | ❌ Missing | - | **ENTIRE SYSTEM NOT BUILT** |
| **Weather Integration** | ❌ Missing | - | **NO WEATHER SERVICE** |
| **Fraud Detection** | ❌ Missing | - | **ONLY SCAFFOLD** |
| **Auto Claims** | ❌ Missing | - | **NOT CONNECTED** |
| **Real-time Alerts** | ❌ Missing | - | **NO PUSH NOTIFICATIONS** |

---

## 👥 Team & Contributors

### Team Members

> Update this section with actual team member details

| Name | Role | Area of Focus |
|------|------|-----------------|
| TBD | Backend Lead | Spring Boot, Database, APIs |
| TBD | Frontend Lead | React, UI/UX, Components |
| TBD | AI/ML Engineer | Python, Fraud Detection, Scoring |
| TBD | Product/Design | UX Design, Product Strategy |

### University/Organization

- **Organization:** Guidewire DEVTrails 2026
- **Challenge:** AI-Powered Parametric Insurance for Gig Workers
- **Focus Area:** India's Food Delivery Ecosystem

---

## 🏆 Achievements & Milestones

- ✅ **Phase 1 Complete:** Full foundation built with all core systems in place
- ✅ **10+ Database Entities:** Fully designed and implemented schema
- ✅ **9 REST API Endpoints:** Complete controller layer for user interactions
- ✅ **13 Frontend Pages:** Comprehensive UI for workers and admins
- ✅ **Authentication System:** JWT-based stateless authentication
- ✅ **Real-time Weather Integration:** OpenWeatherMap API integration
- 🔲 **Fraud Detection:** To be fully implemented in Phase 2
- 🔲 **Automated Payouts:** To be completed by end of Phase 2

---

## 📝 License & Legal

### License

This project is built for the **Guidewire DEVTrails 2026 University Hackathon** and is released under the **MIT License**.

### Legal Disclaimer

- This is a demo/educational project for the hackathon
- Not for production use without proper financial/insurance licensing
- All payment integrations are in test mode
- Substitute your own OpenWeatherMap API key before deployment

### Compliance Notes

- ✅ JWT tokens for secure authentication
- ✅ Role-based access control (RBAC)
- ✅ Data isolation between users
- ⚠️ No encryption for sensitive data (add before production)
- ⚠️ No rate limiting (add before production)
- ⚠️ No HTTPS enforcement (add before production)

---

## 📞 Contact & Support

For questions about this project:

1. **GitHub Issues:** Report bugs or ask questions via GitHub Issues
2. **Email:** [Add project contact email]
3. **Discord Community:** [Add community link if applicable]

For Guidewire DEVTrails support:
- Visit: https://devtrails.guidewire.com
- Email: devtrails@guidewire.com

---

<div align="center">

## 🛡️ **GigShield — Empowering India's Gig Economy with AI & Automation**

> *"Every rainstorm shouldn't mean an empty wallet."*

### Final Status: **45% Complete | Phase 1 Delivered ✅**

**Protecting 12 million+ gig delivery workers with intelligent, automated insurance coverage.**

---

*Last Updated: April 13, 2026*

*Built with ❤️ for DEVTrails 2026*

---

### Quick Links
[🌍 Website](#) | [📖 Docs](docs/) | [🐛 Report Bug](#) | [✨ Request Feature](#) | [🤝 Contribute](#contributing)

</div>
