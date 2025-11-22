package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryBrandAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryBrandAssetRepository extends JpaRepository<RoasteryBrandAsset, UUID> {}
