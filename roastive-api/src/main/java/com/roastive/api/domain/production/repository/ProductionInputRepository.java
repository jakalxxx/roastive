package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionInput;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionInputRepository extends JpaRepository<ProductionInput, UUID> {}


