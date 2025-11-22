package com.roastive.api.domain.silo.repository;

import com.roastive.api.domain.silo.model.SiloRelease;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SiloReleaseRepository extends JpaRepository<SiloRelease, UUID> {}


