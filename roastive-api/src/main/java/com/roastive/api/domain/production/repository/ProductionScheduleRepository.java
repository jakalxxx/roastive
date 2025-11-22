package com.roastive.api.domain.production.repository;

import com.roastive.api.domain.production.model.ProductionSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductionScheduleRepository extends JpaRepository<ProductionSchedule, UUID> {}


