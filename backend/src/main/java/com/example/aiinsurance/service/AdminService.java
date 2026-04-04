package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<Admin> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public Admin save(Admin admin) {
        // normalize email to lowercase for consistent lookups
        if (admin.getEmail() != null) {
            admin.setEmail(admin.getEmail().toLowerCase());
        }
        // ensure password is encoded
        if (admin.getPassword() != null && !admin.getPassword().startsWith("$2a$")) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        return adminRepository.save(admin);
    }

    public boolean authenticate(String email, String rawPassword) {
        if (email == null) return false;
        // perform lookup in lowercase
        Optional<Admin> adminOpt = adminRepository.findByEmail(email.toLowerCase());
        if (adminOpt.isEmpty()) return false;
        Admin admin = adminOpt.get();
        return passwordEncoder.matches(rawPassword, admin.getPassword());
    }

    public Admin changeCredentials(Long id, String newEmail, String newPassword) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (newEmail != null && !newEmail.isBlank()) {
            admin.setEmail(newEmail);
        }
        if (newPassword != null && !newPassword.isBlank()) {
            admin.setPassword(passwordEncoder.encode(newPassword));
        }
        return adminRepository.save(admin);
    }

    /**
     * Return all admin records (for debugging/migration purposes).
     */
    public java.util.List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Admin getAdminWallet() {
        java.util.List<Admin> admins = adminRepository.findAll();
        if (admins.isEmpty()) {
            throw new RuntimeException("No admin record found");
        }
        return admins.get(0);
    }
}