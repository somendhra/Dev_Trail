package com.example.aiinsurance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    public enum Status { TRIAL, PENDING, ACTIVE, EXPIRED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column
    private LocalDateTime trialEndDate;

    @Column
    private LocalDateTime endDate;

    @Column
    private LocalDateTime nextPaymentDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ─── constructors ──────────────────────────────────────────────────────────
    public Subscription() {}

    // ─── getters / setters ────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getTrialEndDate() { return trialEndDate; }
    public void setTrialEndDate(LocalDateTime trialEndDate) { this.trialEndDate = trialEndDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public LocalDateTime getNextPaymentDate() { return nextPaymentDate; }
    public void setNextPaymentDate(LocalDateTime nextPaymentDate) { this.nextPaymentDate = nextPaymentDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
