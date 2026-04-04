package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.ClaimRequest;
import com.example.aiinsurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT c FROM ClaimRequest c WHERE c.user = ?1 ORDER BY c.createdAt DESC")
    List<ClaimRequest> findByUser(User user);
    List<ClaimRequest> findByStatus(ClaimRequest.Status status);
}
