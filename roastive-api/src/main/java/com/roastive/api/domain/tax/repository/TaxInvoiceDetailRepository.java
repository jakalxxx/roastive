package com.roastive.api.domain.tax.repository;

import com.roastive.api.domain.tax.model.TaxInvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaxInvoiceDetailRepository extends JpaRepository<TaxInvoiceDetail, UUID> {}


