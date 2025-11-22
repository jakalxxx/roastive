package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryLogisticsProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryLogisticsProfileRepository extends JpaRepository<RoasteryLogisticsProfile, UUID> {}
