package com.roastive.api.domain.shipment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "shipment_detail")
public class ShipmentDetail {
    @Id
    @Column(name = "detail_id", nullable = false, columnDefinition = "uuid")
    private UUID detailId;

    @Column(name = "shipment_id", nullable = false, columnDefinition = "uuid")
    private UUID shipmentId;

    @Column(name = "packaging_detail_id")
    private Long packagingDetailId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @PrePersist
    public void prePersist() {
        if (detailId == null) detailId = UUID.randomUUID();
    }

    public UUID getDetailId() { return detailId; }
    public void setDetailId(UUID detailId) { this.detailId = detailId; }
    public UUID getShipmentId() { return shipmentId; }
    public void setShipmentId(UUID shipmentId) { this.shipmentId = shipmentId; }
    public Long getPackagingDetailId() { return packagingDetailId; }
    public void setPackagingDetailId(Long packagingDetailId) { this.packagingDetailId = packagingDetailId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}


