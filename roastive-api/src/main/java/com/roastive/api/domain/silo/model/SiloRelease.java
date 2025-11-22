package com.roastive.api.domain.silo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "silo_release")
public class SiloRelease {
    @Id
    @Column(name = "release_id", nullable = false, columnDefinition = "uuid")
    private UUID releaseId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "silo_id", nullable = false, columnDefinition = "uuid")
    private UUID siloId;

    @Column(name = "production_id", columnDefinition = "uuid")
    private UUID productionId;

    @Column(name = "target_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal targetQty;

    @Column(name = "release_date", nullable = false)
    private OffsetDateTime releaseDate;

    @Column(name = "operator", length = 120)
    private String operator;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (releaseId == null) releaseId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getReleaseId() { return releaseId; }
    public void setReleaseId(UUID releaseId) { this.releaseId = releaseId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public UUID getSiloId() { return siloId; }
    public void setSiloId(UUID siloId) { this.siloId = siloId; }
    public UUID getProductionId() { return productionId; }
    public void setProductionId(UUID productionId) { this.productionId = productionId; }
    public BigDecimal getTargetQty() { return targetQty; }
    public void setTargetQty(BigDecimal targetQty) { this.targetQty = targetQty; }
    public OffsetDateTime getReleaseDate() { return releaseDate; }
    public void setReleaseDate(OffsetDateTime releaseDate) { this.releaseDate = releaseDate; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


