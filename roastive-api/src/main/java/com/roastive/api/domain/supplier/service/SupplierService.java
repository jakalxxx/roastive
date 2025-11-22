package com.roastive.api.domain.supplier.service;

import com.roastive.api.domain.supplier.model.Supplier;
import com.roastive.api.domain.supplier.dto.SupplierDto;
import com.roastive.api.domain.supplier.dto.SupplierRequest;
import com.roastive.api.domain.supplier.service.mapper.SupplierMapper;
import com.roastive.api.domain.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SupplierService {
    private final SupplierRepository repository;
    private final SupplierMapper mapper;

    public SupplierService(SupplierRepository repository, SupplierMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<SupplierDto> findAll() { return repository.findAll().stream().map(mapper::toDto).toList(); }
    public Optional<SupplierDto> findById(UUID id) { return repository.findById(id).map(mapper::toDto); }

    @Transactional
    public SupplierDto create(SupplierRequest req) { return mapper.toDto(repository.save(mapper.toEntity(req))); }

    @Transactional
    public Optional<SupplierDto> update(UUID id, SupplierRequest req) {
        return repository.findById(id).map(e -> {
            mapper.updateEntityFromRequest(req, e);
            return mapper.toDto(repository.save(e));
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


