package com.roastive.api.domain.supplier.repository;

import com.roastive.api.domain.supplier.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    List<Supplier> findByRoasteryId(UUID roasteryId);
    Optional<Supplier> findBySupplierIdAndRoasteryId(UUID supplierId, UUID roasteryId);
}


