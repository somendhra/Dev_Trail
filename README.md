# WageWings
## 📋 Problem Statement
Gig workers in India lose 4-6 hours of wages whenever unexpected disruptions strike—heavy rain, extreme heatwaves, or sudden curfews. With no safety net, a single rainy day can cost a delivery partner ₹400-600. Existing insurance is either unavailable or requires manual claims filing when workers are already stressed.

We're building WageWings: an AI-powered parametric insurance platform that automatically pays delivery partners when curfews, heavy traffic, or weather prevent them from working. No forms. No delays. Just instant income protection
## 👤 Persona Definition

| Attribute | Details |
| :--- | :--- |
| **NAME** | RAVI |
| **Age** | 24 years |
| **Platform** | Blinkit (Q-Commerce) |
| **Location** | Andhra East, Mumbai |
| **Daily Income** | ₹800 – ₹1,200 |
| **Work Schedule** | 6 days/week, 8-10 hours/day |
| **Family** | Lives with parents, supports younger sister's education |
| **Biggest Fear** | Monsoon rains (June-September) stopping deliveries = 4-5 hours lost wages daily |
| **Current Situation** | No insurance. If it rains, he doesn't earn. |



## Why Q-Commerce?
With 10-minute delivery promises, ANY disruption means IMMEDIATE income loss. Rain, heat, or curfew directly impacts their ability to meet SLAs, making parametric insurance most valuable for this segment.
<img width="1256" height="681" alt="image" src="https://github.com/user-attachments/assets/7d5c9c06-488b-4238-aaea-603491ca13d1" />

## Step-by-Step User Journey

| Process Step | Description |
| :--- | :--- |
| **Registration** | Ravi signs up with phone number and Blinkit partner ID |
| **Risk Assessment** | System analyzes zone (Andheri East), historical weather, and claim patterns |
| **Quote Generation** | AI calculates personalized weekly premium  |
| **Policy Purchase** | Ravi pays via UPI (Razorpay sandbox) |
| **24/7 Monitoring** | System polls [OpenWeatherMap](https://openweathermap.org) every 15 minutes |
| **Trigger Detection** | Heavy rain detected in Andheri East (>5mm/hr) |
| **Auto-Claim** | Claim created automatically for all active policies in zone |
| **Fraud Validation** | System cross-checks weather data from multiple sources |
| **Pricing Note** | **BASE_PREMIUM** = ₹200 per week |



Notification: Rajesh gets SMS: "Rain detected! ₹400 credited for lost income"
## Real-World Examples
Example 1: 
1. Ravi: Full Rain Day 

In this scenario, the rain is so heavy that Ravi cannot start his shift at all.

    Baseline: 20 orders/day (his 30-day personal average).

    Orders Completed: 0 orders.

    Price Per Order: ₹50.

    Calculation: (20−0)×50=₹1,000.

    Final Payout: ₹800 (The amount is capped at ₹800 to keep the insurance pool sustainable).

## ⚡ Parametric Triggers
Trigger	Data Source	Threshold	Payout Calculation
Heavy Rain	OpenWeatherMap	>5mm/hr in last hour	4 hrs × avg hourly wage
Extreme Heat	OpenWeatherMap	>40°C for 2+ hours	3 hrs × avg hourly wage
Air Pollution	AirVisual API	AQI > 300	Full day wage
Local Curfew	Manual/Mock	Govt announcement	Full day wage
Platform Outage	Mock/Status API	App down >1 hr	2 hrs × avg hourly wage
Flood Warning	Weather API	Red alert in zone	Full day wage
## 🤖 AI/ML Integration Plan
1. Dynamic Premium Calculation (Phase 2)
The AI risk engine will calculate premiums based on:

Input	Weight	Purpose
Zone risk score	40%	Historical claim frequency by area
Weather forecast	30%	Rainy days predicted next week
User claim history	20%	Individual behavior pattern
Seasonal factors	10%	Monsoon/summer multipliers
2. Fraud Detection Engine (Phase 3)
Detection Layer	Method	Action
GPS Spoofing	Compare claim location vs. user's zone history	Flag for review
Weather Mismatch	Cross-reference with secondary API	Auto-reject if mismatch
Frequency Abuse	Detect >3 claims in 3 days	Hold for manual review
Device Fingerprint	Same device, multiple accounts	Flag for investigation
3. Predictive Analytics (Phase 3)
"72% chance of rain disruptions in Mumbai tomorrow" - proactive user notification

"Unusual claim pattern detected in Andheri East" - admin alert

"Next week risk forecast: High" - suggest premium adjustment

Final Choice: Progressive Web App (PWA) - mobile-responsive website that works offline and can be installed on home screen.

<img width="709" height="633" alt="image" src="https://github.com/user-attachments/assets/9b5efacd-e581-4db6-80fa-99b494a380fd" />

## 🛠️ Tech Stack


| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | Next.js / React | Modern UI, fast rendering, and seamless Vercel integration |
| **Backend** | Spring Boot (Java) | Robust, scalable, and enterprise-grade security for financial data |
| **AI/ML Layer** | Python (FastAPI/Flask) | Best-in-class libraries (Scikit-learn/TensorFlow) for risk prediction |
| **Database** | PostgreSQL (Neon) | Relational data integrity, free tier, ACID compliance |
| **Caching** | Redis (Upstash) | Real-time risk scores, session management, free tier |
| **Weather API** | OpenWeatherMap | Free tier: 60 calls/min, reliable data |
| **Payments** | Razorpay Test Mode | Indian market focus, excellent docs, UPI support |
| **Hosting** | Vercel (Frontend) + Render/Railway (Backend) | Reliable hosting with generous free tiers for hobby projects |
| **Monitoring** | Cron-job.org | Free scheduled jobs for weather polling |
