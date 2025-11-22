package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, UUID> {}


