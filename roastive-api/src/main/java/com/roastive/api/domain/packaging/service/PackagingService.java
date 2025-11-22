package com.roastive.api.domain.packaging.service;

import com.roastive.api.domain.packaging.model.PackagingMaster;
import com.roastive.api.domain.packaging.repository.PackagingMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PackagingService {
    private final PackagingMasterRepository repository;

    public PackagingService(PackagingMasterRepository repository) { this.repository = repository; }

    public List<PackagingMaster> findAll() { return repository.findAll(); }
    public Optional<PackagingMaster> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public PackagingMaster create(PackagingMaster m) { return repository.save(m); }

    @Transactional
    public Optional<PackagingMaster> update(UUID id, PackagingMaster u) {
        return repository.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setProductId(u.getProductId());
            e.setUnitSize(u.getUnitSize());
            e.setUnit(u.getUnit());
            e.setDescription(u.getDescription());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return repository.save(e);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


