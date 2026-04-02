package com.roastive.api.domain.customer.service;

import com.roastive.api.domain.customer.model.CustomerRoastery;
import com.roastive.api.domain.customer.repository.CustomerRoasteryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CustomerRoasteryService {
    private final CustomerRoasteryRepository repository;

    public CustomerRoasteryService(CustomerRoasteryRepository repository) { this.repository = repository; }

    public List<CustomerRoastery> findAll() { return repository.findAll(); }

    public List<CustomerRoastery> findByRoasteryId(UUID roasteryId) { return repository.findByRoasteryId(roasteryId); }

    @Transactional
    public CustomerRoastery create(CustomerRoastery mapping) { return repository.save(mapping); }
}






























