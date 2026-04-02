package com.roastive.api.domain.sales.repository;

import com.roastive.api.domain.sales.model.SalesOrderStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalesOrderStatusLogRepository extends JpaRepository<SalesOrderStatusLog, UUID> {
    List<SalesOrderStatusLog> findByOrderIdOrderByChangedAtDesc(UUID orderId);
}


