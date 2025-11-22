package com.roastive.api.domain.tax.repository;

import com.roastive.api.domain.tax.model.TaxInvoiceExportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaxInvoiceExportLogRepository extends JpaRepository<TaxInvoiceExportLog, UUID> {}


