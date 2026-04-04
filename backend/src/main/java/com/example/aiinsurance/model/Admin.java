package com.example.aiinsurance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // existing database column is still named 'username'; map our new field to it
    @Column(name = "username", nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // stored as bcrypt hash

    // Admin Insurance Fund (wallet) - accumulates premiums, deducted on claims
    @Column(nullable = false)
    private Double walletBalance = 0.0;

    // Display name for the admin
    @Column
    private String displayName = "Admin";

    public Admin() {}

    public Admin(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Double getWalletBalance() { return walletBalance != null ? walletBalance : 0.0; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
