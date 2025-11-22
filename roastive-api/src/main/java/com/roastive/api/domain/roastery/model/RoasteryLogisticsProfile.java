package com.roastive.api.domain.roastery.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "roastery_logistics_profile")
public class RoasteryLogisticsProfile {
    @Id
    @Column(name = "logistics_id", nullable = false, columnDefinition = "uuid")
    private UUID logisticsId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "default_carrier", length = 120)
    private String defaultCarrier;

    @Column(name = "default_service", length = 120)
    private String defaultService;

    @Column(name = "pickup_cutoff_time")
    private LocalTime pickupCutoffTime;

    @Column(name = "ship_from_address_id", columnDefinition = "uuid")
    private UUID shipFromAddressId;

    @Column(name = "return_address_id", columnDefinition = "uuid")
    private UUID returnAddressId;

    @Column(name = "status", length = 32)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public UUID getLogisticsId() { return logisticsId; }
    public void setLogisticsId(UUID logisticsId) { this.logisticsId = logisticsId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public String getDefaultCarrier() { return defaultCarrier; }
    public void setDefaultCarrier(String defaultCarrier) { this.defaultCarrier = defaultCarrier; }
    public String getDefaultService() { return defaultService; }
    public void setDefaultService(String defaultService) { this.defaultService = defaultService; }
    public LocalTime getPickupCutoffTime() { return pickupCutoffTime; }
    public void setPickupCutoffTime(LocalTime pickupCutoffTime) { this.pickupCutoffTime = pickupCutoffTime; }
    public UUID getShipFromAddressId() { return shipFromAddressId; }
    public void setShipFromAddressId(UUID shipFromAddressId) { this.shipFromAddressId = shipFromAddressId; }
    public UUID getReturnAddressId() { return returnAddressId; }
    public void setReturnAddressId(UUID returnAddressId) { this.returnAddressId = returnAddressId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


