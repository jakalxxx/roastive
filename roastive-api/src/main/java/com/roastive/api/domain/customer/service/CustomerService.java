package com.roastive.api.domain.customer.service;

import com.roastive.api.domain.customer.model.Customer;
import com.roastive.api.domain.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CustomerService {
    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) { this.repository = repository; }

    public List<Customer> findAll() { return repository.findAll(); }
    public Optional<Customer> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public Customer create(Customer c) { return repository.save(c); }

    @Transactional
    public Optional<Customer> update(UUID id, Customer update) {
        return repository.findById(id).map(existing -> {
            existing.setCustomerName(update.getCustomerName());
            existing.setCode(update.getCode());
            existing.setStatus(update.getStatus());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


