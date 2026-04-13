package com.example.aiinsurance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Basic", "Standard", "Premium"

    @Column(nullable = false)
    private Double weeklyPremium;   // in INR

    @Column(nullable = false)
    private Double coverageAmount;  // max payout in INR

    @Column(nullable = false)
    private String riskLevel;       // "Low", "Moderate", "High"

    @Column(columnDefinition = "TEXT")
    private String features;        // pipe-separated feature list

    // For free-trial: trialDays = 7 means first 7 days are free
    @Column(nullable = false)
    private Integer trialDays;

    @Column(columnDefinition = "TEXT")
    private String parametricTriggers; // JSON string for auto-claim conditions

    public Plan() {}

    public Plan(String name, Double weeklyPremium, Double coverageAmount,
                String riskLevel, String features, Integer trialDays) {
        this.name = name;
        this.weeklyPremium = weeklyPremium;
        this.coverageAmount = coverageAmount;
        this.riskLevel = riskLevel;
        this.features = features;
        this.trialDays = trialDays;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getWeeklyPremium() { return weeklyPremium; }
    public void setWeeklyPremium(Double weeklyPremium) { this.weeklyPremium = weeklyPremium; }

    public Double getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(Double coverageAmount) { this.coverageAmount = coverageAmount; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public Integer getTrialDays() { return trialDays; }
    public void setTrialDays(Integer trialDays) { this.trialDays = trialDays; }

    public String getParametricTriggers() { return parametricTriggers; }
    public void setParametricTriggers(String parametricTriggers) { this.parametricTriggers = parametricTriggers; }
}
