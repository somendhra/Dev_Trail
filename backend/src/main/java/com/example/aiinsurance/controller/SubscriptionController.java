package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Subscription;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.SubscriptionService;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:*")
public class SubscriptionController {

    @Autowired private SubscriptionService subscriptionService;
    @Autowired private UserService          userService;
    @Autowired private JwtUtil              jwtUtil;

    // ── helper to extract User from token ─────────────────────────────────────
    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Unauthorized");
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token))
            throw new RuntimeException("Invalid token");
        String email = jwtUtil.extractUsername(token);
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * POST /api/subscriptions/buy
     * Body: { planId, method, upiId?, txnReference? }
     *
     * method can be: "UPI", "CARD", "WALLET", "FREE_TRIAL"
     *
     * For FREE_TRIAL the amount is 0, subscription starts in TRIAL state.
     * For paid methods the frontend should pass the gateway reference.
     */
    @PostMapping("/buy")
    public ResponseEntity<?> buy(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body
    ) {
        try {
            User user    = resolveUser(authHeader);
            Long planId  = Long.valueOf(body.get("planId").toString());
            String method= body.getOrDefault("method", "FREE_TRIAL").toString();
            String upiId = (String) body.get("upiId");
            String txnRef= (String) body.get("txnReference");

            Map<String, Object> result =
                    subscriptionService.subscribe(user, planId, method, upiId, txnRef);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/subscriptions/my
     * Returns all subscriptions for the logged-in user.
     */
    @GetMapping("/my")
    public ResponseEntity<?> mySubscriptions(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = resolveUser(authHeader);
            List<Subscription> subs = subscriptionService.getAllSubscriptions(user);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Subscription s : subs) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",              s.getId());
                m.put("planName",        s.getPlan().getName());
                m.put("weeklyPremium",   s.getPlan().getWeeklyPremium());
                m.put("coverageAmount",  s.getPlan().getCoverageAmount());
                m.put("status",          s.getStatus().name());
                m.put("startDate",       s.getStartDate());
                m.put("trialEndDate",    s.getTrialEndDate());
                m.put("nextPaymentDate", s.getNextPaymentDate());
                m.put("endDate",         s.getEndDate());
                result.add(m);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/subscriptions/payments
     * Returns payment history for the logged-in user.
     */
    @GetMapping("/payments")
    public ResponseEntity<?> paymentHistory(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = resolveUser(authHeader);
            List<Payment> payments = subscriptionService.getPaymentHistory(user);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Payment p : payments) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",             p.getId());
                m.put("plan",           p.getSubscription().getPlan().getName());
                m.put("amount",         p.getAmount());
                m.put("coverage",       p.getSubscription().getPlan().getCoverageAmount());
                m.put("method",         p.getMethod().name());
                m.put("status",         p.getStatus().name());
                m.put("subStatus",      p.getSubscription().getStatus().name());
                m.put("reference",      p.getGatewayReference());
                m.put("upiId",          p.getUpiId());
                m.put("isClaimed",      p.isClaimed());
                m.put("date",           p.getCreatedAt());
                m.put("claimedAt",      p.getClaimedAt());
                result.add(m);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/subscriptions/dashboard
     * Returns a full dashboard summary for the logged-in user.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = resolveUser(authHeader);
            Map<String, Object> summary = subscriptionService.getDashboardSummary(user);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
