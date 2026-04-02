package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoasteryBankAccountRepository extends JpaRepository<RoasteryBankAccount, UUID> {
    List<RoasteryBankAccount> findByRoasteryIdOrderByCreatedAtDesc(UUID roasteryId);
    Optional<RoasteryBankAccount> findByBankIdAndRoasteryId(UUID bankId, UUID roasteryId);
    void deleteByBankIdAndRoasteryId(UUID bankId, UUID roasteryId);
}
