package com.example.aiinsurance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

/**
 * Service that communicates with the Python AI microservice (FastAPI on port 8000).
 * All methods return raw Maps so no tight coupling to AI response shape.
 */
@Service
public class AIService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Calculate dynamic premium for a user profile.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculatePremium(String platform, String state,
                                                String district, String planName,
                                                int monthsActive, int priorClaims) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("platform",      platform);
            body.put("state",         state != null ? state : "Maharashtra");
            body.put("district",      district != null ? district : "");
            body.put("plan_name",     planName != null ? planName : "Smart");
            body.put("months_active", monthsActive);
            body.put("prior_claims",  priorClaims);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/premium", HttpMethod.POST, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Full risk assessment for a user.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> assessRisk(Long userId, String platform, String state,
                                          String district, int monthsActive, int priorClaims) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("user_id",       userId != null ? userId.intValue() : 0);
            body.put("platform",      platform);
            body.put("state",         state != null ? state : "Maharashtra");
            body.put("district",      district != null ? district : "");
            body.put("months_active", monthsActive);
            body.put("prior_claims",  priorClaims);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/risk", HttpMethod.POST, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Fraud detection for a claim submission.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> detectFraud(Long userId, String situation,
                                           String claimedState, String registeredState,
                                           boolean hasActiveSub, int daysSinceLastClaim,
                                           double weatherRiskIndex, double claimAmount,
                                           double coverageAmount, int accountAgeDays,
                                           int claimsLast30d) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("user_id",                 userId != null ? userId.intValue() : 0);
            body.put("situation",               situation != null ? situation : "UNKNOWN");
            body.put("claimed_state",           claimedState != null ? claimedState : "");
            body.put("registered_state",        registeredState != null ? registeredState : "");
            body.put("has_active_subscription", hasActiveSub);
            body.put("days_since_last_claim",   daysSinceLastClaim);
            body.put("weather_risk_index",      weatherRiskIndex);
            body.put("claim_amount",            claimAmount);
            body.put("coverage_amount",         coverageAmount);
            body.put("account_age_days",        accountAgeDays);
            body.put("claims_last_30d",         claimsLast30d);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/fraud/detect", HttpMethod.POST, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            // Default to manual review if AI is down
            err.put("recommendation", "MANUAL_REVIEW");
            return err;
        }
    }

    /**
     * Check parametric weather triggers for a user location.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> checkParametric(Long userId, String state, String district,
                                               String planName, double coverage, List<Map<String, Object>> triggers) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("user_id",   userId != null ? userId.intValue() : 0);
            body.put("state",     state != null ? state : "Maharashtra");
            body.put("district",  district != null ? district : state);
            body.put("plan_name", planName != null ? planName : "Smart");
            body.put("coverage",  coverage);
            body.put("triggers",  triggers); // Dynamic triggers from admin

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/parametric/check", HttpMethod.POST, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Get weather data for a location.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeather(String state, String district) {
        try {
            String url = aiBaseUrl + "/ai/weather?state=" + 
                java.net.URLEncoder.encode(state, "UTF-8") + 
                "&district=" + java.net.URLEncoder.encode(district != null ? district : state, "UTF-8");
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Get comprehensive AI dashboard data.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getDashboard(String platform, String state,
                                            int monthsActive, int priorClaims) {
        try {
            String url = aiBaseUrl + "/ai/dashboard" +
                "?platform=" + java.net.URLEncoder.encode(platform != null ? platform : "Zomato", "UTF-8") +
                "&state="    + java.net.URLEncoder.encode(state != null ? state : "Maharashtra", "UTF-8") +
                "&months_active=" + monthsActive +
                "&prior_claims="  + priorClaims;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Get plan recommendation for a user.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> recommendPlan(String platform, String state,
                                             int monthsActive, int priorClaims) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("platform",      platform);
            body.put("state",         state != null ? state : "Maharashtra");
            body.put("plan_name",     "Smart");
            body.put("months_active", monthsActive);
            body.put("prior_claims",  priorClaims);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/plans/recommend", HttpMethod.POST, request, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Get fraud statistics.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFraudStats() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/fraud/stats", HttpMethod.GET, null, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }

    /**
     * Get all parametric triggers across India.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getAllTriggers() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                aiBaseUrl + "/ai/parametric/triggers", HttpMethod.GET, null, (Class<Map<String, Object>>)(Class<?>)Map.class);
            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "AI service unavailable: " + e.getMessage());
            return err;
        }
    }
}
