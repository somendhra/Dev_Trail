package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserService            userService;
    @Autowired private JwtUtil                jwtUtil;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(username).orElseThrow();
        return ResponseEntity.ok(notificationRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
