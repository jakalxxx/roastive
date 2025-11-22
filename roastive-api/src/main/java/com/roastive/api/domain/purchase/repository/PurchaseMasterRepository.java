package com.roastive.api.domain.purchase.repository;

import com.roastive.api.domain.purchase.model.PurchaseMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseMasterRepository extends JpaRepository<PurchaseMaster, UUID> {}


