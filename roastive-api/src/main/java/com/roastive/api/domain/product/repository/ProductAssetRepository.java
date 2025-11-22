package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductAssetRepository extends JpaRepository<ProductAsset, UUID> {}


