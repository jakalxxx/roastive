package com.roastive.api.domain.customer.repository;

import com.roastive.api.domain.customer.model.CustomerRoastery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRoasteryRepository extends JpaRepository<CustomerRoastery, UUID> {}
