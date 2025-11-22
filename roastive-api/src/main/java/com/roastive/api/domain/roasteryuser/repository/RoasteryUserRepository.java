package com.roastive.api.domain.roasteryuser.repository;

import com.roastive.api.domain.roasteryuser.model.RoasteryUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoasteryUserRepository extends JpaRepository<RoasteryUser, UUID> {
    List<RoasteryUser> findByUserId(UUID userId);
    boolean existsByUserIdAndRoasteryId(UUID userId, UUID roasteryId);
}

