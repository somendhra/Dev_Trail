package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class PlanService {

    @Autowired
    private PlanRepository planRepository;

    /**
     * Seed the three default plans when the app starts if they don't exist yet.
     */
    @PostConstruct
    public void seedPlans() {
        // Ensure the 4 specific plans exist: Starter, Smart, Pro, Max
        // First, rename legacy plans if they exist
        List<Plan> allPlans = planRepository.findAll();
        for (Plan p : allPlans) {
            if ("Basic".equalsIgnoreCase(p.getName())) p.setName("Starter");
            else if ("Standard".equalsIgnoreCase(p.getName())) p.setName("Smart");
            else if ("Premium".equalsIgnoreCase(p.getName())) p.setName("Pro");
            planRepository.save(p);
        }

        // Now ensure all 4 exist
        ensurePlanExists("Starter", 20.0, 3000.0, "Low", "Accident Cover|Hospital Cash ₹500/day|24×7 Helpline|Free trial 7 days", "[]");
        ensurePlanExists("Smart",   40.0, 6000.0, "Moderate", "Accident Cover|Hospital Cash ₹1000/day|Weather Payout|Income Protection|24×7 Helpline|Free trial 7 days", 
            "[{\"situation\":\"Summer\",\"factor\":\"temperature\",\"threshold\":35,\"operator\":\">\"},{\"situation\":\"Rainy\",\"factor\":\"rainfall\",\"threshold\":100,\"operator\":\">\"}]");
        ensurePlanExists("Pro",     60.0, 12000.0, "High", "Accident Cover|Hospital Cash ₹2000/day|Weather Payout|Income Protection|Life Cover ₹5L|Priority Claims|Dedicated Manager|Free trial 7 days", 
            "[{\"situation\":\"Summer\",\"factor\":\"temperature\",\"threshold\":35,\"operator\":\">\"},{\"situation\":\"Cyclone\",\"factor\":\"wind_speed\",\"threshold\":80,\"operator\":\">\"}]");
        ensurePlanExists("Max",     100.0, 25000.0, "High", "Accident Cover|Hospital Cash ₹3000/day|Weather Payout|Global Protection|Life Cover ₹10L|Priority Claims|Family Cover|Free trial 7 days", 
            "[{\"situation\":\"Summer\",\"factor\":\"temperature\",\"threshold\":35,\"operator\":\">\"},{\"situation\":\"Rainy\",\"factor\":\"rainfall\",\"threshold\":80,\"operator\":\">\"}]");
    }

    private void ensurePlanExists(String name, double premium, double coverage, String risk, String features, String triggers) {
        Optional<Plan> existing = planRepository.findAll().stream()
            .filter(p -> p.getName().equalsIgnoreCase(name))
            .findFirst();
            
        if (existing.isPresent()) {
            Plan p = existing.get();
            p.setParametricTriggers(triggers);
            planRepository.save(p);
        } else {
            Plan p = new Plan(name, premium, coverage, risk, features, 7);
            p.setParametricTriggers(triggers);
            planRepository.save(p);
        }
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Plan not found: " + id));
    }

    public Plan savePlan(Plan plan) {
        return planRepository.save(plan);
    }
}
