package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface RoasteryAddressRepository extends JpaRepository<RoasteryAddress, UUID> {
    List<RoasteryAddress> findByRoasteryIdOrderByCreatedAtDesc(UUID roasteryId);
    boolean existsByRoasteryIdAndAddressType(UUID roasteryId, String addressType);
    RoasteryAddress findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(UUID roasteryId, String addressType);
}
