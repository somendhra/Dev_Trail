package com.example.aiinsurance.controller;

import com.example.aiinsurance.model.User;
import com.example.aiinsurance.security.JwtUtil;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.service.EmailService;
import com.example.aiinsurance.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AdminService adminService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void registerInitReturnsServiceUnavailableWhenOtpEmailFails() throws Exception {
        when(userService.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(userService.existsByPhone("9999999999")).thenReturn(false);
        when(emailService.generateOtp()).thenReturn("123456");
        doThrow(new IllegalStateException("Email service is not configured. Set MAIL_USERNAME and MAIL_PASSWORD."))
                .when(emailService).sendOtpEmail("newuser@example.com", "123456");

        Map<String, String> body = Map.of(
                "email", "newuser@example.com",
                "phone", "9999999999"
        );

        mockMvc.perform(post("/api/auth/register-init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Email service is not configured. Set MAIL_USERNAME and MAIL_PASSWORD."));
    }

    @Test
    void loginReturnsServiceUnavailableAndClearsOtpWhenEmailSendFails() throws Exception {
        User user = new User("Normal User", "user@example.com", "9999999999", "encoded-password", "Zomato");
        user.setId(1L);

        when(adminService.findByEmail("user@example.com")).thenReturn(Optional.empty());
        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userService.validatePassword("secret123", "encoded-password")).thenReturn(true);
        when(emailService.generateOtp()).thenReturn("654321");

        List<User> savedSnapshots = new ArrayList<>();
        when(userService.updateUser(any(User.class))).thenAnswer(invocation -> {
            User incoming = invocation.getArgument(0);
            User snapshot = new User();
            snapshot.setOtp(incoming.getOtp());
            snapshot.setOtpExpiry(incoming.getOtpExpiry());
            savedSnapshots.add(snapshot);
            return incoming;
        });

        doThrow(new RuntimeException("SMTP unavailable"))
                .when(emailService).sendOtpEmail("user@example.com", "654321");

        Map<String, String> body = Map.of(
                "identifier", "user@example.com",
                "password", "secret123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("SMTP unavailable"));

        assertThat(savedSnapshots).hasSize(2);
        User firstSave = savedSnapshots.get(0);
        User secondSave = savedSnapshots.get(1);

        assertThat(firstSave.getOtp()).isEqualTo("654321");
        assertThat(secondSave.getOtp()).isNull();
        assertThat(secondSave.getOtpExpiry()).isNull();
    }
}
