package com.roastive.api.domain.production.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_plan")
public class ProductionPlan {
    @Id
    @Column(name = "plan_id", nullable = false, columnDefinition = "uuid")
    private UUID planId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "plan_date", nullable = false)
    private OffsetDateTime planDate;

    @Column(name = "cutoff_time")
    private OffsetDateTime cutoffTime;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (planId == null) planId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getPlanId() { return planId; }
    public void setPlanId(UUID planId) { this.planId = planId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public OffsetDateTime getPlanDate() { return planDate; }
    public void setPlanDate(OffsetDateTime planDate) { this.planDate = planDate; }
    public OffsetDateTime getCutoffTime() { return cutoffTime; }
    public void setCutoffTime(OffsetDateTime cutoffTime) { this.cutoffTime = cutoffTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


