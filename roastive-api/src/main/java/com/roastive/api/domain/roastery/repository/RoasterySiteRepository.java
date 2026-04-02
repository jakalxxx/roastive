package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasterySite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoasterySiteRepository extends JpaRepository<RoasterySite, UUID> {
    boolean existsByRoasteryIdAndBranchSeqNo(UUID roasteryId, String branchSeqNo);
    Optional<RoasterySite> findByAddressId(UUID addressId);
}
