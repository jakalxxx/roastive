package com.roastive.api.domain.userrole.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "user_role")
public class UserRole {
    @Id
    @Column(name = "user_role_id", nullable = false, columnDefinition = "uuid")
    private UUID userRoleId;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "role_id", nullable = false, columnDefinition = "uuid")
    private UUID roleId;

    @PrePersist
    public void prePersist() {
        if (userRoleId == null) userRoleId = UUID.randomUUID();
    }

    public UUID getUserRoleId() { return userRoleId; }
    public void setUserRoleId(UUID userRoleId) { this.userRoleId = userRoleId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getRoleId() { return roleId; }
    public void setRoleId(UUID roleId) { this.roleId = roleId; }
}


