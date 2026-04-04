package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.Subscription;
import com.example.aiinsurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findTopByUserOrderByCreatedAtDesc(User user);
    List<Subscription> findByUserOrderByCreatedAtDesc(User user);
    List<Subscription> findByStatus(Subscription.Status status);
}
