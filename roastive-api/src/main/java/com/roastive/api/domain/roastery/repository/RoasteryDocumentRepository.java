package com.roastive.api.domain.roastery.repository;

import com.roastive.api.domain.roastery.model.RoasteryDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoasteryDocumentRepository extends JpaRepository<RoasteryDocument, UUID> {}
