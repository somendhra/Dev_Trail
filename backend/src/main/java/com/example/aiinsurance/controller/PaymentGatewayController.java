package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.RazorpayService;
import com.example.aiinsurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentGatewayController {

    @Autowired private RazorpayService razorpayService;
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AdminController adminController;
    @Autowired private PaymentRepository paymentRepository;

    @Value("${payment.razorpay.enabled:false}")
    private boolean razorpayEnabled;

    @Value("${razorpay.key.id:disabled}")
    private String keyId;

    private ResponseEntity<?> razorpayDisabledResponse() {
        return ResponseEntity.status(503).body(Map.of("error", "Razorpay integration is disabled"));
    }

    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Unauthorized");
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token))
            throw new RuntimeException("Invalid token");
        String email = jwtUtil.extractUsername(token);
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/razorpay/key")
    public ResponseEntity<?> getKey(@RequestHeader("Authorization") String authHeader) {
        if (!razorpayEnabled) {
            return razorpayDisabledResponse();
        }
        resolveUser(authHeader); // auth check
        return ResponseEntity.ok(Map.of("key", keyId));
    }

    @PostMapping("/razorpay/order")
    public ResponseEntity<?> createOrder(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body
    ) {
        if (!razorpayEnabled) {
            return razorpayDisabledResponse();
        }
        try {
            resolveUser(authHeader);
            double amount = Double.parseDouble(body.get("amount").toString());
            String receipt = "receipt_" + System.currentTimeMillis();

            String orderId = razorpayService.createOrder(amount, receipt);
            return ResponseEntity.ok(Map.of("id", orderId, "amount", amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body
    ) {
        if (!razorpayEnabled) {
            return razorpayDisabledResponse();
        }
        try {
            resolveUser(authHeader);
            boolean isValid = razorpayService.verifySignature(body);

            if (isValid) {
                Long paymentId = Long.parseLong(body.get("paymentId").toString());
                Optional<Payment> payOpt = paymentRepository.findById(paymentId);
                
                if (payOpt.isPresent()) {
                    Payment p = payOpt.get();
                    p.setGatewayReference(body.get("razorpay_payment_id"));
                    paymentRepository.save(p);
                    
                    // Call admin approval logic to automatically finalize the plan
                    adminController.approvePayment(p.getId());
                }

                return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified and plan activated."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid payment signature."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
