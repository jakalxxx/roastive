package com.roastive.api.domain.userrole.repository;

import com.roastive.api.domain.userrole.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {}


