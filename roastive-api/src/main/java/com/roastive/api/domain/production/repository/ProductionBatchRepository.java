package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, UUID> {}


