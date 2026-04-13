package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.Trigger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriggerRepository extends JpaRepository<Trigger, Long> {
    List<Trigger> findByIsActiveTrue();
    List<Trigger> findBySituationIgnoreCase(String situation);
    List<Trigger> findByIsActiveTrueOrderBySituationAsc();
}
