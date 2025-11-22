package com.roastive.api.domain.roaster.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roaster_master")
public class RoasterMaster {
    @Id
    @Column(name = "roaster_id", nullable = false, columnDefinition = "uuid")
    private UUID roasterId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "roaster_name", nullable = false, length = 160)
    private String roasterName;

    @Column(name = "manufacturer", length = 120)
    private String manufacturer;

    @Column(name = "model", length = 120)
    private String model;

    @Column(name = "serial_no", length = 120)
    private String serialNo;

    @Column(name = "purchase_date")
    private OffsetDateTime purchaseDate;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (roasterId == null) roasterId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getRoasterId() { return roasterId; }
    public void setRoasterId(UUID roasterId) { this.roasterId = roasterId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public String getRoasterName() { return roasterName; }
    public void setRoasterName(String roasterName) { this.roasterName = roasterName; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }
    public OffsetDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(OffsetDateTime purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


