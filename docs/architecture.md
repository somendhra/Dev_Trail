# System Architecture

The **AI-Powered Gig Insurance Platform** follows a layered architecture that enables automated insurance coverage, disruption detection, and instant payouts for gig workers.

![System Architecture](assets/system-architecture.png)

### Architecture Flow

```
Gig Delivery Worker
        ↓
User Application (Web / Mobile)
        ↓
Frontend Layer (React)
        ↓
Backend Services (Node.js / Express)
        ↓
AI Risk Prediction Engine
        ↓
Parametric Trigger System
        ↓
Automated Claim Processing
        ↓
Payment Gateway (Mock UPI)
```

---

## Component Description

### 1. Gig Delivery Worker

The delivery worker interacts with the platform through a **web or mobile application** to register, select insurance plans, and track claims.

### 2. User Application (Web / Mobile)

The application provides the main interface for workers to:

* Register and log in
* Select insurance plans
* View coverage status
* Receive disruption alerts
* Track claim payouts

### 3. Frontend Layer (React)

The frontend is responsible for:

* User interface and user experience
* Worker dashboards
* Insurance plan selection
* Notifications and alerts

Technologies used:

* React.js
* HTML / CSS
* REST API integration

### 4. Backend Services (Node.js / Express)

The backend acts as the **central processing layer** and performs:

* Authentication and user management
* Insurance policy management
* Claim processing
* Communication with external APIs

Technologies used:

* Node.js
* Express.js
* RESTful APIs

### 5. AI Risk Prediction Engine

The AI module analyzes external data sources to estimate disruption risks and calculate dynamic premiums.

**Input data includes:**

* Weather data
* Pollution levels
* Traffic congestion
* Historical disruption patterns
* Worker location data

**The AI model outputs:**

* Risk score
* Dynamic weekly premium
* Fraud detection alerts

### 6. Parametric Trigger System

The parametric trigger engine continuously monitors external data sources and automatically activates claims when predefined conditions occur.

**Examples:**

| Event      | Trigger Condition        |
| ---------- | ------------------------ |
| Heavy Rain | Rainfall > 60mm          |
| Flood      | Flood alert issued       |
| Pollution  | AQI > 400                |
| Curfew     | Government zone lockdown |

This removes the need for manual claim submissions.

### 7. Claim Automation Engine

Once a disruption trigger is detected, the system automatically:

1. Generates a claim record
2. Verifies eligibility
3. Initiates payout processing

This ensures a **zero-touch claim experience** for workers.

### 8. Payment Gateway (Mock UPI)

The platform simulates instant payouts using a **mock UPI payment gateway**.

**Functions include:**

* Payout initiation
* Transaction confirmation
* Worker payment notifications

---

## Key Benefits of the Architecture

* Fully **automated insurance claim processing**
* **AI-driven risk prediction**
* **Zero manual claim filing**
* **Real-time disruption monitoring**
* **Instant payout simulation**

This architecture ensures a **scalable, automated, and intelligent insurance system for gig economy workers.**
