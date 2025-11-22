package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface RoasteryContactRepository extends JpaRepository<RoasteryContact, UUID> {
    List<RoasteryContact> findByRoasteryIdOrderByCreatedAtDesc(UUID roasteryId);
}
