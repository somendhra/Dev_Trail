package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Query;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.service.QueryService;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/queries")
@CrossOrigin(origins = "*")
public class QueryController {

    @Autowired
    private QueryService queryService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // helper to get current user from Authorization header
    private Optional<User> getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return Optional.empty();
        String email = jwtUtil.extractUsername(token);
        return userService.findByEmail(email);
    }

    @PostMapping
    public ResponseEntity<?> postQuestion(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody Map<String, String> body) {
        Optional<User> userOpt = getCurrentUser(authHeader);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        String question = body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "question required"));
        }
        Query q = queryService.create(userOpt.get(), question);
        return ResponseEntity.ok(q);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myQueries(@RequestHeader("Authorization") String authHeader) {
        Optional<User> userOpt = getCurrentUser(authHeader);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        List<Query> list = queryService.getForUser(userOpt.get()).stream()
                .filter(q -> !q.isClearedByUser())
                .toList();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/my/clear")
    public ResponseEntity<?> clearMyChat(@RequestHeader("Authorization") String authHeader) {
        Optional<User> userOpt = getCurrentUser(authHeader);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        queryService.clearForUser(userOpt.get());
        return ResponseEntity.ok(Map.of("message", "Chat cleared"));
    }

    @PostMapping("/my/mark-read")
    public ResponseEntity<?> markRead(@RequestHeader("Authorization") String authHeader) {
        Optional<User> userOpt = getCurrentUser(authHeader);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        queryService.markAsReadForUser(userOpt.get());
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }
}
