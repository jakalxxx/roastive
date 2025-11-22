package com.roastive.api.domain.shipment.repository;

import com.roastive.api.domain.shipment.model.ShipmentAddressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShipmentAddressSnapshotRepository extends JpaRepository<ShipmentAddressSnapshot, UUID> {}


