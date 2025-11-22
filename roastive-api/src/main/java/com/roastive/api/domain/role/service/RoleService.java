package com.roastive.api.domain.role.service;

import com.roastive.api.domain.role.model.Role;
import com.roastive.api.domain.role.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoleService {
    private final RoleRepository repository;

    public RoleService(RoleRepository repository) { this.repository = repository; }

    public List<Role> findAll() { return repository.findAll(); }
    public Optional<Role> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public Role create(Role role) { return repository.save(role); }

    @Transactional
    public Optional<Role> update(UUID id, Role update) {
        return repository.findById(id).map(existing -> {
            existing.setRoleName(update.getRoleName());
            existing.setDescription(update.getDescription());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


