package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.User;
import com.example.aiinsurance.service.UserService;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.EmailService;
import com.example.aiinsurance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final long REGISTRATION_OTP_EXPIRY_MINUTES = 5;
    private static final long FORGOT_PASSWORD_OTP_EXPIRY_MINUTES = 10;

    private record RegistrationOtpEntry(String otp, LocalDateTime expiresAt) {}

    private final Map<String, RegistrationOtpEntry> registrationOtps = new ConcurrentHashMap<>();
    private final Map<String, RegistrationOtpEntry> forgotPasswordOtps = new ConcurrentHashMap<>();

    @Value("${app.email.mock-enabled:false}")
    private boolean mockEmailEnabled;

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // needed for encoding a new password during profile updates
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register-init")
    public ResponseEntity<?> registerInit(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            email = email.toLowerCase().trim();
            String phone = request.get("phone");

            if (userService.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            if (phone != null && !phone.trim().isEmpty() && userService.existsByPhone(phone.trim())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number already exists"));
            }

            String otp = emailService.generateOtp();
            registrationOtps.put(email, new RegistrationOtpEntry(otp,
                    LocalDateTime.now().plusMinutes(REGISTRATION_OTP_EXPIRY_MINUTES)));

            try {
                emailService.sendOtpEmail(email, otp);
            } catch (Exception e) {
                registrationOtps.remove(email);
                String message = (e.getMessage() == null || e.getMessage().isBlank())
                        ? "Unable to send OTP email right now. Please try again."
                        : e.getMessage();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", message));
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "OTP sent to " + email);
            resp.put("expiresInMinutes", REGISTRATION_OTP_EXPIRY_MINUTES);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            email = email.toLowerCase().trim();
            String phone = request.get("phone");
            String password = request.get("password");
            String platform = request.get("platform");
            String otp = request.get("otp");

            RegistrationOtpEntry otpEntry = registrationOtps.get(email);
            if (otpEntry == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
            }
            if (otpEntry.expiresAt().isBefore(LocalDateTime.now())) {
                registrationOtps.remove(email);
                return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired. Please request a new one."));
            }
            if (!otpEntry.otp().equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
            }

            User user = new User(name, email, phone, password, platform);
            User savedUser = userService.registerUser(user);
            registrationOtps.remove(email);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully. Please login with your registered email: " + savedUser.getEmail());
            response.put("email", savedUser.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String identifier = request.get("identifier");
            String password = request.get("password");

            // if identifier belongs to an admin, authenticate strictly as admin
            if (identifier != null) {
                String normalized = identifier.toLowerCase();
                Optional<com.example.aiinsurance.model.Admin> adminOpt = adminService.findByEmail(normalized);
                if (adminOpt.isPresent()) {
                    if (!adminService.authenticate(normalized, password)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
                    }
                    String token = jwtUtil.generateToken(normalized, true);
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("isAdmin", true);
                    response.put("email", normalized);
                    return ResponseEntity.ok(response);
                }
                // if email not found, try legacy username migration (local-part)
                if (normalized.contains("@")) {
                    String local = normalized.split("@", 2)[0];
                    Optional<com.example.aiinsurance.model.Admin> legacyOpt = adminService.findByEmail(local);
                    if (legacyOpt.isPresent()) {
                        // check password against legacy record
                        if (adminService.authenticate(local, password)) {
                            // update the admin record to new email
                            adminService.changeCredentials(legacyOpt.get().getId(), normalized, null);
                            String token = jwtUtil.generateToken(normalized, true);
                            Map<String, Object> response = new HashMap<>();
                            response.put("token", token);
                            response.put("isAdmin", true);
                            response.put("email", normalized);
                            return ResponseEntity.ok(response);
                        } else {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
                        }
                    }
                }
            }

            String normalizedId = identifier != null ? identifier.toLowerCase().trim() : "";
            Optional<User> userOpt = userService.findByEmail(normalizedId);
            if (userOpt.isEmpty()) {
                userOpt = userService.findByPhone(normalizedId);
            }

            if (userOpt.isEmpty() || !userService.validatePassword(password, userOpt.get().getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();
            
            // Generate and send OTP
            String otp = emailService.generateOtp();
            user.setOtp(otp);
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
            userService.updateUser(user);

            try {
                emailService.sendOtpEmail(user.getEmail(), otp);
            } catch (Exception e) {
                user.setOtp(null);
                user.setOtpExpiry(null);
                userService.updateUser(user);
                String message = (e.getMessage() == null || e.getMessage().isBlank())
                        ? "Unable to send OTP email right now. Please try again."
                        : e.getMessage();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", message));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to your registered email");
            response.put("requiresOtp", true);
            response.put("email", user.getEmail()); // return email for verification step
            response.put("phone", user.getPhone());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/social")
    public ResponseEntity<?> socialLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required from social provider"));
            }

            email = email.toLowerCase().trim();

            Optional<com.example.aiinsurance.model.Admin> adminOpt = adminService.findByEmail(email);
            if (adminOpt.isPresent()) {
                String token = jwtUtil.generateToken(email, true);
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("isAdmin", true);
                response.put("email", email);
                return ResponseEntity.ok(response);
            }

            Optional<User> userOpt = userService.findByEmail(email);
            User user;
            if (userOpt.isEmpty()) {
                user = new User(
                        name != null && !name.trim().isEmpty() ? name : email.split("@")[0],
                        email,
                        "SOCIAL_" + email.hashCode(), // unique placeholder — no phone from social login
                        passwordEncoder.encode(java.util.UUID.randomUUID().toString()),
                        "WEB"
                );
                user = userService.registerUser(user);
            } else {
                user = userOpt.get();
            }

            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("isAdmin", false);
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String identifier = request.get("identifier");
            String otp = request.get("otp");

            if (identifier == null || identifier.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Identifier is required"));
            }

            String normalizedIdentifier = identifier.trim();
            if (normalizedIdentifier.contains("@")) {
                normalizedIdentifier = normalizedIdentifier.toLowerCase();
            }

            Optional<User> userOpt = userService.findByEmail(normalizedIdentifier);
            if (userOpt.isEmpty()) {
                userOpt = userService.findByPhone(normalizedIdentifier);
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getOtp() == null || !user.getOtp().equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
            }

            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
            }

            // Clear OTP after successful verification
            user.setOtp(null);
            user.setOtpExpiry(null);
            userService.updateUser(user);

            String token = jwtUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("isAdmin", false);
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("platform", user.getPlatform());
            response.put("state", user.getState());
            response.put("district", user.getDistrict());
            response.put("mandal", user.getMandal());
            response.put("walletBalance", user.getWalletBalance());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, String> updates) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            // update allowed fields if present in request
            if (updates.containsKey("name")) {
                user.setName(updates.get("name"));
            }
            if (updates.containsKey("phone")) {
                String newPhone = updates.get("phone");
                if (!newPhone.equals(user.getPhone()) && userService.existsByPhone(newPhone)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Phone number already in use"));
                }
                user.setPhone(newPhone);
            }
            boolean needsReverification = false;

            if (updates.containsKey("platform")) {
                String newVal = updates.get("platform");
                if (newVal != null && !newVal.equals(user.getPlatform())) {
                    user.setPlatform(newVal);
                    needsReverification = true;
                }
            }
            if (updates.containsKey("password")) {
                user.setPassword(passwordEncoder.encode(updates.get("password")));
            }
            if (updates.containsKey("state")) {
                String val = updates.get("state");
                if (val != null && !val.trim().isEmpty() && !val.equals(user.getState())) {
                    user.setState(val);
                    needsReverification = true;
                }
            }
            if (updates.containsKey("district")) {
                String val = updates.get("district");
                if (val != null && !val.trim().isEmpty() && !val.equals(user.getDistrict())) {
                    user.setDistrict(val);
                    needsReverification = true;
                }
            }
            if (updates.containsKey("mandal")) {
                String val = updates.get("mandal");
                if (val != null && !val.trim().isEmpty() && !val.equals(user.getMandal())) {
                    user.setMandal(val);
                    needsReverification = true;
                }
            }
            
            // Allow explicit re-verification request from frontend
            if (updates.containsKey("requestReverification") && Boolean.parseBoolean(updates.get("requestReverification"))) {
                needsReverification = true;
            }

            if (needsReverification) {
                user.setVerificationStatus("PENDING");
            }

            User updated = userService.updateUser(user);

            Map<String, Object> res = new HashMap<>();
            res.put("message", "Profile updated successfully");
            res.put("id", updated.getId());
            res.put("name", updated.getName());
            res.put("email", updated.getEmail());
            res.put("phone", updated.getPhone());
            res.put("platform", updated.getPlatform());
            res.put("state", updated.getState());
            res.put("district", updated.getDistrict());
            res.put("mandal", updated.getMandal());
            res.put("walletBalance", updated.getWalletBalance());
            res.put("verificationStatus", updated.getVerificationStatus());
            res.put("createdAt", updated.getCreatedAt() != null ? updated.getCreatedAt().toString() : null);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Forgot Password ─ Step 1: send OTP ───────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            email = email.toLowerCase().trim();

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No account found with this email address."));
            }

            String otp = emailService.generateOtp();
            forgotPasswordOtps.put(email, new RegistrationOtpEntry(otp,
                    LocalDateTime.now().plusMinutes(FORGOT_PASSWORD_OTP_EXPIRY_MINUTES)));

            try {
                emailService.sendOtpEmail(email, otp);
            } catch (Exception e) {
                forgotPasswordOtps.remove(email);
                String message = (e.getMessage() == null || e.getMessage().isBlank())
                        ? "Unable to send OTP email right now. Please try again."
                        : e.getMessage();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", message));
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Password reset OTP sent to " + email);
            resp.put("expiresInMinutes", FORGOT_PASSWORD_OTP_EXPIRY_MINUTES);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Forgot Password ─ Step 2: verify OTP + set new password ───────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
            }

            email = email.toLowerCase().trim();

            RegistrationOtpEntry otpEntry = forgotPasswordOtps.get(email);
            if (otpEntry == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No password reset request found. Please request a new OTP."));
            }
            if (otpEntry.expiresAt().isBefore(LocalDateTime.now())) {
                forgotPasswordOtps.remove(email);
                return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired. Please request a new one."));
            }
            if (!otpEntry.otp().equals(otp.trim())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP. Please check and try again."));
            }

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setOtp(null);
            user.setOtpExpiry(null);
            userService.updateUser(user);
            forgotPasswordOtps.remove(email);

            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successfully. Please login with your new password.",
                    "email", email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Change Password (authenticated) ──────────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Map<String, String> request) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            String currentPassword = request.get("currentPassword");
            String newPassword     = request.get("newPassword");

            if (currentPassword == null || currentPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is required"));
            }
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
            }

            String email = jwtUtil.extractUsername(token);
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            if (currentPassword.equals(newPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password must be different from the current password"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}