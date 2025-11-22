package com.roastive.api.domain.customermembership.repository;

import com.roastive.api.domain.customermembership.model.CustomerMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerMembershipRepository extends JpaRepository<CustomerMembership, UUID> {}


