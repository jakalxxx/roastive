package com.roastive.api.domain.sales.repository;

import com.roastive.api.domain.sales.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID> {}


