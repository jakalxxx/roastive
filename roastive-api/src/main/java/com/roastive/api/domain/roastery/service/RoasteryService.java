package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.roastery.dto.RoasteryRequestDto;
import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roastery.service.mapper.RoasteryMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoasteryService {
    private final RoasteryRepository repository;
    private final RoasteryMapper mapper;

    public RoasteryService(RoasteryRepository repository, RoasteryMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<Roastery> findAll() {
        return repository.findAll();
    }

    public Optional<Roastery> findById(UUID id) {
        return repository.findById(id);
    }

    @Transactional
    public Roastery create(RoasteryRequestDto request) {
        Roastery r = mapper.toEntity(request);
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return repository.save(r);
    }

    @Transactional
    public Optional<Roastery> update(UUID id, RoasteryRequestDto request) {
        return repository.findById(id).map(existing -> {
            mapper.updateEntityFromDto(request, existing);
            existing.setUpdatedAt(OffsetDateTime.now());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}


