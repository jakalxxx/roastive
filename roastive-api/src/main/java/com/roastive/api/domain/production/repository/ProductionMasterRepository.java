package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionMasterRepository extends JpaRepository<ProductionMaster, UUID> {}


