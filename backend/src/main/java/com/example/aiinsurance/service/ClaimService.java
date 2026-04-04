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

        try {
            List<Admin> admins = adminRepository.findAll();
            if (!admins.isEmpty()) {
                Admin admin = admins.get(0);
                admin.setWalletBalance(Math.max(0.0, admin.getWalletBalance() - req.getAmount()));
                adminRepository.save(admin);
            }
        } catch (Exception ignored) {}

        req.setStatus(ClaimRequest.Status.APPROVED);
        req.setClaimed(true);
        claimRequestRepository.save(req);

        Subscription sub = req.getSubscription();
        if (sub != null) {
            sub.setStatus(Subscription.Status.EXPIRED);
            subscriptionRepository.save(sub);
        }

        Notification n = new Notification();
        n.setUser(managedUser);
        n.setTitle("Insurance Claim Approved! 🌩️");
        n.setMessage("Your claim for " + req.getSituation() + " was approved and ₹" + req.getAmount() + " was added to your wallet automatically.");
        n.setType("SUCCESS");
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
