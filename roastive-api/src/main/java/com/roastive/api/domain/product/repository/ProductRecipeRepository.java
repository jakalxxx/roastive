package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductRecipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductRecipeRepository extends JpaRepository<ProductRecipe, UUID> {}


