package com.roastive.api.domain.roasteryuser.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roastery_user")
public class RoasteryUser {
    @Id
    @Column(name = "roastery_user_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryUserId;

    @Column(name = "roastery_id", nullable = false, columnDefinition = "uuid")
    private UUID roasteryId;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "role_name", nullable = false, length = 64)
    private String roleName;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        if (roasteryUserId == null) roasteryUserId = UUID.randomUUID();
        if (joinedAt == null) joinedAt = OffsetDateTime.now();
    }

    public UUID getRoasteryUserId() { return roasteryUserId; }
    public void setRoasteryUserId(UUID roasteryUserId) { this.roasteryUserId = roasteryUserId; }
    public UUID getRoasteryId() { return roasteryId; }
    public void setRoasteryId(UUID roasteryId) { this.roasteryId = roasteryId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(OffsetDateTime joinedAt) { this.joinedAt = joinedAt; }
}


