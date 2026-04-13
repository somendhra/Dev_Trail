package com.example.aiinsurance.model;

import jakarta.persistence.*;

/**
 * A parametric trigger rule.
 * When WeatherService detects that a weather factor breaches a threshold
 * the AutoClaimService auto-files a ClaimRequest for every affected worker.
 *
 * Example: situation=HEAVY_RAIN, factor=rainfall, operator=>=, threshold=50, unit=mm
 */
@Entity
@Table(name = "triggers")
public class Trigger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable event name, e.g. "HEAVY_RAIN", "EXTREME_HEAT", "HIGH_WINDS" */
    @Column(nullable = false, length = 100)
    private String situation;

    /** Weather attribute to evaluate: rainfall | temperature | wind_speed | aqi | humidity */
    @Column(nullable = false, length = 50)
    private String factor;

    /** Numeric threshold value */
    @Column(nullable = false)
    private double threshold;

    /** Comparison operator: >, >=, <, <=, == */
    @Column(nullable = false, length = 5)
    private String operator;

    /** Unit label for display only — e.g. mm, °C, km/h, AQI */
    @Column(length = 20)
    private String unit;

    /** Coverage type this trigger activates — matches Plan.coverageType or "INCOME_LOSS" */
    @Column(length = 50)
    private String coverageType;

    /** Hours before the same rule can fire again for the same user */
    @Column
    private int cooldownHours;

    /** If false, this rule is skipped during evaluation */
    @Column(nullable = false)
    private boolean isActive = true;

    // ── Constructors ─────────────────────────────────────────────────────────────

    public Trigger() {}

    public Trigger(String situation, String factor, double threshold,
                   String operator, String unit, String coverageType,
                   int cooldownHours) {
        this.situation    = situation;
        this.factor       = factor;
        this.threshold    = threshold;
        this.operator     = operator;
        this.unit         = unit;
        this.coverageType = coverageType;
        this.cooldownHours = cooldownHours;
        this.isActive     = true;
    }

    // ── Getters / Setters ────────────────────────────────────────────────────────

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public String getSituation()               { return situation; }
    public void setSituation(String s)         { this.situation = s; }

    public String getFactor()                  { return factor; }
    public void setFactor(String f)            { this.factor = f; }

    public double getThreshold()               { return threshold; }
    public void setThreshold(double t)         { this.threshold = t; }

    public String getOperator()                { return operator; }
    public void setOperator(String o)          { this.operator = o; }

    public String getUnit()                    { return unit; }
    public void setUnit(String u)              { this.unit = u; }

    public String getCoverageType()            { return coverageType; }
    public void setCoverageType(String c)      { this.coverageType = c; }

    public int getCooldownHours()              { return cooldownHours; }
    public void setCooldownHours(int h)        { this.cooldownHours = h; }

    public boolean isActive()                  { return isActive; }
    public void setActive(boolean a)           { this.isActive = a; }
}
