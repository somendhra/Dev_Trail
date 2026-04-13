package com.example.aiinsurance.service;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.*;
import com.example.aiinsurance.service.TriggerService.BreachResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AutoClaimService — runs every hour via @Scheduled.
 *
 * Cycle per active subscription:
 *  1. Auto-expire plans > 7 days old.
 *  2. Skip workers who already have a claim this week.
 *  3. Skip workers with no location set.
 *  4. Call TriggerService.checkPrimaryTrigger(district, state).
 *  5. If a threshold is breached → auto-create ClaimRequest.
 *  6. Call Python AI /fraud-check endpoint via AIService.
 *  7. If fraud score < 60 → auto-approve and credit wallet.
 *     If fraud score >= 60 → keep PENDING for admin review.
 *
 * Separate 30-minute task re-evaluates all PENDING claims.
 */
@Service
public class AutoClaimService {

    private static final Logger log = LoggerFactory.getLogger(AutoClaimService.class);

    @Autowired private TriggerService         triggerService;
    @Autowired private AIService              aiService;
    @Autowired private ClaimService           claimService;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository notificationRepository;

    // ── Hourly disaster monitor ───────────────────────────────────────────────────

    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void monitorAndFileClaims() {
        log.info("[AutoClaimService] Running disaster monitoring at {}", LocalDateTime.now());

        List<Subscription> activeSubs = subscriptionRepository.findByStatus(Subscription.Status.ACTIVE);
        log.info("[AutoClaimService] Found {} active subscriptions.", activeSubs.size());

        for (Subscription sub : activeSubs) {
            User user = sub.getUser();
            try {
                processSubscription(sub, user);
            } catch (Exception e) {
                log.error("[AutoClaimService] Error processing subscription {} for {}: {}",
                        sub.getId(), user.getEmail(), e.getMessage());
            }
        }

        log.info("[AutoClaimService] Monitoring cycle complete.");
    }

    private void processSubscription(Subscription sub, User user) {
        // 1. Auto-expire plans > 7 days
        if (sub.getStartDate() != null && sub.getStartDate().plusDays(7).isBefore(LocalDateTime.now())) {
            sub.setStatus(Subscription.Status.EXPIRED);
            sub.setEndDate(LocalDateTime.now());
            subscriptionRepository.save(sub);
            sendNotification(user,
                    "📅 Your " + sub.getPlan().getName() + " Plan Expired",
                    "Your weekly " + sub.getPlan().getName() + " plan has expired. " +
                    "Premium of ₹" + sub.getPlan().getWeeklyPremium() + " remains in the insurance fund. " +
                    "Purchase a new plan to stay protected.", "INFO");
            return;
        }

        // 2. Skip if already has a claim this week
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        boolean alreadyClaimed = claimRequestRepository.findByUser(user).stream()
                .anyMatch(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(oneWeekAgo));
        if (alreadyClaimed) {
            log.debug("[AutoClaimService] {} already has a claim this week — skip.", user.getEmail());
            return;
        }

        // 3. Skip users with no location
        if (user.getState() == null || user.getState().isBlank()) {
            log.debug("[AutoClaimService] {} has no location set — skip.", user.getEmail());
            return;
        }

        String district = user.getDistrict() != null && !user.getDistrict().isBlank()
                        ? user.getDistrict() : user.getState();
        String state    = user.getState();

        // 4. Run parametric trigger engine (TriggerService → WeatherService)
        BreachResult breach = triggerService.checkPrimaryTrigger(district, state);
        if (breach == null) {
            log.debug("[AutoClaimService] No breach for {} in {}/{}", user.getEmail(), district, state);
            return;
        }

        log.info("[AutoClaimService] ⚠️ Breach detected for {} — {}", user.getEmail(), breach.description());

        // 5. Auto-file a ClaimRequest
        ClaimRequest req = new ClaimRequest();
        req.setUser(user);
        req.setSubscription(sub);
        req.setSituation("AI-AUTO: " + breach.situation());
        req.setDescription(
                "🤖 AI Auto-Filed Claim — Parametric trigger breached.\n" +
                "Location: " + (user.getMandal() != null ? user.getMandal() + ", " : "") +
                district + ", " + state + "\n" +
                "Event: " + breach.description() + "\n" +
                "Plan: " + sub.getPlan().getName() + " (₹" + sub.getPlan().getWeeklyPremium() + "/week)\n" +
                "Coverage: ₹" + sub.getPlan().getCoverageAmount() + "\n" +
                "[PARAMETRIC ENGINE]: Threshold exceeded — auto-claim initiated."
        );
        req.setAmount(sub.getPlan().getCoverageAmount());
        req.setStatus(ClaimRequest.Status.PENDING);
        req.setCreatedAt(LocalDateTime.now());
        claimRequestRepository.save(req);

        // 6. AI fraud check → decide auto-approve vs PENDING
        int fraudScore = runFraudCheck(req, user, breach, district);
        log.info("[AutoClaimService] Fraud score for claim {}: {}", req.getId(), fraudScore);

        if (fraudScore < 60) {
            // Auto-approve
            claimService.approveRequestInternal(req);
            log.info("[AutoClaimService] ✅ Claim {} AUTO-APPROVED (fraud score {})", req.getId(), fraudScore);
        } else {
            // Keep PENDING — notify user + log
            sendNotification(user,
                    "⚠️ Disaster Detected — Claim Under Review",
                    "A " + breach.situation() + " was detected in your area (" + district + ", " + state + "). " +
                    "A claim of ₹" + req.getAmount() + " has been filed. " +
                    "AI fraud score: " + fraudScore + " — pending admin review.",
                    "WARNING");
            log.warn("[AutoClaimService] ⏳ Claim {} kept PENDING — fraud score {}", req.getId(), fraudScore);
        }
    }

