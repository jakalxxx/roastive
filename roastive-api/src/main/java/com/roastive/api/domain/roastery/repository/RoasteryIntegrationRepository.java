package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryIntegration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryIntegrationRepository extends JpaRepository<RoasteryIntegration, UUID> {}
