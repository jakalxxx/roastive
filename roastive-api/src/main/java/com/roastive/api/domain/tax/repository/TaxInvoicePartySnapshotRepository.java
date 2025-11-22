package com.roastive.api.domain.tax.repository;

import com.roastive.api.domain.tax.model.TaxInvoicePartySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaxInvoicePartySnapshotRepository extends JpaRepository<TaxInvoicePartySnapshot, UUID> {}


