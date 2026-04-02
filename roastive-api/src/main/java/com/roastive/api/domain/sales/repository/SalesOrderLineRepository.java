package com.roastive.api.domain.sales.repository;

import com.roastive.api.domain.sales.model.SalesOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalesOrderLineRepository extends JpaRepository<SalesOrderLine, UUID> {
    List<SalesOrderLine> findByOrderId(UUID orderId);
}


