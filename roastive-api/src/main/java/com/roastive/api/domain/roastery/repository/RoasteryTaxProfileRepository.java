package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryTaxProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoasteryTaxProfileRepository extends JpaRepository<RoasteryTaxProfile, UUID> {
    Optional<RoasteryTaxProfile> findFirstByRoasteryIdOrderByCreatedAtDesc(UUID roasteryId);
    Optional<RoasteryTaxProfile> findByTaxProfileIdAndRoasteryId(UUID taxProfileId, UUID roasteryId);
}
