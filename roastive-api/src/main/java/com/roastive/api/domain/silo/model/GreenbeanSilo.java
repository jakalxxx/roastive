package com.roastive.api.domain.silo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "greenbean_silo")
public class GreenbeanSilo {
    @Id
    @Column(name = "silo_id", nullable = false, columnDefinition = "uuid")
    private UUID siloId;

    @Column(name = "roastery_id", nullable = false)
    private Long roasteryId;

    @Column(name = "silo_name", nullable = false, length = 120)
    private String siloName;

    @Column(name = "capacity", precision = 18, scale = 3)
    private BigDecimal capacity;

    @Column(name = "location", length = 160)
    private String location;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (siloId == null) siloId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    public UUID getSiloId() { return siloId; }
    public void setSiloId(UUID siloId) { this.siloId = siloId; }
    public Long getRoasteryId() { return roasteryId; }
    public void setRoasteryId(Long roasteryId) { this.roasteryId = roasteryId; }
    public String getSiloName() { return siloName; }
    public void setSiloName(String siloName) { this.siloName = siloName; }
    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


