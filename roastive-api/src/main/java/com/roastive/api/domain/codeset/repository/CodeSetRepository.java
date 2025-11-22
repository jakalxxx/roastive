package com.roastive.api.domain.codeset.repository;

import com.roastive.api.domain.codeset.model.CodeSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CodeSetRepository extends JpaRepository<CodeSet, UUID> {
    List<CodeSet> findByCodeTypeOrderBySortAsc(String codeType);
}


