package com.roastive.api.domain.idsequence.repository;

import com.roastive.api.domain.idsequence.model.IdSequence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IdSequenceRepository extends JpaRepository<IdSequence, UUID> {}


