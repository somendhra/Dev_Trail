package com.example.aiinsurance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queries")
public class Query {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @com.fasterxml.jackson.annotation.JsonProperty("isFromAdmin")
    @Column(nullable = false)
    private boolean isFromAdmin = false;

    @Column
    private LocalDateTime answeredAt;

    @Column(nullable = false)
    private boolean clearedByUser = false;

    @Column(nullable = false)
    private boolean clearedByAdmin = false;

    @Column(nullable = false)
    private boolean readByUser = false;

    @Column(columnDefinition = "TEXT")
    private String replyToMessage;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Query() {}

    public Query(User user, String question) {
        this.user = user;
        this.question = question;
    }

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }

    @com.fasterxml.jackson.annotation.JsonProperty("isFromAdmin")
    public boolean isFromAdmin() { return isFromAdmin; }
    public void setFromAdmin(boolean fromAdmin) { isFromAdmin = fromAdmin; }

    public boolean isClearedByUser() { return clearedByUser; }
    public void setClearedByUser(boolean clearedByUser) { this.clearedByUser = clearedByUser; }

    public boolean isClearedByAdmin() { return clearedByAdmin; }
    public void setClearedByAdmin(boolean clearedByAdmin) { this.clearedByAdmin = clearedByAdmin; }

    public boolean isReadByUser() { return readByUser; }
    public void setReadByUser(boolean readByUser) { this.readByUser = readByUser; }

    public String getReplyToMessage() { return replyToMessage; }
    public void setReplyToMessage(String replyToMessage) { this.replyToMessage = replyToMessage; }
}