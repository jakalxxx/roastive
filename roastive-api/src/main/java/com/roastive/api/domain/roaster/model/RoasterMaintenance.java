package com.roastive.api.domain.roaster.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roaster_maintenance")
public class RoasterMaintenance {
    @Id
    @Column(name = "maintenance_id", nullable = false, columnDefinition = "uuid")
    private UUID maintenanceId;

    @Column(name = "roaster_id", nullable = false, columnDefinition = "uuid")
    private UUID roasterId;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "type", length = 60)
    private String type;

    @Column(name = "description")
    private String description;

    @Column(name = "cost", precision = 18, scale = 4)
    private BigDecimal cost;

    @Column(name = "operator", length = 120)
    private String operator;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (maintenanceId == null) maintenanceId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getMaintenanceId() { return maintenanceId; }
    public void setMaintenanceId(UUID maintenanceId) { this.maintenanceId = maintenanceId; }
    public UUID getRoasterId() { return roasterId; }
    public void setRoasterId(UUID roasterId) { this.roasterId = roasterId; }
    public OffsetDateTime getStartTime() { return startTime; }
    public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
    public OffsetDateTime getEndTime() { return endTime; }
    public void setEndTime(OffsetDateTime endTime) { this.endTime = endTime; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}


