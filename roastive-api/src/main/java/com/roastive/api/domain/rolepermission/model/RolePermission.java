package com.roastive.api.domain.rolepermission.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "role_permission")
public class RolePermission {
    @Id
    @Column(name = "permission_id", nullable = false, columnDefinition = "uuid")
    private UUID permissionId;

    @Column(name = "role_id", nullable = false, columnDefinition = "uuid")
    private UUID roleId;

    @Column(name = "module", nullable = false, length = 64)
    private String module;

    @Column(name = "action", nullable = false, length = 32)
    private String action;

    @PrePersist
    public void prePersist() {
        if (permissionId == null) permissionId = UUID.randomUUID();
    }

    public UUID getPermissionId() { return permissionId; }
    public void setPermissionId(UUID permissionId) { this.permissionId = permissionId; }
    public UUID getRoleId() { return roleId; }
    public void setRoleId(UUID roleId) { this.roleId = roleId; }
    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}


