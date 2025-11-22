package com.roastive.api.domain.product.repository;

import com.roastive.api.domain.product.model.ProductMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductMasterRepository extends JpaRepository<ProductMaster, UUID> {}


