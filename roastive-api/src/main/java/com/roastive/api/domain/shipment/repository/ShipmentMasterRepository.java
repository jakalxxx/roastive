package com.roastive.api.domain.shipment.repository;

import com.roastive.api.domain.shipment.model.ShipmentMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShipmentMasterRepository extends JpaRepository<ShipmentMaster, UUID> {}


