package com.example.aiinsurance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "partners")
public class Partner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String logoUrl;

    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String dashboardBannerUrl;

    @Column(columnDefinition = "LONGTEXT", nullable = true)
    private String profileBannerUrl;

    @Column(nullable = false)
    private String borderColor;

    public Partner() {}

    public Partner(String name, String logoUrl, String dashboardBannerUrl, String profileBannerUrl, String borderColor) {
        this.name = name;
        this.logoUrl = logoUrl;
        this.dashboardBannerUrl = dashboardBannerUrl;
        this.profileBannerUrl = profileBannerUrl;
        this.borderColor = borderColor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getDashboardBannerUrl() { return dashboardBannerUrl; }
    public void setDashboardBannerUrl(String dashboardBannerUrl) { this.dashboardBannerUrl = dashboardBannerUrl; }

    public String getProfileBannerUrl() { return profileBannerUrl; }
    public void setProfileBannerUrl(String profileBannerUrl) { this.profileBannerUrl = profileBannerUrl; }

    public String getBorderColor() { return borderColor; }
    public void setBorderColor(String borderColor) { this.borderColor = borderColor; }
}
