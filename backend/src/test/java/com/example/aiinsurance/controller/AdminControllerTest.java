package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.Payment;
import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.model.Query;
import com.example.aiinsurance.model.Subscription;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.AdminRepository;
import com.example.aiinsurance.repository.ClaimRequestRepository;
import com.example.aiinsurance.repository.NotificationRepository;
import com.example.aiinsurance.repository.PaymentRepository;
import com.example.aiinsurance.repository.SubscriptionRepository;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.PlanService;
import com.example.aiinsurance.service.QueryService;
import com.example.aiinsurance.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private AdminService adminService;

    @MockBean
    private PlanService planService;

    @MockBean
    private PaymentRepository paymentRepository;

    @MockBean
    private AdminRepository adminRepository;

    @MockBean
    private SubscriptionRepository subscriptionRepository;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private ClaimRequestRepository claimRequestRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private QueryService queryService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    public void setup() throws Exception {
        // For simplicity, we'll assume a valid token is generated and used.
        // In a real-world scenario, you'd mock the JWT generation/validation.
        adminToken = "valid-admin-token";
    }

    @Test
    public void contextLoads() throws Exception {
        // Basic test to ensure the context loads
    }

    @Test
    public void testListUsers() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");

        List<User> users = Collections.singletonList(user);

        when(userService.getAllUsers()).thenReturn(users);

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test User"));
    }

    @Test
    public void testDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/admin/users/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testUpdateUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("Original Name");

        when(userService.findById(1L)).thenReturn(java.util.Optional.of(user));
        when(userService.updateUser(any(User.class))).thenReturn(user);

        Map<String, Object> updates = Map.of("name", "Updated Name");

        mockMvc.perform(put("/api/admin/users/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    public void testListPlans() throws Exception {
        Plan plan = new Plan();
        plan.setId(1L);
        plan.setName("Test Plan");

        when(planService.getAllPlans()).thenReturn(Collections.singletonList(plan));

        mockMvc.perform(get("/api/admin/plans")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Plan"));
    }

    @Test
    public void testUpdatePlan() throws Exception {
        Plan plan = new Plan();
        plan.setId(1L);
        plan.setName("Original Plan");

        when(planService.getPlanById(1L)).thenReturn(plan);
        when(planService.savePlan(any(Plan.class))).thenReturn(plan);

        Map<String, Object> updates = Map.of("name", "Updated Plan");

        mockMvc.perform(put("/api/admin/plans/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Plan"));
    }

    @Test
    public void testCreatePlan() throws Exception {
        Plan plan = new Plan();
        plan.setName("New Plan");

        when(planService.savePlan(any(Plan.class))).thenReturn(plan);

        Map<String, Object> newPlan = Map.of("name", "New Plan");

        mockMvc.perform(post("/api/admin/plans")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPlan)))
                .andExpect(status().isOk());
    }

    @Test
    public void testListPayments() throws Exception {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(100.0);

        when(paymentRepository.findAll()).thenReturn(Collections.singletonList(payment));

        mockMvc.perform(get("/api/admin/payments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].amount").value(100.0));
    }

    @Test
    public void testApprovePayment() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setWalletBalance(200.0);

        Plan plan = new Plan();
        plan.setId(1L);
        plan.setCoverageAmount(1000.0);

        Subscription subscription = new Subscription();
        subscription.setId(1L);
        subscription.setPlan(plan);

        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(100.0);
        payment.setStatus(Payment.Status.PENDING);
        payment.setUser(user);
        payment.setSubscription(subscription);
        payment.setMethod(Payment.Method.WALLET);

        Admin admin = new Admin();
        admin.setWalletBalance(10000.0);

        when(paymentRepository.findById(1L)).thenReturn(java.util.Optional.of(payment));
        when(adminService.getAdminWallet()).thenReturn(admin);
        when(userService.updateUser(any(User.class))).thenReturn(user);
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(subscription);
        when(notificationRepository.save(any(Notification.class))).thenReturn(new Notification());
        when(adminRepository.save(any(Admin.class))).thenReturn(admin);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        mockMvc.perform(put("/api/admin/payments/1/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Payment approved and policy activated"));
    }

    @Test
    public void testRejectPayment() throws Exception {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setStatus(Payment.Status.PENDING);
        payment.setUser(new User());

        when(paymentRepository.findById(1L)).thenReturn(java.util.Optional.of(payment));
        when(notificationRepository.save(any(Notification.class))).thenReturn(new Notification());
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        mockMvc.perform(put("/api/admin/payments/1/reject")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Payment rejected"));
    }

    @Test
    public void testDeletePayment() throws Exception {
        mockMvc.perform(delete("/api/admin/payments/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetAdminWalletInfo() throws Exception {
        Admin admin = new Admin();
        admin.setWalletBalance(10000.0);

        when(adminService.getAdminWallet()).thenReturn(admin);
        when(paymentRepository.findAll()).thenReturn(Collections.emptyList());
        when(claimRequestRepository.findAll()).thenReturn(Collections.emptyList());
        when(adminRepository.findAll()).thenReturn(Collections.singletonList(admin));


        mockMvc.perform(get("/api/admin/wallet")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.walletBalance").value(0.0));
    }

    @Test
    public void testChangeCredentials() throws Exception {
        Admin admin = new Admin();
        admin.setId(1L);
        admin.setEmail("admin@example.com");

        when(jwtUtil.validateToken(anyString())).thenReturn(true);
        when(jwtUtil.extractIsAdmin(anyString())).thenReturn(true);
        when(jwtUtil.extractUsername(anyString())).thenReturn("admin@example.com");
        when(adminService.findByEmail("admin@example.com")).thenReturn(java.util.Optional.of(admin));
        when(adminService.changeCredentials(anyLong(), anyString(), nullable(String.class))).thenReturn(admin);
        when(jwtUtil.generateToken(anyString(), anyBoolean())).thenReturn("new-token");

        Map<String, String> updates = Map.of("email", "new-admin@example.com");

        mockMvc.perform(put("/api/auth/admin/change")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-token"));
    }

    @Test
    public void testListQueries() throws Exception {
        Query query = new Query();
        query.setId(1L);
        query.setQuestion("Test question");

        when(queryService.getAll()).thenReturn(Collections.singletonList(query));

        mockMvc.perform(get("/api/admin/queries")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].question").value("Test question"));
    }

    @Test
    public void testReplyQuery() throws Exception {
        Query query = new Query();
        query.setId(1L);
        query.setUser(new User());

        Query reply = new Query();
        reply.setId(2L);

        when(queryService.findById(1L)).thenReturn(java.util.Optional.of(query));
        when(queryService.createFromAdmin(any(User.class), anyString(), isNull())).thenReturn(reply);

        Map<String, String> body = Map.of("answer", "Test answer");

        mockMvc.perform(put("/api/admin/queries/1/reply")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L));
    }

    @Test
    public void testClearUserChat() throws Exception {
        User user = new User();
        user.setId(1L);

        when(userService.findById(1L)).thenReturn(java.util.Optional.of(user));

        mockMvc.perform(delete("/api/admin/queries/user/1/clear")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Chat cleared for admin"));
    }
}
