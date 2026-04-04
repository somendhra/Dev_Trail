package com.example.aiinsurance.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Service
public class RazorpayService {

    @Value("${payment.razorpay.enabled:false}")
    private boolean razorpayEnabled;

    @Value("${razorpay.key.id:rzp_test_z1V4NXV4NXV4NX}") // Default test key
    private String keyId;

    @Value("${razorpay.key.secret:rzp_test_secret_NXV4NXV4NXV4NX}") // Default test secret
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws Exception {
        if (!razorpayEnabled) {
            return;
        }
        this.client = new RazorpayClient(keyId, keySecret);
    }

    public String createOrder(double amount, String receiptId) throws Exception {
        if (!razorpayEnabled || client == null) {
            throw new IllegalStateException("Razorpay is disabled");
        }
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); // amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receiptId);
        orderRequest.put("payment_capture", 1); // auto-capture

        Order order = client.orders.create(orderRequest);
        return order.get("id");
    }

    public boolean verifySignature(Map<String, String> data) {
        if (!razorpayEnabled || client == null) {
            return false;
        }
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            return false;
        }
    }
}
