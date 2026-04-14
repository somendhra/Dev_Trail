package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Partner;
import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.PartnerRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class PartnerController {

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/api/partners")
    public List<Partner> getAllPartners() {
        return partnerRepository.findAll();
    }

    @PostMapping("/api/admin/partners")
    public ResponseEntity<?> addPartner(@RequestBody Partner partner) {
        try {
            Partner saved = partnerRepository.save(partner);

            // Notify all users about new partner
            try {
                List<User> users = userService.getAllUsers();
                for (User u : users) {
                    Notification n = new Notification();
                    n.setUser(u);
                    n.setTitle("New Partner Added 🤝");
                    n.setMessage(saved.getName() + " is now officially supported on GigShield! Update your app configuration to stay protected.");
                    n.setType("INFO");
                    notificationRepository.save(n);
                }
            } catch (Exception e) {}

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/partners/{id}")
    public ResponseEntity<?> deletePartner(@PathVariable Long id) {
        try {
            if (!partnerRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Partner not found"));
            }
            partnerRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Partner deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
