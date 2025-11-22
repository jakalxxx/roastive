package com.roastive.api.domain.userrole.service;

import com.roastive.api.domain.userrole.model.UserRole;
import com.roastive.api.domain.userrole.repository.UserRoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserRoleService {
    private final UserRoleRepository repository;

    public UserRoleService(UserRoleRepository repository) { this.repository = repository; }

    public List<UserRole> findAll() { return repository.findAll(); }
    public Optional<UserRole> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public UserRole create(UserRole ur) { return repository.save(ur); }

    @Transactional
    public Optional<UserRole> update(UUID id, UserRole update) {
        return repository.findById(id).map(existing -> {
            existing.setUserId(update.getUserId());
            existing.setRoleId(update.getRoleId());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


