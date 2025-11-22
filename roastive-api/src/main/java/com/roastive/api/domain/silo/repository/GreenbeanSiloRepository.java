package com.roastive.api.domain.silo.repository;

import com.roastive.api.domain.silo.model.GreenbeanSilo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GreenbeanSiloRepository extends JpaRepository<GreenbeanSilo, UUID> {}


