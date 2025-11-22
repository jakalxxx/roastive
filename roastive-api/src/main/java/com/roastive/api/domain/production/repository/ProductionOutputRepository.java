package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionOutput;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionOutputRepository extends JpaRepository<ProductionOutput, UUID> {}


