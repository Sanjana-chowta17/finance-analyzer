package com.financeapp.repository;

import com.financeapp.model.Insight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InsightRepository extends JpaRepository<Insight, Long> {
    List<Insight> findByUserIdOrderByGeneratedAtDesc(Long userId);
}
