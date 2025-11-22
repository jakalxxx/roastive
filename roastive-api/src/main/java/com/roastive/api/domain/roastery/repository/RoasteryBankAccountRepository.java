package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryBankAccountRepository extends JpaRepository<RoasteryBankAccount, UUID> {}
