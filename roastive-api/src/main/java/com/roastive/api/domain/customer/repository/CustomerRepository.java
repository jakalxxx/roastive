package com.roastive.api.domain.customer.repository;

import com.roastive.api.domain.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {}


