package com.roastive.api.domain.silo.repository;

import com.roastive.api.domain.silo.model.SiloReleaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SiloReleaseDetailRepository extends JpaRepository<SiloReleaseDetail, UUID> {}


