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
        applyDefaults(request);
        Roastery r = mapper.toEntity(request);
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return repository.save(r);
    }

    @Transactional
    public Optional<Roastery> update(UUID id, RoasteryRequestDto request) {
        return repository.findById(id).map(existing -> {
            if (request.getCode() == null || request.getCode().isBlank()) {
                request.setCode(existing.getCode());
            }
            mapper.updateEntityFromDto(request, existing);
            existing.setUpdatedAt(OffsetDateTime.now());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private void applyDefaults(RoasteryRequestDto request) {
        if (request.getRoasteryName() != null) {
            request.setRoasteryName(request.getRoasteryName().trim());
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            request.setCode(generateCode());
        } else {
            request.setCode(normalizeCode(request.getCode()));
        }
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("ACTIVE");
        } else {
            request.setStatus(request.getStatus().trim().toUpperCase());
        }
        if (request.getBusinessRegNo() != null) {
            request.setBusinessRegNo(request.getBusinessRegNo().replaceAll("\\D+", ""));
        }
    }

    private String generateCode() {
        long start = repository.count() + 1;
        long attempt = start;

        // Try sequentially first
        for (int i = 0; i < 1000; i++, attempt++) {
            String candidate = String.format("RST-%05d", attempt);
            if (!repository.existsByCode(candidate)) {
                return candidate;
            }
        }

        // Fallback: random within range to avoid infinite loop
        for (int i = 0; i < 500; i++) {
            int rnd = (int) (Math.random() * 100000);
            String candidate = String.format("RST-%05d", rnd);
            if (!repository.existsByCode(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Failed to generate unique roastery code");
    }

    private String normalizeCode(String value) {
        if (value == null) return "";
        String normalized = value.toUpperCase().replaceAll("[^A-Z0-9]", "");
        return normalized.isBlank() ? "" : normalized;
    }
}


