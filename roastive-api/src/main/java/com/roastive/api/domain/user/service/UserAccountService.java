package com.roastive.api.domain.user.service;

import com.roastive.api.domain.user.model.UserAccount;
import com.roastive.api.domain.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserAccountService {
    private final UserAccountRepository repository;

    public UserAccountService(UserAccountRepository repository) {
        this.repository = repository;
    }

    public List<UserAccount> findAll() { return repository.findAll(); }
    public Optional<UserAccount> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public UserAccount create(UserAccount user) { return repository.save(user); }

    @Transactional
    public Optional<UserAccount> update(UUID id, UserAccount update) {
        return repository.findById(id).map(existing -> {
            existing.setEmail(update.getEmail());
            existing.setPasswordHash(update.getPasswordHash());
            existing.setDisplayName(update.getDisplayName());
            existing.setStatus(update.getStatus());
            existing.setLastLoginAt(update.getLastLoginAt());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


