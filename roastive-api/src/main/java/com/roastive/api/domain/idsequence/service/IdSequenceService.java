package com.roastive.api.domain.idsequence.service;

import com.roastive.api.domain.idsequence.model.IdSequence;
import com.roastive.api.domain.idsequence.repository.IdSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class IdSequenceService {
    private final IdSequenceRepository repository;

    public IdSequenceService(IdSequenceRepository repository) { this.repository = repository; }

    public List<IdSequence> findAll() { return repository.findAll(); }
    public Optional<IdSequence> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public IdSequence create(IdSequence seq) { return repository.save(seq); }

    @Transactional
    public Optional<IdSequence> update(UUID id, IdSequence update) {
        return repository.findById(id).map(existing -> {
            existing.setLastValue(update.getLastValue());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


