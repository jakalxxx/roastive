package com.roastive.api.domain.rolepermission.service;

import com.roastive.api.domain.rolepermission.model.RolePermission;
import com.roastive.api.domain.rolepermission.repository.RolePermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RolePermissionService {
    private final RolePermissionRepository repository;

    public RolePermissionService(RolePermissionRepository repository) { this.repository = repository; }

    public List<RolePermission> findAll() { return repository.findAll(); }
    public Optional<RolePermission> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public RolePermission create(RolePermission rp) { return repository.save(rp); }

    @Transactional
    public Optional<RolePermission> update(UUID id, RolePermission update) {
        return repository.findById(id).map(existing -> {
            existing.setRoleId(update.getRoleId());
            existing.setModule(update.getModule());
            existing.setAction(update.getAction());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


