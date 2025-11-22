package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_batch")
public class ProductionBatch {
    @Id
    @Column(name = "batch_id", nullable = false, columnDefinition = "uuid")
    private UUID batchId;

    @Column(name = "plan_detail_id", nullable = false, columnDefinition = "uuid")
    private UUID planDetailId;

    @Column(name = "roaster_id", nullable = false, columnDefinition = "uuid")
    private UUID roasterId;

    @Column(name = "profile_id", columnDefinition = "uuid")
    private UUID profileId;

    @Column(name = "input_quantity", precision = 18, scale = 4, nullable = false)
    private BigDecimal inputQuantity;

    @Column(name = "expected_output", precision = 18, scale = 4, nullable = false)
    private BigDecimal expectedOutput;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (batchId == null) batchId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getBatchId() { return batchId; }
    public void setBatchId(UUID batchId) { this.batchId = batchId; }
    public UUID getPlanDetailId() { return planDetailId; }
    public void setPlanDetailId(UUID planDetailId) { this.planDetailId = planDetailId; }
    public UUID getRoasterId() { return roasterId; }
    public void setRoasterId(UUID roasterId) { this.roasterId = roasterId; }
    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public BigDecimal getInputQuantity() { return inputQuantity; }
    public void setInputQuantity(BigDecimal inputQuantity) { this.inputQuantity = inputQuantity; }
    public BigDecimal getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(BigDecimal expectedOutput) { this.expectedOutput = expectedOutput; }
    public Integer getSequenceNo() { return sequenceNo; }
    public void setSequenceNo(Integer sequenceNo) { this.sequenceNo = sequenceNo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


