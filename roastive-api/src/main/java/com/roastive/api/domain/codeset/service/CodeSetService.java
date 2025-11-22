package com.roastive.api.domain.codeset.service;

import com.roastive.api.domain.codeset.model.CodeSet;
import com.roastive.api.domain.codeset.repository.CodeSetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CodeSetService {
    private final CodeSetRepository repository;

    public CodeSetService(CodeSetRepository repository) { this.repository = repository; }

    public List<CodeSet> findAll() { return repository.findAll(); }
    public Optional<CodeSet> findById(UUID id) { return repository.findById(id); }
    public List<CodeSet> findByType(String codeType) { return repository.findByCodeTypeOrderBySortAsc(codeType); }

    @Transactional
    public CodeSet create(CodeSet cs) { return repository.save(cs); }

    @Transactional
    public Optional<CodeSet> update(UUID id, CodeSet update) {
        return repository.findById(id).map(existing -> {
            existing.setCodeType(update.getCodeType());
            existing.setCodeKey(update.getCodeKey());
            existing.setLabel(update.getLabel());
            existing.setSort(update.getSort());
            existing.setActive(update.getActive());
            existing.setMeta(update.getMeta());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


