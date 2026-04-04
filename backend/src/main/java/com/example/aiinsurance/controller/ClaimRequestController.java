package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.ClaimRequest;
import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Subscription;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.AdminRepository;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.AIService;
import com.example.aiinsurance.service.ClaimService;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/claims/requests")
@CrossOrigin(origins = "*")
@Transactional
public class ClaimRequestController {

    @Autowired private AIService aiService;
    @Autowired private ClaimService claimService;
    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PaymentRepository paymentRepository;

    @PostMapping
    public ResponseEntity<?> submitRequest(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();

        Optional<Subscription> latestSub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (latestSub.isEmpty() || latestSub.get().getStatus() == Subscription.Status.EXPIRED) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active subscription found to file a claim"));
        }

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        boolean hasRecentClaim = claimRequestRepository.findByUser(user).stream()
                .anyMatch(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(oneWeekAgo));
        if (hasRecentClaim) {
            return ResponseEntity.badRequest().body(Map.of("error", "You have already filed a claim request within the last 7 days."));
        }

        ClaimRequest req = new ClaimRequest();
        req.setUser(user);
        req.setSubscription(latestSub.get());
        req.setSituation(body.get("situation"));
        req.setDescription(body.get("description"));
        req.setAmount(latestSub.get().getPlan().getCoverageAmount());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResult = (Map<String, Object>) aiService.detectFraud(
                    user.getId(),
                    req.getSituation(),
                    user.getState(),
                    user.getState(),
                    true,
                    30,
                    0.8,
                    req.getAmount(),
                    req.getAmount(),
                    30,
                    0
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> fraudAnalysis = (Map<String, Object>) aiResult.get("fraud_analysis");
            if (fraudAnalysis != null) {
                String recommendation = (String) aiResult.get("action");
                Double fraudScore = Double.valueOf(fraudAnalysis.get("fraud_score").toString());

                req.setDescription(req.getDescription() + "\n\n[AI ANALYTICS]: Risk Score "
                        + Math.round(fraudScore * 100) + "%. "
                        + recommendation.replace("_", " ") + ".");

                if ("REJECT_AUTO".equals(recommendation)) {
                    return ResponseEntity.status(403).body(Map.of(
                            "error", "Claim flagged as highly suspicious by AI engine. Please contact support.",
                            "ai_score", fraudScore
                    ));
                }

                if ("APPROVE_AUTO".equals(recommendation)) {
                    claimService.approveRequestInternal(req);
                    return ResponseEntity.ok(Map.of("message", "Claim approved automatically by AI.", "request", req));
                }
            }
        } catch (Exception e) {
            System.err.println("AI Fraud Analysis skipped (Service Offline): " + e.getMessage());
        }

        String triggerResult = claimService.evaluateTriggers(req, user);
        if ("APPROVE".equals(triggerResult)) {
            claimService.approveRequestInternal(req);
            return ResponseEntity.ok(Map.of("message", "Trigger matched! Claim approved automatically by AI monitoring.", "request", req));
        }
        if ("REJECT".equals(triggerResult)) {
            claimService.rejectRequestInternal(req,
                    "Weather thresholds for " + req.getSituation() + " were not met at your location. Claim auto-rejected.");
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Claim auto-rejected: Weather thresholds for " + req.getSituation() + " were not met."
            ));
        }

        ClaimRequest savedReq = claimRequestRepository.save(req);
        return ResponseEntity.ok(Map.of(
                "message", "Claim request submitted successfully. Our AI will review the situation.",
                "request", savedReq
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();
        return ResponseEntity.ok(claimRequestRepository.findByUser(user));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(claimRequestRepository.findAll());
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        if (req.getStatus() == ClaimRequest.Status.APPROVED || req.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Claim is already approved or claimed"));
        }
        claimService.approveRequestInternal(req);
        return ResponseEntity.ok(Map.of("message", "Claim request approved and payout processed automatically"));
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        claimService.rejectRequestInternal(req, "Your claim request was rejected. Please contact support for more details.");
        return ResponseEntity.ok(Map.of("message", "Claim request rejected"));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimPayout(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();

        ClaimRequest req = claimRequestRepository.findById(id).orElseThrow();
        if (!req.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        if (req.getStatus() != ClaimRequest.Status.APPROVED) {
            return ResponseEntity.badRequest().body(Map.of("error", "Claim is not approved yet"));
        }

        if (req.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already claimed"));
        }

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        boolean recentlyClaimedDisaster = claimRequestRepository.findByUser(user).stream()
                .anyMatch(r -> r.isClaimed() && r.getCreatedAt() != null && r.getCreatedAt().isAfter(oneWeekAgo));

        boolean recentlyClaimedPayment = paymentRepository.findAll().stream()
                .anyMatch(pay -> pay.getUser().getId().equals(user.getId())
                        && pay.isClaimed()
                        && pay.getClaimedAt() != null
                        && pay.getClaimedAt().isAfter(oneWeekAgo));

        if (recentlyClaimedDisaster || recentlyClaimedPayment) {
            return ResponseEntity.badRequest().body(Map.of("error", "You can only claim one payout per week. Please wait until next week."));
        }

        User managedUser = userService.findById(user.getId()).orElse(user);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + req.getAmount());
        userService.updateUser(managedUser);

        try {
            List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                double newAdminBalance = admin.getWalletBalance() - req.getAmount();
                admin.setWalletBalance(Math.max(0.0, newAdminBalance));
                adminRepository.save(admin);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not deduct from admin wallet: " + e.getMessage());
        }

        req.setClaimed(true);
        claimRequestRepository.save(req);

        Subscription sub = req.getSubscription();
        sub.setStatus(Subscription.Status.EXPIRED);
        subscriptionRepository.save(sub);

        Notification n = new Notification();
        n.setUser(managedUser);
        n.setTitle("Payout Successful!");
        n.setMessage("₹" + req.getAmount() + " has been added to your wallet. Your current plan has expired; please purchase a new one for future coverage.");
        n.setType("SUCCESS");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Payout claimed successfully", "newBalance", managedUser.getWalletBalance()));
    }
}
