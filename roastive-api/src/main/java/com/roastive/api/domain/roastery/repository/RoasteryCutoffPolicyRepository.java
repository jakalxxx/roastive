package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryCutoffPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryCutoffPolicyRepository extends JpaRepository<RoasteryCutoffPolicy, UUID> {}
