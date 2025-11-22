package com.roastive.api.domain.rolepermission.repository;

import com.roastive.api.domain.rolepermission.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {}


