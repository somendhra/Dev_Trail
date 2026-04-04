package com.example.aiinsurance.service;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class SubscriptionService {

    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private PaymentRepository       paymentRepository;
    @Autowired private PlanRepository          planRepository;
    @Autowired private ClaimRequestRepository   claimRequestRepository;
    @Autowired private AdminRepository          adminRepository;


    /**
     * Subscribe a user to a plan.
     *
     * If the plan has trialDays > 0 and this is a FREE_TRIAL purchase,
     * we create the subscription in TRIAL status and record a ₹0 payment.
     *
     * Otherwise we record the real payment and set status = ACTIVE.
     */
    public Map<String, Object> subscribe(
            User user,
            Long planId,
            String method,       // "UPI", "CARD", "WALLET", "FREE_TRIAL"
            String upiId,        // only for UPI
            String txnReference  // gateway reference from frontend (Razorpay/UPI)
    ) {
        // ─── Prevent duplicate active/pending subscriptions ───────────────────
        Optional<Subscription> latest = getLatestSubscription(user);
        if (latest.isPresent()) {
            Subscription.Status s = latest.get().getStatus();
            if (s == Subscription.Status.ACTIVE || s == Subscription.Status.TRIAL || s == Subscription.Status.PENDING) {
                throw new RuntimeException("You already have an active or pending insurance plan. Please wait until it expires or is processed.");
            }
        }

        Plan plan = planRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));

        boolean isTrial = "FREE_TRIAL".equalsIgnoreCase(method);

        // Build subscription
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStartDate(LocalDateTime.now());

        if (isTrial) {
            sub.setStatus(Subscription.Status.TRIAL);
            sub.setTrialEndDate(LocalDateTime.now().plusDays(plan.getTrialDays()));
            sub.setNextPaymentDate(LocalDateTime.now().plusDays(plan.getTrialDays()));
        } else {
            sub.setStatus(Subscription.Status.PENDING);
            sub.setNextPaymentDate(LocalDateTime.now().plusDays(7));
        }
        sub.setEndDate(LocalDateTime.now().plusDays(7));
        Subscription saved = subscriptionRepository.save(sub);

        // Record payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setSubscription(saved);
        payment.setAmount(isTrial ? 0.0 : plan.getWeeklyPremium());
        payment.setMethod(Payment.Method.valueOf(isTrial ? "FREE_TRIAL" : method.toUpperCase()));
        payment.setStatus(isTrial ? Payment.Status.SUCCESS : Payment.Status.PENDING);
        payment.setGatewayReference(txnReference);
        payment.setUpiId(upiId);
        paymentRepository.save(payment);

        // Wallet credit is now handled in AdminController.approvePayment upon approval

        // Build response
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("subscriptionId", saved.getId());
        resp.put("paymentId",      payment.getId());
        resp.put("plan",           plan.getName());
        resp.put("status",         saved.getStatus().name());
        resp.put("startDate",      saved.getStartDate().toString());
        resp.put("trialEndDate",   saved.getTrialEndDate() != null ? saved.getTrialEndDate().toString() : null);
        resp.put("nextPaymentDate",saved.getNextPaymentDate().toString());
        resp.put("amountPaid",     payment.getAmount());
        resp.put("method",         payment.getMethod().name());
        return resp;
    }

    /** Latest subscription for a user */
    public Optional<Subscription> getLatestSubscription(User user) {
        return subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user);
    }

    /** All subscriptions for a user */
    public List<Subscription> getAllSubscriptions(User user) {
        return subscriptionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /** All payments for a user */
    public List<Payment> getPaymentHistory(User user) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Dashboard summary for the authenticated user
     */
    public Map<String, Object> getDashboardSummary(User user) {
        Map<String, Object> summary = new LinkedHashMap<>();

        Optional<Subscription> latestSub = getLatestSubscription(user);
        if (latestSub.isPresent()) {
            Subscription s = latestSub.get();
            Plan p = s.getPlan();
            Map<String, Object> planMap = new LinkedHashMap<>();
            planMap.put("id",            p.getId());
            planMap.put("name",          p.getName());
            planMap.put("weeklyPremium", p.getWeeklyPremium());
            planMap.put("coverageAmount",p.getCoverageAmount());
            planMap.put("riskLevel",     p.getRiskLevel());
            planMap.put("features",      Arrays.asList(p.getFeatures().split("\\|")));
            summary.put("activePlan", planMap);
            summary.put("subscriptionStatus", s.getStatus().name());
            summary.put("trialEndDate",   s.getTrialEndDate() != null ? s.getTrialEndDate().toString() : null);
            summary.put("nextPaymentDate",s.getNextPaymentDate() != null ? s.getNextPaymentDate().toString() : null);
        } else {
            summary.put("activePlan", null);
            summary.put("subscriptionStatus", "NONE");
            summary.put("trialEndDate", null);
            summary.put("nextPaymentDate", null);
        }

        // Payment history (last 5)
        List<Payment> payments = getPaymentHistory(user);
        List<Map<String, Object>> payList = new ArrayList<>();
        int limit = Math.min(5, payments.size());
        for (int i = 0; i < limit; i++) {
            Payment pay = payments.get(i);
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("id",        pay.getId());
            pMap.put("plan",      pay.getSubscription().getPlan().getName());
            pMap.put("amount",    pay.getAmount());
            pMap.put("method",    pay.getMethod().name());
            pMap.put("status",    pay.getStatus().name());
            pMap.put("reference", pay.getGatewayReference());
            pMap.put("date",      pay.getCreatedAt().toString());
            payList.add(pMap);
        }
        summary.put("recentPayments", payList);
        summary.put("totalPayments",  payments.size());

        // Calculate total stats for reports
        double totalPayout = payments.stream()
            .filter(p -> p.getStatus() == Payment.Status.CLAIMED)
            .mapToDouble(p -> p.getSubscription() != null ? p.getSubscription().getPlan().getCoverageAmount() : p.getAmount())
            .sum();
        
        List<ClaimRequest> claimReqs = claimRequestRepository.findByUser(user);
        double totalClaimReqPayout = claimReqs.stream()
            .filter(ClaimRequest::isClaimed)
            .mapToDouble(ClaimRequest::getAmount)
            .sum();
            
        summary.put("totalPayout", totalPayout + totalClaimReqPayout);
        summary.put("totalClaims", (int) (payments.stream().filter(p -> p.getStatus() == Payment.Status.CLAIMED).count() + claimReqs.stream().filter(ClaimRequest::isClaimed).count()));

        // Add Total Insurance Fund (Admin Pool) for transparency
        List<Admin> admins = adminRepository.findAll();
        if (!admins.isEmpty()) {
            summary.put("totalInsuranceFund", admins.get(0).getWalletBalance());
        } else {
            summary.put("totalInsuranceFund", 0.0);
        }

        return summary;
    }
}
