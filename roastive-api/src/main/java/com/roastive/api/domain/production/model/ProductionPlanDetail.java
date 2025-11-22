package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_plan_detail")
public class ProductionPlanDetail {
    @Id
    @Column(name = "plan_detail_id", nullable = false, columnDefinition = "uuid")
    private UUID planDetailId;

    @Column(name = "plan_id", nullable = false, columnDefinition = "uuid")
    private UUID planId;

    @Column(name = "product_id", nullable = false, columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "total_quantity", precision = 18, scale = 4, nullable = false)
    private BigDecimal totalQuantity;

    @Column(name = "required_input", precision = 18, scale = 4, nullable = false)
    private BigDecimal requiredInput;

    @Column(name = "unit", length = 16, nullable = false)
    private String unit;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (planDetailId == null) planDetailId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getPlanDetailId() { return planDetailId; }
    public void setPlanDetailId(UUID planDetailId) { this.planDetailId = planDetailId; }
    public UUID getPlanId() { return planId; }
    public void setPlanId(UUID planId) { this.planId = planId; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public BigDecimal getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(BigDecimal totalQuantity) { this.totalQuantity = totalQuantity; }
    public BigDecimal getRequiredInput() { return requiredInput; }
    public void setRequiredInput(BigDecimal requiredInput) { this.requiredInput = requiredInput; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


