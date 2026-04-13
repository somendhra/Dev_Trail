package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.AdminRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.PlanService;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.service.QueryService;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PlanService planService;

    @Autowired
    private QueryService queryService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private com.example.aiinsurance.repository.ClaimRequestRepository claimRequestRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ─── helpers ─────────────────────────────────────────────────────────────

    /** Fetch (or lazily create) the single admin record to use as the insurance fund wallet. */
    private Admin getAdminWallet() {
        return adminService.getAdminWallet();
    }

    // ------------ authentication ----------------

    @PutMapping("/auth/admin/change")
    public ResponseEntity<?> changeCredentials(@RequestHeader("Authorization") String authHeader,
                                               @RequestBody Map<String, String> updates) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token) || !jwtUtil.extractIsAdmin(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }
            String currentEmail = jwtUtil.extractUsername(token);
            Optional<Admin> adminOpt = adminService.findByEmail(currentEmail);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
            }
            Admin admin = adminOpt.get();
            String newEmail = updates.get("email");
            String newPassword = updates.get("password");
            if (newEmail != null) {
                newEmail = newEmail.toLowerCase();
            }
            if (newEmail != null && !newEmail.equals(currentEmail) && adminService.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "email already taken"));
            }
            Admin saved = adminService.changeCredentials(admin.getId(), newEmail, newPassword);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Credentials updated");
            resp.put("email", saved.getEmail());
            String newToken = jwtUtil.generateToken(saved.getEmail(), true);
            resp.put("token", newToken);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdmin(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody Admin newAdmin) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token) || !jwtUtil.extractIsAdmin(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            if (newAdmin.getEmail() == null || newAdmin.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (newAdmin.getPassword() == null || newAdmin.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }

            String targetEmail = newAdmin.getEmail().toLowerCase().trim();
            if (adminService.findByEmail(targetEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin email already exists"));
            }

            newAdmin.setEmail(targetEmail);
            Admin saved = adminService.save(newAdmin);
            return ResponseEntity.ok(Map.of("message", "Admin created successfully", "email", saved.getEmail()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // ------------ user management ----------------
    @GetMapping("/admin/users")
    public List<User> listUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("platform")) user.setPlatform((String) updates.get("platform"));
        if (updates.containsKey("password")) {
            user.setPassword(passwordEncoder.encode((String) updates.get("password")));
        }
        userService.updateUser(user);
        return ResponseEntity.ok(user);
    }

    // ------------ user queries ----------------
    @GetMapping("/admin/queries")
    public List<com.example.aiinsurance.model.Query> listQueries() {
        return queryService.getAll().stream()
                .filter(q -> !q.isClearedByAdmin())
                .toList();
    }

    @PutMapping("/admin/queries/{id}/reply")
    public ResponseEntity<?> replyQuery(@PathVariable Long id, @RequestBody Map<String,String> body) {
        Optional<com.example.aiinsurance.model.Query> qOpt = queryService.findById(id);
        if (qOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error","Query not found"));
        }
        com.example.aiinsurance.model.Query q = qOpt.get();
        String answer = body.get("answer");
        if (answer == null || answer.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error","answer required"));
        }
        
        String replyTo = body.getOrDefault("replyToMessage", null);

        // Use the new service method to create a NEW chat message from admin
        com.example.aiinsurance.model.Query reply = queryService.createFromAdmin(q.getUser(), answer, replyTo);
        
        return ResponseEntity.ok(reply);
    }

    @DeleteMapping("/admin/queries/user/{userId}/clear")
    public ResponseEntity<?> clearUserChat(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        queryService.clearForAdmin(userOpt.get());
        return ResponseEntity.ok(Map.of("message", "Chat cleared for admin"));
    }

    // ------------ plan management ----------------
    @GetMapping("/admin/plans")
    public List<Plan> listPlans() {
        return planService.getAllPlans();
    }

    @PutMapping("/admin/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id,
                                        @RequestBody Map<String, Object> updates) {
        try {
            Plan plan = planService.getPlanById(id);
            if (updates.containsKey("weeklyPremium")) {
                plan.setWeeklyPremium(Double.valueOf(updates.get("weeklyPremium").toString()));
            }
            if (updates.containsKey("coverageAmount")) {
                plan.setCoverageAmount(Double.valueOf(updates.get("coverageAmount").toString()));
            }
            if (updates.containsKey("name")) {
                plan.setName(updates.get("name").toString());
            }
            if (updates.containsKey("features")) {
                Object fObj = updates.get("features");
                if (fObj instanceof java.util.List) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> featureList = (java.util.List<String>) fObj;
                    plan.setFeatures(String.join("|", featureList));
                } else if (fObj != null) {
                    plan.setFeatures(fObj.toString());
                }
            }
            if (updates.containsKey("parametricTriggers")) {
                plan.setParametricTriggers(updates.get("parametricTriggers").toString());
            }
            Plan saved = planService.savePlan(plan);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/plans")
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> body) {
        try {
            Plan p = new Plan();
            p.setName(body.get("name").toString());
            p.setWeeklyPremium(Double.valueOf(body.getOrDefault("weeklyPremium", "0").toString()));
            p.setCoverageAmount(Double.valueOf(body.getOrDefault("coverageAmount", "0").toString()));
            p.setRiskLevel(body.getOrDefault("riskLevel", "Moderate").toString());
            p.setTrialDays(Integer.valueOf(body.getOrDefault("trialDays", 7).toString()));
            
            Object fObj = body.get("features");
            if (fObj instanceof java.util.List) {
                @SuppressWarnings("unchecked")
                java.util.List<String> featureList = (java.util.List<String>) fObj;
                p.setFeatures(String.join("|", featureList));
            } else if (fObj != null) {
                p.setFeatures(fObj.toString());
            } else {
                p.setFeatures("Standard Coverage");
            }

            if (body.containsKey("parametricTriggers")) {
                p.setParametricTriggers(body.get("parametricTriggers").toString());
            }

            Plan saved = planService.savePlan(p);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ------------ payment approval ----------------
    @GetMapping("/admin/payments")
    public List<Payment> listPayments() {
        return paymentRepository.findAll();
    }

    /**
     * Approve a payment:
     * 1. Sets status → APPROVED
     * 2. Credits the premium amount to Admin Wallet (insurance fund)
     * 3. Activates the subscription (status → ACTIVE)
     * 4. Sends an "Insurance Active" notification to the user
     */
    @PutMapping("/admin/payments/{id}/approve")
    public ResponseEntity<?> approvePayment(@PathVariable Long id) {
        Optional<Payment> payOpt = paymentRepository.findById(id);
        if (payOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
        Payment p = payOpt.get();
        if (p.getStatus() != Payment.Status.PENDING) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only pending payments can be approved"));
        }

        // Admin Wallet (Insurance Fund) accumulates all premiums to cover future claims.
        // We do NOT block premium collection if the fund is low; we want it to grow.
        // The solvency check is moved to a warning or purely informational.


        // 1. Approve the payment
        p.setStatus(Payment.Status.APPROVED);
        paymentRepository.save(p);

        // 2. Credit the premium amount to Admin Wallet (insurance fund)
        // If the method was WALLET, we MUST deduct from the user's wallet balance.
        try {
            Admin admin = getAdminWallet();
            admin.setWalletBalance(admin.getWalletBalance() + p.getAmount());
            adminRepository.save(admin);

            if (p.getMethod() == Payment.Method.WALLET) {
                User user = p.getUser();
                if (user.getWalletBalance() < p.getAmount()) {
                    // This should have been checked at submission, but let's be safe
                    p.setStatus(Payment.Status.FAILED);
                    paymentRepository.save(p);
                    return ResponseEntity.badRequest().body(Map.of("error", "User has insufficient wallet balance to pay this premium."));
                }
                user.setWalletBalance(user.getWalletBalance() - p.getAmount());
                userService.updateUser(user);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not update wallet balances: " + e.getMessage());
        }

        // 3. Activate the subscription
        try {
            com.example.aiinsurance.model.Subscription sub = p.getSubscription();
            if (sub != null) {
                sub.setStatus(com.example.aiinsurance.model.Subscription.Status.ACTIVE);
                sub.setStartDate(java.time.LocalDateTime.now());
                sub.setEndDate(java.time.LocalDateTime.now().plusDays(7));
                subscriptionRepository.save(sub);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not activate subscription: " + e.getMessage());
        }

        // 4. Notify user that insurance is now ACTIVE
        try {
            User user = p.getUser();
            double covAmt = (p.getSubscription() != null && p.getSubscription().getPlan() != null)
                             ? p.getSubscription().getPlan().getCoverageAmount() : p.getAmount();

            Notification n = new Notification();
            n.setUser(user);
            n.setTitle("🛡️ Insurance Policy Activated!");
            n.setMessage("Your insurance policy is now ACTIVE! You are covered for ₹" +
                    (long) covAmt + ". You can now file a claim directly from your dashboard.");
            n.setType("SUCCESS");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Warning: Could not send activation notification: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Payment approved and policy activated", "payment", p));
    }

    @PutMapping("/admin/payments/{id}/reject")
    public ResponseEntity<?> rejectPayment(@PathVariable Long id) {
        Optional<Payment> payOpt = paymentRepository.findById(id);
        if (payOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
        Payment p = payOpt.get();
        if (p.getStatus() != Payment.Status.PENDING) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only pending payments can be rejected"));
        }
        p.setStatus(Payment.Status.REJECTED);
        paymentRepository.save(p);

        // Notify user of rejection
        try {
            Notification n = new Notification();
            n.setUser(p.getUser());
            n.setTitle("Payment Rejected");
            n.setMessage("Your insurance payment was rejected. Please contact support or try again with correct payment details.");
            n.setType("DANGER");
            notificationRepository.save(n);
        } catch (Exception e) {
            System.err.println("Warning: Could not send rejection notification: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Payment rejected", "payment", p));
    }

    @DeleteMapping("/admin/payments/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            paymentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Payment deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        }
    }

    // ------------ Admin Wallet (Insurance Fund) ----------------

    /**
     * GET /api/admin/wallet
     * Returns Admin Wallet balance + full transaction history:
     *   - CREDIT entries: each APPROVED payment (premium collected)
     *   - DEBIT entries:  each CLAIMED payment or approved claim request (coverage paid out to user)
     * Balance = Total Premiums Collected - Total Claims Paid
     */
    @GetMapping("/admin/wallet")
    public ResponseEntity<?> getAdminWalletInfo() {
        try {
            getAdminWallet();


            List<Map<String, Object>> transactions = new ArrayList<>();

            // ── 1. Build transaction history from payments (premium credits) ──
            List<Payment> allPayments = paymentRepository.findAll();
            for (Payment p : allPayments) {
                double coverageAmount = 0.0;
                String planName = "Insurance Plan";
                String location = "—";
                if (p.getSubscription() != null && p.getSubscription().getPlan() != null) {
                    coverageAmount = p.getSubscription().getPlan().getCoverageAmount();
                    planName = p.getSubscription().getPlan().getName() + " Plan";
                }
                if (p.getUser() != null && p.getUser().getState() != null) {
                    location = (p.getUser().getDistrict() != null ? p.getUser().getDistrict() + ", " : "") + p.getUser().getState();
                }

                String cycleStatus = "Unknown";
                if (p.getStatus() == Payment.Status.APPROVED) cycleStatus = "On Going";
                else if (p.getStatus() == Payment.Status.CLAIMED) cycleStatus = "Claimed";
                else if (p.getStatus() == Payment.Status.REJECTED || p.getStatus() == Payment.Status.FAILED) cycleStatus = "Completed";
                else if (p.getStatus() == Payment.Status.PENDING) cycleStatus = "Pending Approval";

                String upiId = p.getUpiId() != null && !p.getUpiId().isBlank() ? p.getUpiId() : "—";
                String method = p.getMethod() != null ? p.getMethod().name() : "—";

                // CREDIT: every approved/active premium payment
                if (p.getStatus() == Payment.Status.APPROVED || p.getStatus() == Payment.Status.CLAIMED
                        || p.getStatus() == Payment.Status.SUCCESS || p.getStatus() == Payment.Status.PENDING) {
                    Map<String, Object> credit = new LinkedHashMap<>();
                    credit.put("id", "pay-" + p.getId());
                    credit.put("type", "CREDIT");
                    credit.put("description", "Premium collected – " + planName);
                    credit.put("amount", p.getAmount());
                    credit.put("coverageAmount", coverageAmount);
                    credit.put("userEmail", p.getUser() != null ? p.getUser().getEmail() : "—");
                    credit.put("userName", p.getUser() != null ? p.getUser().getName() : "—");
                    credit.put("location", location);
                    credit.put("date", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
                    credit.put("status", "CREDIT");
                    credit.put("upiId", upiId);
                    credit.put("method", method);
                    credit.put("gatewayReference", p.getGatewayReference());
                    credit.put("cycleStatus", cycleStatus);
                    transactions.add(credit);
                }

                // DEBIT: regular (non-AI) claim payout
                if (p.getStatus() == Payment.Status.CLAIMED || p.isClaimed()) {
                    Map<String, Object> debit = new LinkedHashMap<>();
                    debit.put("id", "claim-pay-" + p.getId());
                    debit.put("type", "DEBIT");
                    debit.put("description", "Coverage payout – " + planName);
                    debit.put("amount", coverageAmount);
                    debit.put("premiumAmount", p.getAmount());
                    debit.put("coverageAmount", coverageAmount);
                    debit.put("userEmail", p.getUser() != null ? p.getUser().getEmail() : "—");
                    debit.put("userName", p.getUser() != null ? p.getUser().getName() : "—");
                    debit.put("location", location);
                    debit.put("date", p.getClaimedAt() != null ? p.getClaimedAt().toString() : p.getCreatedAt().toString());
                    debit.put("status", "DEBIT");
                    debit.put("upiId", upiId);
                    debit.put("method", method);
                    debit.put("cycleStatus", "Claimed");
                    transactions.add(debit);
                }
            }

            // ── 2. Add DEBIT entries for each CLAIMED disaster (ClaimRequest) ──
            List<com.example.aiinsurance.model.ClaimRequest> allDisasterClaims = claimRequestRepository.findAll();
            for (com.example.aiinsurance.model.ClaimRequest cr : allDisasterClaims) {
                if (cr.isClaimed()) {
                    String planName = cr.getSubscription() != null && cr.getSubscription().getPlan() != null 
                                      ? cr.getSubscription().getPlan().getName() + " Plan" : "Insurance Plan";
                    String location = "—";
                    if (cr.getUser() != null && cr.getUser().getState() != null) {
                        location = (cr.getUser().getDistrict() != null ? cr.getUser().getDistrict() + ", " : "") + cr.getUser().getState();
                    }
                    boolean isFreeTrial = false;
                    if (cr.getSubscription() != null) {
                        isFreeTrial = allPayments.stream()
                                .anyMatch(p -> p.getSubscription() != null 
                                            && p.getSubscription().getId().equals(cr.getSubscription().getId()) 
                                            && p.getMethod() == Payment.Method.FREE_TRIAL);
                    }
                    
                    double finalAmtToDeduct = cr.getAmount();
                    if (isFreeTrial) finalAmtToDeduct = 0.0;

                    Map<String, Object> debit = new LinkedHashMap<>();
                    debit.put("id", "disaster-" + cr.getId());
                    debit.put("type", "DEBIT");
                    debit.put("description", "Disaster payout – " + planName + " (" + cr.getSituation() + ")");
                    debit.put("amount", finalAmtToDeduct);
                    debit.put("premiumAmount", 0.0); // Not a premium refund
                    debit.put("coverageAmount", cr.getAmount());
                    debit.put("userEmail", cr.getUser() != null ? cr.getUser().getEmail() : "—");
                    debit.put("userName", cr.getUser() != null ? cr.getUser().getName() : "—");
                    debit.put("location", location);
                    debit.put("date", cr.getCreatedAt() != null ? cr.getCreatedAt().toString() : null);
                    debit.put("status", "DEBIT");
                    debit.put("upiId", "—"); // Disaster claims are wallet-to-wallet
                    debit.put("method", "WALLET");
                    debit.put("cycleStatus", "Claimed");
                    transactions.add(debit);
                }
            }


            // Sort by date ascending to calculate running balance
            transactions.sort((a, b) -> {
                String da = (String) a.get("date");
                String db = (String) b.get("date");
                if (da == null) return -1;
                if (db == null) return 1;
                return da.compareTo(db);
            });

            double runningPool = 0.0;
            for (Map<String, Object> t : transactions) {
                Object amtObj = t.get("amount");
                double amt = 0.0;
                if (amtObj instanceof Number) {
                    amt = ((Number) amtObj).doubleValue();
                }
                
                if ("CREDIT".equals(t.get("type"))) {
                    runningPool += amt;
                } else {
                    runningPool -= amt;
                }
                t.put("runningBalance", runningPool);
            }

            // Now sort by date descending for the UI view
            transactions.sort((a, b) -> {
                String da = (String) a.get("date");
                String db = (String) b.get("date");
                if (da == null) return 1;
                if (db == null) return -1;
                return db.compareTo(da);
            });

            // ── 3. Force accurate totals from fresh records ──
            double totalPremiums = 0.0;
            double oldPremiums = 0.0;
            double newPremiums = 0.0;
            double totalRegularClaims = 0.0;
            double totalDisasterClaims = 0.0;

            java.time.LocalDateTime oneWeekAgo = java.time.LocalDateTime.now().minusDays(7);

            for (Payment p : allPayments) {
                double amt = (p.getAmount() != null ? p.getAmount() : 0.0);
                // Sum Premiums (Approved/Success/Claimed)
                if (p.getStatus() == Payment.Status.APPROVED || 
                    p.getStatus() == Payment.Status.CLAIMED || 
                    p.getStatus() == Payment.Status.SUCCESS) {
                    
                    totalPremiums += amt;
                    
                    if (p.getCreatedAt() != null && p.getCreatedAt().isBefore(oneWeekAgo)) {
                        oldPremiums += amt;
                    } else {
                        newPremiums += amt;
                    }
                }

                // Sum Claims Paid (Regular)
                if (p.isClaimed() || p.getStatus() == Payment.Status.CLAIMED) {
                    double covAmt = 0.0;
                    if (p.getSubscription() != null && p.getSubscription().getPlan() != null) {
                        covAmt = p.getSubscription().getPlan().getCoverageAmount();
                    } else {
                        covAmt = amt; // fallback
                    }
                    totalRegularClaims += covAmt;
                }
            }

            for (com.example.aiinsurance.model.ClaimRequest cr : allDisasterClaims) {
                // Sum Claims Paid (Disaster) - Approved status counts as a payout engagement
                if (cr.isClaimed() || (cr.getStatus() != null && cr.getStatus().name().equals("APPROVED"))) {
                    boolean isFreeTrial = false;
                    if (cr.getSubscription() != null) {
                        isFreeTrial = allPayments.stream()
                                .anyMatch(p -> p.getSubscription() != null 
                                            && p.getSubscription().getId().equals(cr.getSubscription().getId()) 
                                            && p.getMethod() == Payment.Method.FREE_TRIAL);
                    }
                    if (!isFreeTrial) {
                        totalDisasterClaims += (cr.getAmount() != null ? cr.getAmount() : 0.0);
                    }
                }
            }

            double computedBalance = totalPremiums - totalRegularClaims - totalDisasterClaims;
            // The wallet balance is the cumulative total (Old Amount + New Amount - Claims)
            double finalWalletBalance = computedBalance; // Allow looking at the actual net balance even if it's low

            // Synchronize the Admin DB record with the calculated balance to ensure persistence
            try {
                Admin adminRecord = getAdminWallet();
                adminRecord.setWalletBalance(finalWalletBalance);
                adminRepository.save(adminRecord);
            } catch (Exception e) {
                System.err.println("Warning: Syncing admin wallet balance failed: " + e.getMessage());
            }

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("walletBalance", finalWalletBalance);
            resp.put("totalPremiumCollected", totalPremiums);
            resp.put("oldPremiumCollected", oldPremiums);
            resp.put("newPremiumCollected", newPremiums);
            resp.put("totalClaimsPaid", totalRegularClaims + totalDisasterClaims);
            resp.put("totalRegularClaims", totalRegularClaims);
            resp.put("totalDisasterClaims", totalDisasterClaims);
            resp.put("computedBalance", computedBalance);
            resp.put("transactions", transactions);
            resp.put("totalCredits", totalPremiums);
            resp.put("totalDebits", totalRegularClaims + totalDisasterClaims);

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not fetch wallet: " + e.getMessage()));
        }
    }
}
