package com.roastive.api.domain.roasteryuser.service;

import com.roastive.api.domain.roasteryuser.model.RoasteryUser;
import com.roastive.api.domain.roasteryuser.repository.RoasteryUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RoasteryUserService {
    private final RoasteryUserRepository repository;

    public RoasteryUserService(RoasteryUserRepository repository) { this.repository = repository; }

    public List<RoasteryUser> findAll() { return repository.findAll(); }
    public Optional<RoasteryUser> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public RoasteryUser create(RoasteryUser ru) { return repository.save(ru); }

    @Transactional
    public Optional<RoasteryUser> update(UUID id, RoasteryUser update) {
        return repository.findById(id).map(existing -> {
            existing.setRoasteryId(update.getRoasteryId());
            existing.setUserId(update.getUserId());
            existing.setRoleName(update.getRoleName());
            existing.setStatus(update.getStatus());
            existing.setJoinedAt(update.getJoinedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


