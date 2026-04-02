package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductBasePrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductBasePriceRepository extends JpaRepository<ProductBasePrice, UUID> {
    List<ProductBasePrice> findByProductId(UUID productId);
}






























