package com.roastive.api.domain.customer.repository;

import com.roastive.api.domain.customer.model.CustomerRoastery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRoasteryRepository extends JpaRepository<CustomerRoastery, UUID> {
    List<CustomerRoastery> findByRoasteryId(UUID roasteryId);
    Optional<CustomerRoastery> findByCustomerIdAndRoasteryId(UUID customerId, UUID roasteryId);
}
