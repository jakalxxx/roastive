package com.roastive.api.domain.supplier.repository;

import com.roastive.api.domain.supplier.model.SupplierItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierItemRepository extends JpaRepository<SupplierItem, UUID> {
    List<SupplierItem> findBySupplierIdOrderByCreatedAtDesc(UUID supplierId);
    Optional<SupplierItem> findBySupplierItemIdAndSupplierId(UUID supplierItemId, UUID supplierId);
}


























