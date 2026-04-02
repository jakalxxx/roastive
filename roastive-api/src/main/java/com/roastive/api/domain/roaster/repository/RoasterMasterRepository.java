package com.roastive.api.domain.roaster.repository;

import com.roastive.api.domain.roaster.model.RoasterMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoasterMasterRepository extends JpaRepository<RoasterMaster, UUID> {
    List<RoasterMaster> findByRoasteryId(UUID roasteryId);
}







