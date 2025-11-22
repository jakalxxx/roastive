package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryQaPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryQaPolicyRepository extends JpaRepository<RoasteryQaPolicy, UUID> {}
