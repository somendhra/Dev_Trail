package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.Notification;
import com.example.aiinsurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
