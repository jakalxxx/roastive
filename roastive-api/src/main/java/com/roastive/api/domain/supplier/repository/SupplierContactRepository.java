package com.roastive.api.domain.supplier.repository;

import com.roastive.api.domain.supplier.model.SupplierContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierContactRepository extends JpaRepository<SupplierContact, UUID> {
    List<SupplierContact> findBySupplierIdOrderByPrimaryContactDescCreatedAtDesc(UUID supplierId);
    Optional<SupplierContact> findByContactIdAndSupplierId(UUID contactId, UUID supplierId);

    @Modifying
    @Query("update SupplierContact c set c.primaryContact = false where c.supplierId = :supplierId")
    void clearPrimary(UUID supplierId);
}


























