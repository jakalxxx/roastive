package com.roastive.api.domain.supplier.repository;

import com.roastive.api.domain.supplier.model.SupplierContract;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupplierContractRepository extends JpaRepository<SupplierContract, UUID> {
    @EntityGraph(attributePaths = "prices")
    List<SupplierContract> findBySupplierIdOrderByStartDateDesc(UUID supplierId);
}


























