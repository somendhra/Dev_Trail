package com.example.aiinsurance.controller;

import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.WeatherService;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * WeatherController — exposes real-time weather data for the frontend.
 *
 * Public endpoints (no auth):
 *   GET /api/weather/check?district={district}&state={state}
 *
 * Authenticated endpoints:
 *   GET /api/weather/current   — fetches live weather for the logged-in
 *                                 worker's registered district
 */
@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired private WeatherService weatherService;
    @Autowired private UserService     userService;
    @Autowired private JwtUtil         jwtUtil;

    // ── Public: query any district ────────────────────────────────────────────────

    /**
     * GET /api/weather/check?district=Hyderabad&state=Telangana
     *
     * Returns live (or mock) weather + computed disruption risk for the
     * requested location.  No authentication required.
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkDistrict(
            @RequestParam String district,
            @RequestParam(required = false, defaultValue = "") String state) {
        try {
            Map<String, Object> w = weatherService.getWeatherAsMap(district, state);
            return ResponseEntity.ok(enrichWithAlerts(w));
        } catch (Exception e) {
            return ResponseEntity.ok(errorMap("Weather service unavailable: " + e.getMessage()));
        }
    }

    // ── Authenticated: weather for logged-in worker ──────────────────────────────

    /**
     * GET /api/weather/current
     * Authorization: Bearer {token}
     *
     * Uses the district + state stored in the authenticated worker's profile.
     * If no district is set, falls back to the worker's state.
     */
    @GetMapping("/current")
    public ResponseEntity<?> currentUserWeather(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String email = resolveEmail(authHeader);
            if (email == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorised"));
            }

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user     = userOpt.get();
            String district = coalesce(user.getDistrict(), user.getState(), "Hyderabad");
            String state    = coalesce(user.getState(), district);

            Map<String, Object> w = weatherService.getWeatherAsMap(district, state);
            Map<String, Object> response = enrichWithAlerts(w);
            response.put("workerDistrict", district);
            response.put("workerState",    state);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(errorMap("Weather service unavailable: " + e.getMessage()));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    /**
     * Adds human-readable alert level + parametric status to the weather map.
     */
    private Map<String, Object> enrichWithAlerts(Map<String, Object> w) {
        double risk  = toDouble(w.get("riskIndex"), 0.0);
        double rain  = toDouble(w.get("rainfall"),  0.0);
        double temp  = toDouble(w.get("temperature"), 28.0);
        double wind  = toDouble(w.get("wind_kmh"),   10.0);
        int    aqi   = (int) toDouble(w.get("aqi"), 80.0);

        // Build breach list
        java.util.List<String> breaches = new java.util.ArrayList<>();
        if (rain  >= 50)  breaches.add("HEAVY_RAIN");
        if (temp  >= 42)  breaches.add("EXTREME_HEAT");
        if (wind  >= 70)  breaches.add("HIGH_WINDS");
        if (aqi   >= 300) breaches.add("HAZARDOUS_AQI");

        String alertLevel = risk >= 0.75 ? "CRITICAL"
                          : risk >= 0.50 ? "HIGH"
                          : risk >= 0.30 ? "MODERATE"
                          : "LOW";

        Map<String, Object> enriched = new HashMap<>(w);
        enriched.put("alertLevel",           alertLevel);
        enriched.put("activeBreaches",       breaches);
        enriched.put("parametricTriggered",  !breaches.isEmpty());
        enriched.put("alertEmoji",           alertEmoji(alertLevel));
        enriched.put("alertMessage",         alertMessage(breaches, (String) w.get("district")));

        return enriched;
    }

    private String alertEmoji(String level) {
        return switch (level) {
            case "CRITICAL" -> "🔴";
            case "HIGH"     -> "🟠";
            case "MODERATE" -> "🟡";
            default         -> "🟢";
        };
    }

    private String alertMessage(java.util.List<String> breaches, String district) {
        if (breaches.isEmpty()) return "✅ All clear — normal conditions in " + district;
        String joined = String.join(", ", breaches).replace("_", " ").toLowerCase();
        return "⚠️ " + joined + " detected in " + district + ". Auto-claim may be processed.";
    }

    private String resolveEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        return jwtUtil.extractUsername(token);
    }

    private double toDouble(Object v, double def) {
        if (v == null) return def;
        try { return ((Number) v).doubleValue(); } catch (Exception e) { return def; }
    }

    private String coalesce(String... vals) {
        for (String v : vals) if (v != null && !v.isBlank()) return v;
        return "";
    }

    private Map<String, Object> errorMap(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("error", msg);
        m.put("alertLevel", "UNKNOWN");
        m.put("parametricTriggered", false);
        return m;
    }
}