    /**
     * Calls the Python AI /fraud-check endpoint.
     * Returns score 0–100; defaults to 30 (approve) if AI is unreachable.
     */
    private int runFraudCheck(ClaimRequest req, User user, BreachResult breach, String district) {
        try {
            // Count recent claims for duplicate-flood detection
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            int claimsLast30d = (int) claimRequestRepository.findByUser(user).stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(thirtyDaysAgo))
                    .count();

            Map<String, Object> result = aiService.detectFraud(
                    user.getId(),
                    breach.situation(),
                    district,
                    user.getState() != null ? user.getState() : district, // registered state
                    true,  // has active subscription (already confirmed above)
                    7,     // days since last claim (we checked at the threshold)
                    breach.actualValue() / Math.max(1, breach.trigger().getThreshold()), // weather risk index ratio
                    req.getAmount(),
                    req.getAmount(),
                    0,     // account age — not tracked yet
                    claimsLast30d
            );

            // Parse fraudScore from the nested response shape
            Object fraudAnal = result.get("fraud_analysis");
            if (fraudAnal instanceof Map<?,?> fa) {
                Object score = fa.get("fraud_score");
                if (score != null) {
                    return (int)(Double.parseDouble(score.toString()) * 100);
                }
            }
            // Flat response fallback
            Object score = result.get("fraud_score");
            if (score != null) return (int)(Double.parseDouble(score.toString()) * 100);

            // Direct 0-100 score
            Object pctScore = result.get("score");
            if (pctScore != null) return Integer.parseInt(pctScore.toString());

        } catch (Exception e) {
            log.warn("[AutoClaimService] AI fraud check failed: {} — defaulting to score 30 (auto-approve)", e.getMessage());
        }
        return 30; // safe default → auto-approve
    }

    // ── 30-minute pending claim re-evaluation ─────────────────────────────────────

    @Scheduled(fixedRate = 1_800_000)
    @Transactional
    public void processPendingClaims() {
        log.debug("[AutoClaimService] Running periodic pending claim verification...");
        List<ClaimRequest> pending = claimRequestRepository.findByStatus(ClaimRequest.Status.PENDING);

        for (ClaimRequest req : pending) {
            try {
                User user = req.getUser();
                String result = claimService.evaluateTriggers(req, user);
                if ("APPROVE".equals(result)) {
                    claimService.approveRequestInternal(req);
                    log.info("[AutoClaimService] Periodic: ✅ Auto-approved claim {} for {}", req.getId(), user.getEmail());
                } else if ("REJECT".equals(result)) {
                    claimService.rejectRequestInternal(req, "AI automated verification: weather thresholds not met.");
                    log.info("[AutoClaimService] Periodic: ❌ Auto-rejected claim {} for {}", req.getId(), user.getEmail());
                }
            } catch (Exception e) {
                log.error("[AutoClaimService] Error verifying claim {}: {}", req.getId(), e.getMessage());
            }
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────────

    private void sendNotification(User user, String title, String message, String type) {
        try {
            Notification n = new Notification();
            n.setUser(user);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            notificationRepository.save(n);
        } catch (Exception e) {
            log.error("[AutoClaimService] Failed to save notification: {}", e.getMessage());
        }
    }
}
