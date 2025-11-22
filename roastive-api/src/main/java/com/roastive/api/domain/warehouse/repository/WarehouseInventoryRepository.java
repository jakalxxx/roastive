package com.roastive.api.domain.warehouse.repository;

import com.roastive.api.domain.warehouse.model.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, UUID> {}


