package com.example.aiinsurance.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public void sendOtpEmail(String to, String otp) {
        try {
            if (to == null || to.trim().isEmpty()) {
                throw new IllegalArgumentException("Recipient email is required");
            }
            if (senderEmail == null || senderEmail.trim().isEmpty()) {
                throw new IllegalStateException("Email service is not configured. Set MAIL_USERNAME and MAIL_PASSWORD.");
            }

            logger.info("Attempting to send OTP email to: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(senderEmail.trim());
            helper.setTo(to);
            helper.setSubject("Gig Insurance verification code");

            String textContent = buildOtpEmailText(otp);
            helper.setText(textContent, false);

            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Messaging exception while sending email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    private String buildOtpEmailText(String otp) {
        return "Gig Insurance verification code\n\n"
                + "Your OTP is: " + otp + "\n"
                + "This code expires in 5 minutes.\n\n"
                + "If you did not request this, you can ignore this email.";
    }

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
