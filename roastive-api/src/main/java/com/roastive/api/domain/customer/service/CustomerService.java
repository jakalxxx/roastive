package com.roastive.api.domain.customer.service;

import com.roastive.api.domain.customer.dto.CustomerDetailDto;
import com.roastive.api.domain.customer.model.Customer;
import com.roastive.api.domain.customer.model.CustomerRoastery;
import com.roastive.api.domain.customer.repository.CustomerRepository;
import com.roastive.api.domain.customer.repository.CustomerRoasteryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CustomerService {
    private final CustomerRepository repository;
    private final CustomerRoasteryRepository customerRoasteryRepository;

    public CustomerService(CustomerRepository repository, CustomerRoasteryRepository customerRoasteryRepository) {
        this.repository = repository;
        this.customerRoasteryRepository = customerRoasteryRepository;
    }

    public List<Customer> findAll() { return repository.findAll(); }
    public List<Customer> findByRoasteryId(@NonNull UUID roasteryId) { return repository.findAllByRoasteryId(roasteryId); }
    public Optional<Customer> findById(@NonNull UUID id) { return repository.findById(id); }
    public Optional<CustomerDetailDto> findDetail(@NonNull UUID customerId, UUID roasteryId) {
        if (roasteryId == null) return Optional.empty();
        return repository.findById(customerId).flatMap(customer ->
                customerRoasteryRepository.findByCustomerIdAndRoasteryId(customerId, roasteryId)
                        .map(mapping -> {
                            CustomerDetailDto dto = new CustomerDetailDto();
                            dto.setCustomer(customer);
                            CustomerDetailDto.RoasteryLink link = new CustomerDetailDto.RoasteryLink();
                            link.setRoasteryId(mapping.getRoasteryId());
                            link.setStatus(mapping.getStatus());
                            link.setRequestedAt(mapping.getRequestedAt());
                            link.setApprovedAt(mapping.getApprovedAt());
                            dto.setRoastery(link);
                            return dto;
                        })
        );
    }

    @Transactional
    public Customer create(@NonNull Customer c, UUID roasteryId) {
        UUID safeRoasteryId = Objects.requireNonNull(roasteryId, "로스터리 정보가 필요합니다.");
        Customer saved = repository.save(c);
        UUID customerId = Objects.requireNonNull(saved.getCustomerId(), "고객 ID 생성에 실패했습니다.");
        CustomerRoastery mapping = new CustomerRoastery();
        mapping.setCustomerId(customerId);
        mapping.setRoasteryId(safeRoasteryId);
        mapping.setStatus(c.getStatus());
        try {
            customerRoasteryRepository.save(mapping);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("고객사-로스터리 매핑 생성에 실패했습니다.", ex);
        }
        return saved;
    }

    @Transactional
    public Optional<Customer> update(@NonNull UUID id, @NonNull Customer update) {
        return repository.findById(id).map(existing -> {
            existing.setCustomerName(update.getCustomerName());
            existing.setCode(update.getCode());
            existing.setStatus(update.getStatus());
            existing.setUpdatedAt(update.getUpdatedAt());
            return repository.save(existing);
        });
    }

    @Transactional
    public void delete(@NonNull UUID id) { repository.deleteById(id); }

    public long countNewActiveCustomers(@NonNull UUID roasteryId, java.time.OffsetDateTime start, java.time.OffsetDateTime end) {
        return repository.countNewActiveCustomers(roasteryId, start, end);
    }
}


