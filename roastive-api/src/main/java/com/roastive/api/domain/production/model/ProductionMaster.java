package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_master")
public class ProductionMaster {
    @Id
    @Column(name = "production_id", nullable = false, columnDefinition = "uuid")
    private UUID productionId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "batch_id", columnDefinition = "uuid")
    private UUID batchId;

    @Column(name = "product_id", nullable = false, columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "roaster_id", nullable = false, columnDefinition = "uuid")
    private UUID roasterId;

    @Column(name = "production_date", nullable = false)
    private OffsetDateTime productionDate;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "operator", length = 120)
    private String operator;

    @Column(name = "lot_no", length = 80)
    private String lotNo;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (productionId == null) productionId = UUID.randomUUID();
        if (productionDate == null) productionDate = OffsetDateTime.now();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getProductionId() { return productionId; }
    public void setProductionId(UUID productionId) { this.productionId = productionId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getBatchId() { return batchId; }
    public void setBatchId(UUID batchId) { this.batchId = batchId; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public UUID getRoasterId() { return roasterId; }
    public void setRoasterId(UUID roasterId) { this.roasterId = roasterId; }
    public OffsetDateTime getProductionDate() { return productionDate; }
    public void setProductionDate(OffsetDateTime productionDate) { this.productionDate = productionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getLotNo() { return lotNo; }
    public void setLotNo(String lotNo) { this.lotNo = lotNo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


