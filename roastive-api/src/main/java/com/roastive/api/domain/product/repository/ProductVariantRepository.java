package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {}


