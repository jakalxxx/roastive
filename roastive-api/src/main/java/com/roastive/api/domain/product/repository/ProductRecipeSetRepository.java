package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductRecipeSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRecipeSetRepository extends JpaRepository<ProductRecipeSet, UUID> {
    List<ProductRecipeSet> findByProductId(UUID productId);
}






























