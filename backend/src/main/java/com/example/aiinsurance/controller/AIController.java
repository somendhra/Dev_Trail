package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.AIService;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * REST controller exposing all AI model endpoints to the frontend.
 * Delegates computation to AIService → Python FastAPI microservice.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired private AIService              aiService;
    @Autowired private JwtUtil                jwtUtil;
    @Autowired private UserService            userService;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private ClaimRequestRepository claimRequestRepository;

    // ── Helper: extract user from JWT ──────────────────────────────────────────
    private User getUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Missing auth");
        String token    = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        return userService.findByEmail(username).orElseThrow();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Dynamic Premium Calculation
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/premium")
    public ResponseEntity<?> getPremium(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "Smart") String planName) {
        User user       = getUser(authHeader);
        int claimCount  = claimRequestRepository.findByUser(user).size();
        int months      = calculateMonthsActive(user.getCreatedAt());
        Map<String, Object> result = aiService.calculatePremium(
            user.getPlatform(), user.getState(), user.getDistrict(),
            planName, months, claimCount);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Risk Assessment
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/risk")
    public ResponseEntity<?> getRisk(
            @RequestHeader("Authorization") String authHeader) {
        User user       = getUser(authHeader);
        int claimCount  = claimRequestRepository.findByUser(user).size();
        int months      = calculateMonthsActive(user.getCreatedAt());
        Map<String, Object> result = aiService.assessRisk(
            user.getId(), user.getPlatform(), user.getState(),
            user.getDistrict(), months, claimCount);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Fraud Detection — called when a claim is submitted
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/fraud/detect")
    public ResponseEntity<?> fraudDetect(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = getUser(authHeader);

        String situation      = (String) body.getOrDefault("situation", "UNKNOWN");
        double claimAmount    = Double.parseDouble(body.getOrDefault("claim_amount", "0").toString());
        double coverageAmount = Double.parseDouble(body.getOrDefault("coverage_amount", "999999").toString());

        // Days since last claim
        int daysSinceLast = claimRequestRepository.findByUser(user).stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .findFirst()
            .map(r -> (int) ChronoUnit.DAYS.between(r.getCreatedAt(), LocalDateTime.now()))
            .orElse(365);

        // Claims in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        int claimsLast30 = (int) claimRequestRepository.findByUser(user).stream()
            .filter(r -> r.getCreatedAt().isAfter(thirtyDaysAgo))
            .count();

        boolean hasSub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user)
            .map(s -> s.getStatus().name().equals("ACTIVE") || s.getStatus().name().equals("TRIAL"))
            .orElse(false);

        // Account age in days
        int accountAge = (int) ChronoUnit.DAYS.between(
            user.getCreatedAt(), LocalDateTime.now());

        // Weather risk for user location
        Map<String, Object> weather = aiService.getWeather(
            user.getState() != null ? user.getState() : "Maharashtra",
            user.getDistrict() != null ? user.getDistrict() : "Mumbai");
        double weatherRisk = weather.containsKey("risk_index")
            ? Double.parseDouble(weather.get("risk_index").toString())
            : 0.5;

        Map<String, Object> result = aiService.detectFraud(
            user.getId(), situation,
            user.getState(), user.getState(),  // claimed=registered for now
            hasSub, daysSinceLast, weatherRisk,
            claimAmount, coverageAmount,
            accountAge, claimsLast30);

        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Parametric Check for authenticated user
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/parametric/check")
    public ResponseEntity<?> parametricCheck(
            @RequestHeader("Authorization") String authHeader) {
        User user = getUser(authHeader);

        // Get coverage and triggers from latest subscription
        var latestSub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user);
        
        double coverage = latestSub.map(s -> s.getPlan().getCoverageAmount()).orElse(6000.0);
        String planName = latestSub.map(s -> s.getPlan().getName()).orElse("Smart");
        
        java.util.List<java.util.Map<String, Object>> triggers = java.util.List.of();
        if (latestSub.isPresent() && latestSub.get().getPlan().getParametricTriggers() != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                triggers = mapper.readValue(latestSub.get().getPlan().getParametricTriggers(), 
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
            } catch (Exception ignored) {}
        }

        Map<String, Object> result = aiService.checkParametric(
            user.getId(),
            user.getState()    != null ? user.getState()    : "Maharashtra",
            user.getDistrict() != null ? user.getDistrict() : "Mumbai",
            planName, coverage, triggers);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Weather for user location
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(
            @RequestHeader("Authorization") String authHeader) {
        User user = getUser(authHeader);
        Map<String, Object> result = aiService.getWeather(
            user.getState()    != null ? user.getState()    : "Maharashtra",
            user.getDistrict() != null ? user.getDistrict() : "Mumbai");
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. AI Dashboard — full AI insights for authenticated user
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<?> aiDashboard(
            @RequestHeader("Authorization") String authHeader) {
        User user       = getUser(authHeader);
        int claimCount  = claimRequestRepository.findByUser(user).size();
        int months      = calculateMonthsActive(user.getCreatedAt());
        Map<String, Object> result = aiService.getDashboard(
            user.getPlatform(),
            user.getState() != null ? user.getState() : "Maharashtra",
            months, claimCount);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Plan Recommendation
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/plans/recommend")
    public ResponseEntity<?> recommendPlan(
            @RequestHeader("Authorization") String authHeader) {
        User user       = getUser(authHeader);
        int claimCount  = claimRequestRepository.findByUser(user).size();
        int months      = calculateMonthsActive(user.getCreatedAt());
        Map<String, Object> result = aiService.recommendPlan(
            user.getPlatform(),
            user.getState() != null ? user.getState() : "Maharashtra",
            months, claimCount);
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Fraud Statistics (Admin)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/fraud/stats")
    public ResponseEntity<?> fraudStats() {
        return ResponseEntity.ok(aiService.getFraudStats());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. All Parametric Triggers (India-wide)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/parametric/triggers")
    public ResponseEntity<?> allTriggers() {
        return ResponseEntity.ok(aiService.getAllTriggers());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Admin Weather Report — all active user locations
    // Call: GET /api/ai/admin/weather-report  (requires admin JWT)
    // ─────────────────────────────────────────────────────────────────────────
    @Autowired(required = false)
    private com.example.aiinsurance.repository.UserRepository userRepository;

    @GetMapping("/admin/weather-report")
    public ResponseEntity<?> adminWeatherReport(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin token
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body(Map.of("error", "Missing auth"));

            // Get all distinct states/districts from registered users
            java.util.List<java.util.Map<String, Object>> locationReports = new java.util.ArrayList<>();
            java.util.Set<String> processed = new java.util.HashSet<>();

            if (userRepository != null) {
                java.util.List<User> allUsers = userRepository.findAll();
                for (User u : allUsers) {
                    if (u.getState() == null || u.getState().isBlank()) continue;
                    String key = u.getState() + "|" + (u.getDistrict() != null ? u.getDistrict() : "");
                    if (processed.contains(key)) continue;
                    processed.add(key);

                    try {
                        Map<String, Object> weather = aiService.getWeather(
                                u.getState(),
                                u.getDistrict() != null ? u.getDistrict() : u.getState()
                        );
                        Map<String, Object> entry = new java.util.LinkedHashMap<>(weather);
                        entry.put("state", u.getState());
                        entry.put("district", u.getDistrict() != null ? u.getDistrict() : "—");
                        entry.put("usersInLocation", allUsers.stream()
                                .filter(x -> u.getState().equals(x.getState()) &&
                                        (u.getDistrict() == null || u.getDistrict().equals(x.getDistrict())))
                                .count());
                        locationReports.add(entry);
                    } catch (Exception ignored) {}
                }
            }

            return ResponseEntity.ok(java.util.Map.of("locationReports", locationReports));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utility
    // ─────────────────────────────────────────────────────────────────────────
    private int calculateMonthsActive(LocalDateTime createdAt) {
        if (createdAt == null) return 1;
        return (int) Math.max(1, ChronoUnit.MONTHS.between(createdAt, LocalDateTime.now()));
    }
}
