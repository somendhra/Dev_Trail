package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Subscription;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.AdminRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@Transactional
public class ClaimController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ClaimRequestRepository claimRequestRepository;

    /**
     * POST /api/payments/{id}/claim
     *
     * When the user clicks "Claim" on an approved insurance payment:
     * 1. Validates ownership + approved + unclaimed
     * 2. Credits the COVERAGE AMOUNT (not premium) to User Wallet
     * 3. Deducts the COVERAGE AMOUNT from Admin Wallet (insurance fund)
     * 4. Marks the payment as CLAIMED (new status)
     * 5. Marks the subscription as EXPIRED (policy used)
     * 6. Sends success notification to user
     */
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimPayment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing Authorization header"));
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        Optional<Payment> payOpt = paymentRepository.findById(id);
        if (payOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
        Payment p = payOpt.get();

        if (!p.getUser().getEmail().equals(username)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        if (p.getStatus() != Payment.Status.APPROVED && p.getStatus() != Payment.Status.SUCCESS) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment is not approved/verified yet"));
        }

        if (p.isClaimed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This payment has already been claimed"));
        }

        // Limit to 1 claim per week (across disaster and regular claims)
        java.time.LocalDateTime oneWeekAgo = java.time.LocalDateTime.now().minusDays(7);
        boolean recentlyClaimedPayment = paymentRepository.findAll().stream()
                .anyMatch(pay -> pay.getUser().getId().equals(p.getUser().getId()) 
                              && pay.isClaimed() 
                              && pay.getClaimedAt() != null 
                              && pay.getClaimedAt().isAfter(oneWeekAgo));
        
        boolean recentlyClaimedDisaster = claimRequestRepository.findByUser(p.getUser()).stream()
                .anyMatch(r -> r.isClaimed() && r.getCreatedAt().isAfter(oneWeekAgo));

        if (recentlyClaimedPayment || recentlyClaimedDisaster) {
             return ResponseEntity.badRequest().body(Map.of("error", "You can only claim one payout per week. Please wait until next week."));
        }

        // Get coverage amount from plan
        double coverageAmount = 0.0;
        if (p.getSubscription() != null && p.getSubscription().getPlan() != null) {
            coverageAmount = p.getSubscription().getPlan().getCoverageAmount();
        } else {
            // Fallback: use premium amount if no plan linked
            coverageAmount = p.getAmount();
        }

        User managedUser = p.getUser();

        // 1. Credit COVERAGE AMOUNT to User Wallet
        // Re-fetch user to ensure we have the latest managed entity and balance
        managedUser = userService.findById(managedUser.getId()).orElse(managedUser);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + coverageAmount);
        userService.updateUser(managedUser);

        // 2. Deduct COVERAGE AMOUNT from Admin Wallet (insurance fund)
        try {
            List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                double newAdminBalance = admin.getWalletBalance() - coverageAmount;
                admin.setWalletBalance(Math.max(0.0, newAdminBalance)); // floor at 0
                adminRepository.save(admin);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not deduct from admin wallet: " + e.getMessage());
        }

        // 3. Mark payment as CLAIMED
        p.setStatus(Payment.Status.CLAIMED);
        p.setClaimed(true);
        p.setClaimedAt(LocalDateTime.now());
        paymentRepository.save(p);

        // 4. Mark subscription as EXPIRED (policy used up)
        try {
            if (p.getSubscription() != null) {
                Subscription sub = p.getSubscription();
                sub.setStatus(Subscription.Status.EXPIRED);
                subscriptionRepository.save(sub);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not expire subscription: " + e.getMessage());
        }

        // 5. Send success notification to user
        try {
            Notification n = new Notification();
            n.setUser(managedUser);
            n.setTitle("💰 Claim Successful!");
            n.setMessage("₹" + (long) coverageAmount + " has been credited to your wallet. " +
                    "Your insurance policy is now expired. Purchase a new plan for future coverage.");
            n.setType("SUCCESS");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Warning: Could not send claim notification: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Coverage claimed successfully",
            "coverageAmount", coverageAmount,
            "newBalance", managedUser.getWalletBalance()
        ));
    }
}
