package com.roastive.api.domain.shipment.repository;

import com.roastive.api.domain.shipment.model.ShipmentDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShipmentDetailRepository extends JpaRepository<ShipmentDetail, UUID> {}


