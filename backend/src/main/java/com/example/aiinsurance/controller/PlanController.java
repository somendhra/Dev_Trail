package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "http://localhost:*")
public class PlanController {

    @Autowired
    private PlanService planService;

    /**
     * GET /api/plans
     * Returns all available insurance plans.
     * Public endpoint – no auth needed so the Plans page can show
     * prices before the user is logged in.
     */
    @GetMapping
    public ResponseEntity<?> getPlans() {
        try {
            List<Plan> plans = planService.getAllPlans();
            List<Map<String, Object>> result = new ArrayList<>();
            for (Plan p : plans) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id",            p.getId());
                map.put("name",          p.getName());
                map.put("weeklyPremium", p.getWeeklyPremium());
                map.put("coverageAmount",p.getCoverageAmount());
                map.put("riskLevel",     p.getRiskLevel());
                map.put("features",      Arrays.asList(p.getFeatures().split("\\|")));
                map.put("trialDays",     p.getTrialDays());
                result.add(map);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/plans/{id}
     * Single plan details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlan(@PathVariable Long id) {
        try {
            Plan p = planService.getPlanById(id);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",            p.getId());
            map.put("name",          p.getName());
            map.put("weeklyPremium", p.getWeeklyPremium());
            map.put("coverageAmount",p.getCoverageAmount());
            map.put("riskLevel",     p.getRiskLevel());
            map.put("features",      Arrays.asList(p.getFeatures().split("\\|")));
            map.put("trialDays",     p.getTrialDays());
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
