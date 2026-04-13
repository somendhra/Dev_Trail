package com.example.aiinsurance;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Partner;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminService adminService;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private void ensureAdminCredentials(String email, String password) {
        Optional<Admin> adminOpt = adminService.findByEmail(email);
        if (adminOpt.isEmpty()) {
            adminService.save(new Admin(email, password));
            System.out.println("Created admin account: " + email);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        String primaryAdminEmail = "2300033142cse4@gmail.com".toLowerCase();
        String primaryAdminPassword = "Sommu@123";
        String secondaryAdminEmail = "gigadmin@gmail.com".toLowerCase();
        String secondaryAdminPassword = "gigadmin@123";

        // Migrate very old username-style admin record if present.
        Optional<Admin> legacy = adminService.findByEmail("gigadmin");
        if (legacy.isPresent() && adminService.findByEmail(secondaryAdminEmail).isEmpty()) {
            adminService.changeCredentials(legacy.get().getId(), secondaryAdminEmail, secondaryAdminPassword);
            System.out.println("Migrated legacy admin username to: " + secondaryAdminEmail);
        }

        // Keep both requested admin logins active.
        ensureAdminCredentials(primaryAdminEmail, primaryAdminPassword);
        ensureAdminCredentials(secondaryAdminEmail, secondaryAdminPassword);

        // Drop legacy bg_color column if it exists to fix NOT NULL constraint issues
        try {
            jdbcTemplate.execute("ALTER TABLE partners DROP COLUMN bg_color");
            System.out.println("Successfully dropped legacy bg_color column from partners table.");
        } catch (Exception e) {
            // Safe to ignore: column might already be dropped or table not created yet
            System.out.println("Note: bg_color column check (already dropped or table fresh).");
        }

        // dump list of admins for debugging
        System.out.println("Current admins:");
        adminService.getAllAdmins().forEach(a -> System.out.println("  " + a.getId() + " -> " + a.getEmail()));

        // Add default partners if empty
        if (partnerRepository.count() == 0) {
            List<Partner> defaults = List.of(
                new Partner("Zomato", "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", null, null, "#fca5a5"),
                new Partner("Swiggy", "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", null, null, "#fdba74"),
                new Partner("Amazon", "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", null, null, "#fcd34d"),
                new Partner("Zepto", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", null, null, "#c4b5fd"),
                new Partner("Blinkit", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", null, null, "#86efac")
            );
            partnerRepository.saveAll(defaults);
            System.out.println("Created " + defaults.size() + " default partner platforms");
        }
    }
}
