package com.roastive.api.domain.customermembership.service;

import com.roastive.api.domain.customermembership.model.CustomerMembership;
import com.roastive.api.domain.customermembership.repository.CustomerMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CustomerMembershipService {
    private final CustomerMembershipRepository repository;

    public CustomerMembershipService(CustomerMembershipRepository repository) { this.repository = repository; }

    public List<CustomerMembership> findAll() { return repository.findAll(); }
    public Optional<CustomerMembership> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public CustomerMembership create(CustomerMembership cm) { return repository.save(cm); }

    @Transactional
    public Optional<CustomerMembership> update(UUID id, CustomerMembership update) {
        return repository.findById(id).map(existing -> {
            existing.setUserId(update.getUserId());
            existing.setCustomerId(update.getCustomerId());
            existing.setRoleId(update.getRoleId());
            existing.setStatus(update.getStatus());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


