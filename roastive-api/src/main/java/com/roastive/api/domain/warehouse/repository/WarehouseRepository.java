package com.roastive.api.domain.warehouse.repository;

import com.roastive.api.domain.warehouse.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {}


