package com.roastive.api.domain.tax.repository;

import com.roastive.api.domain.tax.model.TaxInvoiceMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaxInvoiceMasterRepository extends JpaRepository<TaxInvoiceMaster, UUID> {}


