package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_input")
public class ProductionInput {
    @Id
    @Column(name = "input_id", nullable = false, columnDefinition = "uuid")
    private UUID inputId;

    @Column(name = "production_id", nullable = false, columnDefinition = "uuid")
    private UUID productionId;

    @Column(name = "release_detail_id", nullable = false, columnDefinition = "uuid")
    private UUID releaseDetailId;

    @Column(name = "lot_no", nullable = false, length = 80)
    private String lotNo;

    @Column(name = "input_quantity", precision = 18, scale = 4, nullable = false)
    private BigDecimal inputQuantity;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (inputId == null) inputId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getInputId() { return inputId; }
    public void setInputId(UUID inputId) { this.inputId = inputId; }
    public UUID getProductionId() { return productionId; }
    public void setProductionId(UUID productionId) { this.productionId = productionId; }
    public UUID getReleaseDetailId() { return releaseDetailId; }
    public void setReleaseDetailId(UUID releaseDetailId) { this.releaseDetailId = releaseDetailId; }
    public String getLotNo() { return lotNo; }
    public void setLotNo(String lotNo) { this.lotNo = lotNo; }
    public BigDecimal getInputQuantity() { return inputQuantity; }
    public void setInputQuantity(BigDecimal inputQuantity) { this.inputQuantity = inputQuantity; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


