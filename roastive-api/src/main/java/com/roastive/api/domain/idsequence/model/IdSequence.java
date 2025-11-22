package com.roastive.api.domain.idsequence.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "id_sequence")
public class IdSequence {
    @Id
    @Column(name = "name", nullable = false, columnDefinition = "uuid")
    private UUID name;

    @Column(name = "last_value", nullable = false)
    private Long lastValue;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (name == null) name = UUID.randomUUID();
        if (lastValue == null) lastValue = 0L;
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    public UUID getName() { return name; }
    public void setName(UUID name) { this.name = name; }
    public Long getLastValue() { return lastValue; }
    public void setLastValue(Long lastValue) { this.lastValue = lastValue; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


