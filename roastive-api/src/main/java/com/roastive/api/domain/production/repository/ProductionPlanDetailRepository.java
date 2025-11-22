package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionPlanDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionPlanDetailRepository extends JpaRepository<ProductionPlanDetail, UUID> {}


