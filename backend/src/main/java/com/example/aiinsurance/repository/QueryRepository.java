package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.Query;
import com.example.aiinsurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueryRepository extends JpaRepository<Query, Long> {
    List<Query> findByUserOrderByCreatedAtAsc(User user);
}