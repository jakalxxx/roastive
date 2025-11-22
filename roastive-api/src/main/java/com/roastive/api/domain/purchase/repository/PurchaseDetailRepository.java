package com.roastive.api.domain.purchase.repository;

import com.roastive.api.domain.purchase.model.PurchaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseDetailRepository extends JpaRepository<PurchaseDetail, UUID> {}


