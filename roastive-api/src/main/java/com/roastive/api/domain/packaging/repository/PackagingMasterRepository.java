package com.roastive.api.domain.packaging.repository;

import com.roastive.api.domain.packaging.model.PackagingMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PackagingMasterRepository extends JpaRepository<PackagingMaster, UUID> {}


