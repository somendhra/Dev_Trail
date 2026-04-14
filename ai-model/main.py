"""
AI-Powered Insurance Platform — AI Microservice
FastAPI server exposing:
  - /ai/premium          → Dynamic weekly premium calculator
  - /ai/risk             → Risk assessment for a user profile
  - /ai/fraud/detect     → Fraud detection on a claim request
  - /ai/parametric/check → Check parametric triggers (weather, pollution, disasters)
  - /ai/weather          → Live (mock) weather data for a location
  - /ai/dashboard        → AI insights summary
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from enum import Enum
import random
import datetime
import hashlib

def round_val(val: Any, digits: int = 0) -> Any:
    """Helper to bypass type checker issues with built-in round()."""
    return round(float(val), digits)  # type: ignore

app = FastAPI(
    title="GigShield AI Engine",
    description="AI-Powered Parametric Insurance for India's Gig Economy",
    version="2.0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# CONSTANTS & LOOKUP TABLES
# ─────────────────────────────────────────────

PLATFORM_RISK = {
    "Zomato":  0.75,
    "Swiggy":  0.72,
    "Zepto":   0.68,
    "Amazon":  0.55,
    "Dunzo":   0.78,
    "Blinkit": 0.70,
    "Porter":  0.60,
    "Rapido":  0.80,
    "Ola":     0.65,
    "Uber":    0.62,
}

STATE_RISK = {
    "Maharashtra":      0.80, "Delhi":          0.82, "Karnataka":       0.60,
    "Tamil Nadu":       0.65, "West Bengal":    0.75, "Telangana":       0.62,
    "Gujarat":          0.70, "Rajasthan":      0.72, "Uttar Pradesh":   0.78,
    "Andhra Pradesh":   0.64, "Punjab":         0.68, "Haryana":         0.66,
    "Madhya Pradesh":   0.74, "Bihar":          0.76, "Odisha":          0.73,
    "Kerala":           0.70, "Assam":          0.77, "Jharkhand":       0.75,
}

BASE_PLANS: Dict[str, Dict[str, float]] = {
    "Starter":  {"weekly_premium": 20.0,  "coverage": 3000.0},
    "Smart":    {"weekly_premium": 40.0,  "coverage": 6000.0},
    "Pro":      {"weekly_premium": 60.0,  "coverage": 12000.0},
    "Max":      {"weekly_premium": 100.0, "coverage": 25000.0},
}

WEATHER_CONDITIONS = [
    ("Clear", 0.10), ("Partly Cloudy", 0.15), ("Overcast", 0.25),
    ("Light Rain", 0.45), ("Heavy Rain", 0.75), ("Thunderstorm", 0.90),
    ("Cyclone Warning", 0.98), ("Extreme Heat", 0.70), ("Dense Fog", 0.65),
    ("Sandstorm", 0.80),
]

SEASON_RISK = {
    "monsoon":    0.85,  # June–September
    "winter":     0.45,  # November–February
    "summer":     0.60,  # March–May
    "post_monsoon": 0.50,
}

def _plan_recommendation(risk_score: float) -> str:
    """Helper to recommend a plan based on risk score."""
    if risk_score >= 0.75:
        return "Max"
    elif risk_score >= 0.60:
        return "Pro"
    elif risk_score >= 0.45:
        return "Smart"
    else:
        return "Starter"

def get_current_season() -> str:
    month = datetime.datetime.now().month
    if 6 <= month <= 9:
        return "monsoon"
    elif 11 <= month <= 12 or 1 <= month <= 2:
        return "winter"
    elif 3 <= month <= 5:
        return "summer"
    else:
        return "post_monsoon"

def get_platform_risk(platform: str) -> float:
    return PLATFORM_RISK.get(platform, 0.65)

def get_state_risk(state: str) -> float:
    return STATE_RISK.get(state, 0.65)

def get_season_risk() -> float:
    return SEASON_RISK.get(get_current_season(), 0.50)

def compute_risk_score(platform: str, state: str, months_active: int = 3,
                       prior_claims: int = 0) -> float:
    """
    Composite risk score 0–1 using weighted inputs.
    Higher score = higher risk.
    """
    p_risk  = get_platform_risk(platform)          # 0–1
    s_risk  = get_state_risk(state)                # 0–1
    sea_risk= get_season_risk()                    # 0–1
    tenure_factor = max(0.0, 1.0 - months_active * 0.03) # newer = more risk
    claim_factor  = min(1.0, prior_claims * 0.15)        # more claims = more risk

    score = (
        p_risk   * 0.30 +
        s_risk   * 0.25 +
        sea_risk * 0.25 +
        tenure_factor * 0.10 +
        claim_factor  * 0.10
    )
    return round_val(min(1.0, max(0.0, score)), 4)

def risk_to_multiplier(risk_score: float) -> float:
    """Map risk score → premium multiplier (0.8 – 1.6)."""
    return round_val(0.80 + risk_score * 0.80, 4)

def mock_weather(state: str, district: str) -> dict:
    """
    Deterministic mock weather based on location + current date.
    Uses a hash so the same location/date always returns the same result.
    """
    seed_str = f"{state}:{district}:{datetime.date.today().isoformat()}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (10**8)
    rng  = random.Random(seed)

    season    = get_current_season()
    season_wt = get_season_risk()

    # Weighted random pick of condition
    weights  = [(cond, w * season_wt + rng.random() * 0.1) for cond, w in WEATHER_CONDITIONS]
    weights.sort(key=lambda x: x[1], reverse=True)
    chosen_cond, chosen_risk = weights[rng.randint(0, min(4, len(weights)-1))]

    temp_c    = round_val(rng.uniform(18, 42), 1)
    humidity  = round_val(rng.uniform(30, 95), 1)
    wind_kmh  = round_val(rng.uniform(5, 80), 1)
    aqi       = rng.randint(40, 400)
    
    # Simulate rainfall based on condition
    rainfall = 0.0
    if "Rain" in chosen_cond:
        rainfall = round_val(rng.uniform(10, 150), 1)
    elif "Thunderstorm" in chosen_cond or "Cyclone" in chosen_cond:
        rainfall = round_val(rng.uniform(50, 250), 1)

    return {
        "location":    f"{district}, {state}",
        "condition":   chosen_cond,
        "temperature": temp_c,
        "temp":        temp_c, # Alias for threshold matching
        "humidity":    humidity,
        "wind_kmh":    wind_kmh,
        "wind_speed":  wind_kmh, # Alias for threshold matching
        "aqi":         aqi,
        "rainfall":    rainfall,
        "risk_index":  round_val(chosen_risk, 3),
        "season":      season,
        "timestamp":   datetime.datetime.now().isoformat(),
    }

def evaluate_custom_triggers(weather: dict, triggers: List[Dict[str, Any]]) -> List[str]:
    """Helper to evaluate list of JSON triggers from Admin."""
    matches = []
    # Mapping normalized factor names to weather keys
    mapping = {
        "temperature": "temperature", "temp": "temperature",
        "rainfall": "rainfall", "rain": "rainfall",
        "humidity": "humidity",
        "wind_speed": "wind_kmh", "wind": "wind_kmh", "windspeed": "wind_kmh",
        "aqi": "aqi",
        "risk_index": "risk_index", "risk": "risk_index"
    }
    
    if not triggers:
        return []

    for t in triggers:
        factor = str(t.get("factor", "")).lower()
        operator = str(t.get("operator", ""))
        try:
            threshold = float(t.get("threshold", 0))
        except ValueError:
            continue
            
        w_key = mapping.get(factor)
        if w_key and w_key in weather:
            val = float(weather[w_key])
            is_match = False
            if operator == ">" and val > threshold: is_match = True
            elif operator == ">=" and val >= threshold: is_match = True
            elif operator == "<" and val < threshold: is_match = True
            elif operator == "<=" and val <= threshold: is_match = True
            elif operator == "==" and val == threshold: is_match = True
            
            if is_match:
                sit = t.get("situation", "Disaster")
                matches.append(f"{sit} detected: {factor} is {val} (Threshold: {threshold})")
                
    return matches

def weather_triggers_parametric(weather: dict, custom_triggers: Optional[List[Dict[str, Any]]] = None) -> dict:
    """
    Evaluate whether the current weather crosses parametric trigger thresholds.
    Returns auto_trigger=True + trigger reason if thresholds are exceeded.
    """
    default_triggers = []
    ri = weather["risk_index"]
    cond = weather["condition"]
    aqi  = weather["aqi"]
    wind = weather["wind_kmh"]
    temp = weather["temperature"]

    # Evaluate hardcoded defaults
    if temp >= 35:
        default_triggers.append(f"Summer Heat Alert: {temp}°C ≥ 35°C threshold")
    if ri >= 0.85:
        default_triggers.append(f"Severe weather: {cond} (risk index {ri:.2f} ≥ 0.85)")
    if aqi >= 300:
        default_triggers.append(f"Hazardous air quality: AQI {aqi} ≥ 300")
    if "Cyclone" in cond or "Thunderstorm" in cond:
        default_triggers.append(f"Extreme weather event: {cond}")
    if wind >= 70:
        default_triggers.append(f"Dangerous wind speed: {wind} km/h ≥ 70")
    if cond in ("Heavy Rain", "Thunderstorm", "Cyclone Warning"):
        default_triggers.append(f"Income-disruption weather: {cond}")

    # Evaluate dynamic Admin triggers if provided
    custom_matches = evaluate_custom_triggers(weather, custom_triggers) if custom_triggers else []
    
    all_triggered_reasons = default_triggers + custom_matches
    auto_trigger = len(all_triggered_reasons) > 0

    severity = "LOW"
    if ri >= 0.90 or temp >= 45: severity = "CRITICAL"
    elif ri >= 0.75 or temp >= 40: severity = "HIGH"
    elif ri >= 0.50 or temp >= 35: severity = "MODERATE"
    
    if not default_triggers and custom_matches:
        severity = "MODERATE"

    return {
        "auto_trigger":    auto_trigger,
        "trigger_reasons": all_triggered_reasons,
        "severity":        severity,
        "estimated_income_loss_pct": round_val(min(100.0, ri * 90 if temp < 35 else max(ri * 90, (temp - 30) * 10)), 1),
    }

def fraud_score(claim: dict) -> dict:
    """
    Rule-based + statistical fraud detection.
    Returns a score 0–1 (higher = more suspicious) and flags.
    """
    flags  = []
    score  = 0.0

    # 1. Duplicate claim window check
    if claim.get("days_since_last_claim", 30) < 7:
        flags.append("DUPLICATE_WINDOW: Claim within 7 days of previous claim")
        score += 0.45

    # 2. No active subscription
    if not claim.get("has_active_subscription", True):
        flags.append("NO_SUBSCRIPTION: No active insurance policy at claim time")
        score += 0.50

    # 3. Location mismatch
    claimed_state    = claim.get("claimed_state", "")
    registered_state = claim.get("registered_state", "")
    if claimed_state and registered_state and claimed_state.lower() != registered_state.lower():
        flags.append(f"LOCATION_MISMATCH: Claimed in {claimed_state}, registered in {registered_state}")
        score += 0.35

    # 4. No weather event corroboration
    weather_risk = claim.get("weather_risk_index", 0.5)
    if weather_risk < 0.40:
        flags.append(f"WEATHER_MISMATCH: Low weather risk ({weather_risk:.2f}) at claim location")
        score += 0.30

    # 5. Claim amount exceeds coverage
    claim_amount = claim.get("claim_amount", 0)
    coverage     = claim.get("coverage_amount", float("inf"))
    if claim_amount > coverage:
        flags.append(f"OVER_CLAIM: Claimed ₹{claim_amount} exceeds coverage ₹{coverage}")
        score += 0.40

    # 6. Rapid successive registrations
    if claim.get("account_age_days", 100) < 14:
        flags.append("NEW_ACCOUNT: Account less than 14 days old")
        score += 0.25

    # 7. Suspicious claim pattern (too many claims in 30d)
    if claim.get("claims_last_30d", 0) >= 2:
        flags.append(f"CLAIM_FLOOD: {claim.get('claims_last_30d')} claims in last 30 days")
        score += 0.30

    fraud_score_val = round_val(min(1.0, score), 4)
    risk_level = (
        "CRITICAL" if fraud_score_val >= 0.80 else
        "HIGH"     if fraud_score_val >= 0.55 else
        "MEDIUM"   if fraud_score_val >= 0.30 else
        "LOW"
    )

    return {
        "fraud_score":      fraud_score_val,
        "risk_level":       risk_level,
        "flags":            flags,
        "recommendation":   (
            "REJECT_AUTO"    if fraud_score_val >= 0.80 else
            "MANUAL_REVIEW"  if fraud_score_val >= 0.40 else
            "AUTO_APPROVE"
        ),
        "confidence_pct":  round_val((1 - abs(fraud_score_val - 0.5) * 2) * 100, 1),
    }

# ─────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────

class PremiumRequest(BaseModel):
    platform:      str
    state:         str
    district:      Optional[str] = ""
    plan_name:     str = "Smart"
    months_active: Optional[int] = 3
    prior_claims:  Optional[int] = 0

class RiskRequest(BaseModel):
    user_id:       int
    platform:      str
    state:         str
    district:      Optional[str] = ""
    months_active: Optional[int] = 3
    prior_claims:  Optional[int] = 0

class WeatherRequest(BaseModel):
    state:    str
    district: str

class FraudRequest(BaseModel):
    user_id:                   int
    situation:                 str
    claimed_state:             Optional[str] = ""
    registered_state:          Optional[str] = ""
    has_active_subscription:   bool = True
    days_since_last_claim:     int  = 30
    weather_risk_index:        float = 0.5
    claim_amount:              float = 0.0
    coverage_amount:           float = 999999.0
    account_age_days:          int   = 60
    claims_last_30d:           int   = 0

class ParametricRequest(BaseModel):
    user_id:    int
    state:      str
    district:   str
    plan_name:  str = "Smart"
    coverage:   float = 6000.0
    triggers:   Optional[List[Dict[str, Any]]] = None

class VerifyWorkerRequest(BaseModel):
    user_id:       int
    platform:      str
    name:          str

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service":   "GigShield AI Engine",
        "version":   "2.0.0",
        "status":    "operational",
        "endpoints": [
            "/ai/premium", "/ai/risk", "/ai/fraud/detect",
            "/ai/parametric/check", "/ai/weather", "/ai/dashboard",
            "/ai/plans/recommend"
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.datetime.now().isoformat()}


@app.post("/ai/premium")
def calculate_premium(req: PremiumRequest):
    """
    Dynamic weekly premium calculator.
    Takes user profile → returns risk-adjusted premium for each plan.
    """
    base = BASE_PLANS.get(req.plan_name, BASE_PLANS["Smart"])
    risk_score  = compute_risk_score(req.platform, req.state, req.months_active or 3, req.prior_claims or 0)
    multiplier  = risk_to_multiplier(risk_score)

    adjusted_premium = round_val(base["weekly_premium"] * multiplier, 2)
    season_label     = get_current_season().replace("_", " ").title()

    # Generate per-plan premiums
    all_plans = {}
    for plan_name, pdata in BASE_PLANS.items():
        plan_prem = round_val(pdata["weekly_premium"] * multiplier, 2)
        all_plans[plan_name] = {
            "base_premium":     pdata["weekly_premium"],
            "adjusted_premium": plan_prem,
            "coverage":         pdata["coverage"],
            "risk_multiplier":  multiplier,
            "savings_vs_base":  round_val(plan_prem - pdata["weekly_premium"], 2),
        }

    return {
        "user_profile": {
            "platform":      req.platform,
            "state":         req.state,
            "district":      req.district,
            "plan":          req.plan_name,
            "months_active": req.months_active,
            "prior_claims":  req.prior_claims,
        },
        "risk_analysis": {
            "overall_score":     risk_score,
            "risk_category":     ("High" if risk_score >= 0.70 else "Moderate" if risk_score >= 0.45 else "Low"),
            "platform_risk":     get_platform_risk(req.platform),
            "state_risk":        get_state_risk(req.state),
            "season_risk":       get_season_risk(),
            "season":            season_label,
        },
        "premium": {
            "base_weekly":     base["weekly_premium"],
            "adjusted_weekly": adjusted_premium,
            "multiplier":      multiplier,
            "coverage":        base["coverage"],
            "currency":        "INR",
        },
        "all_plans":         all_plans,
        "recommendation":    _plan_recommendation(risk_score),
    }


@app.post("/ai/risk")
def assess_risk(req: RiskRequest):
    """Full risk assessment for a gig worker profile."""
    score      = compute_risk_score(req.platform, req.state, req.months_active or 3, req.prior_claims or 0)
    weather    = mock_weather(req.state, req.district or req.state)
    w_triggers = weather_triggers_parametric(weather)

    contributing = [
        {"factor": "Platform",       "score": get_platform_risk(req.platform),  "weight": "30%"},
        {"factor": "State/Location", "score": get_state_risk(req.state),        "weight": "25%"},
        {"factor": "Season",         "score": get_season_risk(),                "weight": "25%"},
        {"factor": "Account Tenure", "score": max(0.0, 1.0 - (req.months_active or 3) * 0.03), "weight": "10%"},
        {"factor": "Prior Claims",   "score": min(1.0, (req.prior_claims or 0) * 0.15), "weight": "10%"},
    ]

    return {
        "user_id":           req.user_id,
        "risk_score":        score,
        "risk_category":     ("High" if score >= 0.70 else "Moderate" if score >= 0.45 else "Low"),
        "risk_level_emoji":  ("🔴" if score >= 0.70 else "🟡" if score >= 0.45 else "🟢"),
        "contributing_factors": contributing,
        "current_weather":   weather,
        "parametric_alert":  w_triggers,
        "recommended_plan":  _plan_recommendation(score),
        "assessed_at":       datetime.datetime.now().isoformat(),
    }


@app.post("/ai/fraud/detect")
async def detect_fraud_route(req: FraudRequest):
    """AI fraud detection for a claim submission."""
    result = fraud_score(req.model_dump())
    return {
        "user_id":         req.user_id,
        "situation":       req.situation,
        "fraud_analysis":  result,
        "action":          result["recommendation"],
        "analyzed_at":     datetime.datetime.now().isoformat(),
    }


@app.post("/ai/verify-employment")
def verify_employment(req: VerifyWorkerRequest):
    """
    Simulates an AI-driven background check with a gig platform's database.
    """
    # Deterministic simulation based on user_id so it doesn't flip-flop
    seed = int(hashlib.md5(f"{req.user_id}:{req.platform}:{req.name}".encode()).hexdigest(), 16)
    rng = random.Random(seed)
    
    # 80% chance to be verified, 15% manual review, 5% rejected
    roll = rng.random()
    if roll < 0.80:
        status = "VERIFIED"
        confidence = round_val(rng.uniform(85.0, 99.9), 1)
        note = f"[AI Automated Check] Verified via direct integration with {req.platform} employer database. Identity and active employment confirmed."
    elif roll < 0.95:
        status = "PENDING"
        confidence = round_val(rng.uniform(40.0, 75.0), 1)
        note = f"[AI Automated Check] Partial match found on {req.platform}. Requires manual administrative review."
    else:
        status = "REJECTED"
        confidence = round_val(rng.uniform(10.0, 35.0), 1)
        note = f"[AI Automated Check] No active employment record found for '{req.name}' on {req.platform}. Rejected."

    return {
        "user_id": req.user_id,
        "platform": req.platform,
        "recommended_status": status,
        "confidence_score": confidence,
        "ai_note": note,
        "checked_at": datetime.datetime.now().isoformat()
    }


@app.post("/ai/parametric/check")
def parametric_check(req: ParametricRequest):
    """
    Real-time parametric trigger check.
    If weather conditions exceed thresholds → auto-initiate claim.
    """
    weather    = mock_weather(req.state, req.district)
    triggers   = weather_triggers_parametric(weather, req.triggers)

    payout_pct = 0
    if triggers["auto_trigger"]:
        severity = triggers["severity"]
        payout_pct = {"CRITICAL": 100, "HIGH": 80, "MODERATE": 60, "LOW": 30}.get(severity, 0)

    estimated_payout = round_val(req.coverage * payout_pct / 100, 2)

    return {
        "user_id":          req.user_id,
        "location":         f"{req.district}, {req.state}",
        "plan":             req.plan_name,
        "coverage":         req.coverage,
        "weather":          weather,
        "parametric_check": triggers,
        "auto_trigger":     triggers["auto_trigger"],
        "payout_pct":       payout_pct,
        "estimated_payout": estimated_payout,
        "claim_status":     ("AUTO_INITIATED" if triggers["auto_trigger"] else "NO_TRIGGER"),
        "next_check_in":    "15 minutes",
        "checked_at":       datetime.datetime.now().isoformat(),
    }


@app.get("/ai/weather")
def get_weather(state: str, district: str = ""):
    """Get mock real-time weather data for a location."""
    district = district or state
    weather  = mock_weather(state, district)
    triggers = weather_triggers_parametric(weather)
    return {
        **weather,
        "parametric_risk": triggers,
    }


@app.get("/ai/dashboard")
def ai_dashboard(platform: str = "Zomato", state: str = "Maharashtra",
                 months_active: int = 3, prior_claims: int = 0):
    """
    Comprehensive AI insights dashboard for a user.
    Single endpoint that aggregates all AI outputs.
    """
    district   = state.split()[0]  # Use state name as proxy district
    score      = compute_risk_score(platform, state, months_active, prior_claims)
    weather    = mock_weather(state, district)
    triggers   = weather_triggers_parametric(weather)
    multiplier = risk_to_multiplier(score)

    # Per-plan premium breakdown
    plan_options = []
    for pname, pdata in BASE_PLANS.items():
        plan_options.append({
            "plan":              pname,
            "base_premium":      pdata["weekly_premium"],
            "ai_premium":        round_val(pdata["weekly_premium"] * multiplier, 2),
            "coverage":          pdata["coverage"],
            "value_ratio":       round_val(pdata["coverage"] / (pdata["weekly_premium"] * multiplier * 4), 2),
        })

    # Weekly income protection estimate
    avg_daily_income = {"Zomato": 650, "Swiggy": 620, "Amazon": 700, "Zepto": 580,
                        "Dunzo": 600, "Blinkit": 590, "Porter": 640, "Rapido": 550}.get(platform, 600)
    weekly_income    = avg_daily_income * 6  # 6-day work week

    return {
        "ai_summary": {
            "risk_score":       score,
            "risk_category":    ("High" if score >= 0.70 else "Moderate" if score >= 0.45 else "Low"),
            "season":           get_current_season().replace("_", " ").title(),
            "premium_multiplier": multiplier,
        },
        "weather_intelligence": {
            **weather,
            "parametric_alert": triggers,
        },
        "income_protection": {
            "avg_daily_income_inr":   avg_daily_income,
            "weekly_income_inr":      weekly_income,
            "disruption_risk_pct":    round_val(score * 100, 1),
            "expected_loss_per_week": round_val(weekly_income * score * 0.3, 2),
        },
        "plan_options":        plan_options,
        "fraud_prevention":    {
            "anomaly_detection": "Active",
            "location_validation": "Active",
            "duplicate_prevention": "Active",
            "weekly_claim_limit": "Enforced",
        },
        "recommended_plan":    _plan_recommendation(score),
        "generated_at":        datetime.datetime.now().isoformat(),
    }


@app.post("/ai/plans/recommend")
def recommend_plan(req: PremiumRequest):
    """Recommend the best plan for a given user profile."""
    score = compute_risk_score(req.platform, req.state, req.months_active or 3, req.prior_claims or 0)
    rec   = _plan_recommendation(score)
    multiplier = risk_to_multiplier(score)

    plans_ranked = []
    for pname, pdata in BASE_PLANS.items():
        ai_prem  = round_val(pdata["weekly_premium"] * multiplier, 2)
        cover    = pdata["coverage"]
        # Score: high coverage / premium ratio wins; add bonus if it's the recommended
        fit_score = round_val(cover / (ai_prem * 52) + (0.3 if pname == rec else 0), 4)
        plans_ranked.append({
            "plan":         pname,
            "weekly_premium": ai_prem,
            "coverage":     cover,
            "fit_score":    fit_score,
            "recommended":  pname == rec,
        })
    plans_ranked.sort(key=lambda x: x["fit_score"], reverse=True)

    return {
        "recommended_plan": rec,
        "risk_score":       score,
        "plans_ranked":     plans_ranked,
        "reason": (
            f"Based on your profile (platform: {req.platform}, state: {req.state}), "
            f"current season ({get_current_season()}), and risk score ({score}), "
            f"we recommend the {rec} plan for optimal income protection."
        )
    }


@app.get("/ai/fraud/stats")
def fraud_stats():
    """Return aggregate fraud prevention statistics (mock)."""
    return {
        "total_claims_analyzed":     1842,
        "auto_approved":             1104,
        "flagged_for_review":        621,
        "auto_rejected":             117,
        "fraud_prevention_rate_pct": 6.35,
        "top_fraud_flags": [
            {"flag": "DUPLICATE_WINDOW",   "count": 298},
            {"flag": "WEATHER_MISMATCH",   "count": 187},
            {"flag": "LOCATION_MISMATCH",  "count": 136},
            {"flag": "NO_SUBSCRIPTION",    "count": 89},
            {"flag": "OVER_CLAIM",         "count": 54},
            {"flag": "CLAIM_FLOOD",        "count": 43},
            {"flag": "NEW_ACCOUNT",        "count": 39},
        ],
        "last_updated": datetime.datetime.now().isoformat(),
    }


@app.get("/ai/parametric/triggers")
def get_all_triggers():
    """Check parametric triggers for all major Indian cities (demo)."""
    locations = [
        ("Maharashtra",  "Mumbai"),
        ("Delhi",        "New Delhi"),
        ("Karnataka",    "Bengaluru"),
        ("Tamil Nadu",   "Chennai"),
        ("West Bengal",  "Kolkata"),
        ("Telangana",    "Hyderabad"),
        ("Gujarat",      "Ahmedabad"),
        ("Punjab",       "Amritsar"),
        ("Uttar Pradesh","Lucknow"),
        ("Rajasthan",    "Jaipur"),
    ]
    results = []
    for state, district in locations:
        w  = mock_weather(state, district)
        tr = weather_triggers_parametric(w)
        results.append({
            "state":    state,
            "district": district,
            "weather":  w,
            "trigger":  tr,
        })
    return {"triggers": results, "checked_at": datetime.datetime.now().isoformat()}


# ─────────────────────────────────────────────
# TASK 3: ENHANCED FRAUD-CHECK + RISK-SCORE
# ─────────────────────────────────────────────

# District bounding boxes: [min_lat, max_lat, min_lng, max_lng]
DISTRICT_BBOX: Dict[str, List[float]] = {
    "Hyderabad":      [17.20, 17.60,  78.30,  78.70],
    "Mumbai":         [18.85, 19.30,  72.75,  73.05],
    "Delhi":          [28.40, 28.90,  76.85,  77.40],
    "Bengaluru":      [12.75, 13.20,  77.40,  77.80],
    "Chennai":        [12.90, 13.25,  80.10,  80.35],
    "Pune":           [18.40, 18.65,  73.75,  74.00],
    "Kolkata":        [22.45, 22.70,  88.25,  88.50],
    "Ahmedabad":      [22.95, 23.15,  72.50,  72.70],
    "Jaipur":         [26.78, 27.00,  75.70,  75.90],
    "Lucknow":        [26.75, 27.00,  80.85,  81.05],
    "Surat":          [21.10, 21.30,  72.75,  72.95],
    "Indore":         [22.65, 22.78,  75.80,  75.95],
    "Visakhapatnam":  [17.60, 17.80,  83.15,  83.35],
    "Warangal":       [17.90, 18.10,  79.55,  79.75],
    "Nizamabad":      [18.60, 18.75,  78.05,  78.20],
    "Nagpur":         [21.05, 21.25,  79.00,  79.20],
}

DISRUPTION_WEATHER_RULES: Dict[str, Dict[str, Any]] = {
    "HEAVY_RAIN":    {"field": "weather_actual_rainfall", "operator": ">=", "threshold": 50},
    "EXTREME_RAIN":  {"field": "weather_actual_rainfall", "operator": ">=", "threshold": 100},
    "CYCLONE":       {"field": "weather_actual_rainfall", "operator": ">=", "threshold": 200},
    "EXTREME_HEAT":  {"field": "weather_actual_temp",     "operator": ">=", "threshold": 42},
    "SEVERE_HEAT":   {"field": "weather_actual_temp",     "operator": ">=", "threshold": 45},
    "HIGH_WINDS":    {"field": "weather_actual_wind",     "operator": ">=", "threshold": 60},
    "CYCLONE_WINDS": {"field": "weather_actual_wind",     "operator": ">=", "threshold": 80},
    "HAZARDOUS_AQI": {"field": "weather_actual_aqi",      "operator": ">=", "threshold": 300},
}


class GigFraudRequest(BaseModel):
    claim_id:                   str
    worker_id:                  str
    district:                   str
    claimed_disruption:         str          # e.g. "HEAVY_RAIN"
    claim_date:                 str
    worker_lat:                 Optional[float] = None
    worker_lng:                 Optional[float] = None
    registered_district:        str
    previous_claims_this_month: int = 0
    # Actual weather readings at the time of claim
    weather_actual_rainfall:    float = 0.0
    weather_actual_temp:        float = 28.0
    weather_actual_wind:        float = 10.0
    weather_actual_aqi:         int   = 80


class RiskScoreRequest(BaseModel):
    district:           str
    platform:           str
    avg_weekly_earning: float = 4000.0
    months_active:      Optional[int] = 3
    prior_claims:       Optional[int] = 0


def _check_gps_spoofing(lat: Optional[float], lng: Optional[float], district: str) -> int:
    """Returns fraud points (0 or 40) based on GPS vs bounding box."""
    if lat is None or lng is None:
        return 0   # no GPS data — skip check
    bbox = DISTRICT_BBOX.get(district)
    if bbox is None:
        return 0   # unknown district — skip
    min_lat, max_lat, min_lng, max_lng = bbox
    if not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng):
        return 40
    return 0


def _check_weather_match(req: GigFraudRequest) -> int:
    """Returns fraud points for weather mismatches."""
    points = 0
    disruption = req.claimed_disruption.upper().replace(" ", "_")

    # Custom rule lookup
    rule = DISRUPTION_WEATHER_RULES.get(disruption)
    if rule:
        field = rule["field"]
        actual = getattr(req, field, None)
        if actual is not None:
            threshold = rule["threshold"]
            if rule["operator"] == ">=" and actual < threshold:
                points += 35
        return points

    # Legacy checks
    if "HEAVY_RAIN" in disruption or "RAIN" in disruption:
        if req.weather_actual_rainfall < 50:
            points += 35
    if "EXTREME_HEAT" in disruption or "HEAT" in disruption:
        if req.weather_actual_temp < 42:
            points += 35
    if "WIND" in disruption or "CYCLONE" in disruption:
        if req.weather_actual_wind < 60:
            points += 35
    if "AQI" in disruption or "POLLUTION" in disruption:
        if req.weather_actual_aqi < 200:
            points += 35
    return points


@app.post("/fraud-check")
def gig_fraud_check(req: GigFraudRequest):
    """
    GigShield fraud detection:
      1. GPS spoofing check        → +40 points
      2. Weather mismatch check    → +35 points
      3. Duplicate flood check     → +25 points
    Decision bands:
       0–30  → AUTO_APPROVED
      31–60  → APPROVED_WITH_AUDIT
      61–85  → FLAGGED_FOR_REVIEW
      86–100 → AUTO_REJECTED
    """
    total = 0
    flags = []

    # 1. GPS spoofing
    gps_pts = _check_gps_spoofing(req.worker_lat, req.worker_lng, req.registered_district)
    if gps_pts > 0:
        flags.append(f"GPS_SPOOFING: worker location outside {req.registered_district} bounding box")
        total += gps_pts
    else:
        flags.append("GPS_OK" if req.worker_lat is not None else "GPS_NOT_PROVIDED")

    # 2. Weather mismatch
    wx_pts = _check_weather_match(req)
    if wx_pts > 0:
        flags.append(f"WEATHER_MISMATCH: claimed {req.claimed_disruption} but weather readings don't support it")
        total += wx_pts
    else:
        flags.append("WEATHER_MATCH")

    # 3. Duplicate / claim flood
    if req.previous_claims_this_month > 5:
        flags.append(f"CLAIM_FLOOD: {req.previous_claims_this_month} claims this month")
        total += 25
    else:
        flags.append("CLAIM_FREQUENCY_OK")

    total = min(total, 100)

    if total <= 30:
        decision = "AUTO_APPROVED"
        reason   = "All checks passed — claim auto-approved."
    elif total <= 60:
        decision = "APPROVED_WITH_AUDIT"
        reason   = "Minor anomalies detected — approved with audit trail."
    elif total <= 85:
        decision = "FLAGGED_FOR_REVIEW"
        reason   = "Significant fraud signals — flagged for manual review."
    else:
        decision = "AUTO_REJECTED"
        reason   = "Critical fraud signals — claim auto-rejected."

    return {
        "fraud_score": total,
        "decision":    decision,
        "flags":       flags,
        "reason":      reason,
        "claim_id":    req.claim_id,
        "worker_id":   req.worker_id,
        "analyzed_at": datetime.datetime.now().isoformat(),
    }


@app.post("/risk-score")
def compute_risk_score_endpoint(req: RiskScoreRequest):
    """
    Risk assessment: returns risk_multiplier and weekly_premium.
    risk_multiplier: 0.8 (low) → 2.0 (very high)
    """
    # Use a city-level state mapping for known districts
    known_states = {
        "Hyderabad": "Telangana", "Mumbai": "Maharashtra", "Delhi": "Delhi",
        "Bengaluru": "Karnataka", "Chennai": "Tamil Nadu", "Pune": "Maharashtra",
        "Kolkata": "West Bengal", "Ahmedabad": "Gujarat", "Jaipur": "Rajasthan",
        "Lucknow": "Uttar Pradesh", "Visakhapatnam": "Andhra Pradesh",
        "Warangal": "Telangana", "Nizamabad": "Telangana",
    }
    state = known_states.get(req.district, "Maharashtra")

    raw_score = compute_risk_score(req.platform, state, req.months_active or 3, req.prior_claims or 0)
    multiplier = round(0.80 + raw_score * 1.20, 2)   # range 0.80 – 2.0
    multiplier = max(0.80, min(2.00, multiplier))

    base_premium = 40.0  # Smart plan base
    weekly_premium = round(base_premium * multiplier, 2)

    return {
        "district":        req.district,
        "platform":        req.platform,
        "risk_score":      raw_score,
        "risk_category":   "High" if raw_score >= 0.70 else "Moderate" if raw_score >= 0.45 else "Low",
        "risk_multiplier": multiplier,
        "weekly_premium":  weekly_premium,
        "avg_weekly_earning": req.avg_weekly_earning,
        "income_at_risk_pct": round(raw_score * 100, 1),
        "analyzed_at":     datetime.datetime.now().isoformat(),
    }
