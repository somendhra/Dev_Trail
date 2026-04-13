package com.example.aiinsurance.service;

import com.example.aiinsurance.model.*;
import com.example.aiinsurance.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ClaimService {

    @Autowired private ClaimRequestRepository claimRequestRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private UserService userService;
    @Autowired private AIService aiService;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private EmailService emailService;

    public String evaluateTriggers(ClaimRequest req, User user) {
        try {
            String json = req.getSubscription().getPlan().getParametricTriggers();
            System.out.println("[ClaimService] Evaluating triggers for situation='" + req.getSituation() + "', triggers=" + json);

            if (json == null || json.isBlank() || "[]".equals(json.trim())) {
                System.out.println("[ClaimService] No triggers defined → PENDING");
                return "PENDING";
            }

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> triggers = mapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});

            // Case-insensitive situation matching
            List<Map<String, Object>> matchingTriggers = triggers.stream()
                .filter(t -> {
                    String sit = (String) t.get("situation");
                    if (sit == null) return false;
                    return req.getSituation().equalsIgnoreCase(sit)
                        || req.getSituation().toUpperCase().contains(sit.toUpperCase())
                        || sit.toUpperCase().contains(req.getSituation().toUpperCase());
                })
                .toList();

            System.out.println("[ClaimService] Matching triggers: " + matchingTriggers.size());
            if (matchingTriggers.isEmpty()) {
                System.out.println("[ClaimService] No matching triggers for situation → PENDING");
                return "PENDING";
            }

            Map<String, Object> weather = aiService.getWeather(
                user.getState()    != null ? user.getState()    : "Maharashtra",
                user.getDistrict() != null ? user.getDistrict() : user.getState()
            );
            System.out.println("[ClaimService] Weather data: " + weather);

            if (weather.containsKey("error")) {
                System.out.println("[ClaimService] Weather API error → PENDING");
                return "PENDING";
            }

            boolean anyMatch = false;
            for (Map<String, Object> t : matchingTriggers) {
                String factor   = (String) t.get("factor");
                String operator = (String) t.get("operator");
                double threshold = Double.parseDouble(t.get("threshold").toString());

                // Resolve actual weather value — handle different key names from API
                Double actualValue = null;
                if ("temperature".equalsIgnoreCase(factor)) {
                    // Try both 'temp' and 'temperature' keys
                    Object v = weather.getOrDefault("temp", weather.get("temperature"));
                    if (v != null) actualValue = Double.valueOf(v.toString());
                } else if ("wind_speed".equalsIgnoreCase(factor)) {
                    Object v = weather.getOrDefault("wind_speed", weather.get("windspeed"));
                    if (v != null) actualValue = Double.valueOf(v.toString());
                } else if ("rainfall".equalsIgnoreCase(factor)) {
                    Object v = weather.getOrDefault("rainfall", weather.getOrDefault("rain", weather.get("precipitation")));
                    if (v != null) actualValue = Double.valueOf(v.toString());
                } else if ("humidity".equalsIgnoreCase(factor)) {
                    Object v = weather.get("humidity");
                    if (v != null) actualValue = Double.valueOf(v.toString());
                }

                System.out.println("[ClaimService] Trigger check: factor=" + factor
                    + " actual=" + actualValue + " " + operator + " threshold=" + threshold);

                if (actualValue != null) {
                    boolean matched = false;
                    if (">".equals(operator)  && actualValue > threshold)  matched = true;
                    else if ("<".equals(operator)  && actualValue < threshold)  matched = true;
                    else if ("==".equals(operator) && actualValue.equals(threshold)) matched = true;
                    else if (">=".equals(operator) && actualValue >= threshold) matched = true;
                    else if ("<=".equals(operator) && actualValue <= threshold) matched = true;
                    if (matched) {
                        System.out.println("[ClaimService] ✅ Trigger MATCHED → APPROVE");
                        anyMatch = true;
                    }
                }
            }

            String result = anyMatch ? "APPROVE" : "REJECT";
            System.out.println("[ClaimService] Final result: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("[ClaimService] Trigger evaluation failed: " + e.getMessage());
            e.printStackTrace();
            return "PENDING";
        }
    }

    public void approveRequestInternal(ClaimRequest req) {
        if (req.getStatus() == ClaimRequest.Status.APPROVED) return;
        
        User user = req.getUser();
        User managedUser = userService.findById(user.getId()).orElse(user);
        managedUser.setWalletBalance(managedUser.getWalletBalance() + req.getAmount());
        userService.updateUser(managedUser);

        boolean isFreeTrial = false;
        Subscription sub = req.getSubscription();
        if (sub != null) {
            isFreeTrial = paymentRepository.findAll().stream()
                    .anyMatch(p -> p.getSubscription() != null 
                                && p.getSubscription().getId().equals(sub.getId()) 
                                && p.getMethod() == Payment.Method.FREE_TRIAL);
        }

        if (!isFreeTrial) {
            try {
                List<Admin> admins = adminRepository.findAll();
                if (!admins.isEmpty()) {
                    Admin admin = admins.get(0);
                    admin.setWalletBalance(Math.max(0.0, admin.getWalletBalance() - req.getAmount()));
                    adminRepository.save(admin);
                }
            } catch (Exception ignored) {}
        }

        req.setStatus(ClaimRequest.Status.APPROVED);
        req.setClaimed(true);
        claimRequestRepository.save(req);

        if (originalSub != null) {
            originalSub.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepository.save(originalSub);
        }

        Notification n = new Notification();
        n.setUser(managedUser);
        if (isFreeTrial) {
            n.setTitle("Simulation: Claim Approved! 🌩️");
            n.setMessage("Your area was affected! Had you been on a paid plan, you would have received ₹" + req.getAmount() + " today. Upgrade now to get real payouts for future disasters!");
            n.setType("INFO");

            if (managedUser.getEmail() != null && !managedUser.getEmail().isEmpty()) {
                String emailBody = "Hello " + managedUser.getName() + ",\n\n" +
                        "Our AI Risk Monitoring system successfully tracked a disaster (" + req.getSituation() + ") in your location and processed a claim.\n\n" +
                        "Because you are currently relying on a Free Trial policy, no real funds were transferred to your wallet. However, had you subscribed to a paid premium plan, you would have instantly received a guaranteed payout of ₹" + req.getAmount() + " automatically deposited directly into your account.\n\n" +
                        "Upgrade your parametric coverage today so that next time a disaster disrupts your work, you get the full payout without any paperwork.\n\n" +
                        "Stay safe,\nTeam WageWings";
                
                emailService.sendEmail(managedUser.getEmail(), "Simulated Payout: " + req.getSituation() + " Claim", emailBody);
            }
        } else {
            n.setTitle("Insurance Claim Approved! 🌩️");
            n.setMessage("Your claim for " + req.getSituation() + " was approved and ₹" + req.getAmount() + " was added to your wallet automatically.");
            n.setType("SUCCESS");

            if (managedUser.getEmail() != null && !managedUser.getEmail().isEmpty()) {
                String emailBody = "Hello " + managedUser.getName() + ",\n\n" +
                        "Great news! Our AI Risk Monitoring system successfully tracked an active situation (" + req.getSituation() + ") in your location.\n\n" +
                        "Because you are fully covered by a Premium WageWings plan, a payout of ₹" + req.getAmount() + " has been successfully processed and deposited directly into your wallet automatically. No forms to fill out, no delays.\n\n" +
                        "Thank you for being a valued member.\n\n" +
                        "Stay safe,\nTeam WageWings";
                
                emailService.sendEmail(managedUser.getEmail(), "Payout Approved: ₹" + req.getAmount() + " for " + req.getSituation(), emailBody);
            }
        }
        notificationRepository.save(n);
    }

    public void rejectRequestInternal(ClaimRequest req, String reason) {
        req.setStatus(ClaimRequest.Status.REJECTED);
        claimRequestRepository.save(req);
        Notification n = new Notification();
        n.setUser(req.getUser());
        n.setTitle("Claim Rejected");
        n.setMessage(reason);
        n.setType("DANGER");
        notificationRepository.save(n);
    }
}
