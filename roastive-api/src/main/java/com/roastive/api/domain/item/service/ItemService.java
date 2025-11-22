package com.roastive.api.domain.item.service;

import com.roastive.api.domain.item.model.ItemMaster;
import com.roastive.api.domain.item.repository.ItemMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ItemService {
    private final ItemMasterRepository repository;

    public ItemService(ItemMasterRepository repository) { this.repository = repository; }

    public List<ItemMaster> findAll() { return repository.findAll(); }
    public Optional<ItemMaster> findById(UUID id) { return repository.findById(id); }

    @Transactional
    public ItemMaster create(ItemMaster m) { return repository.save(m); }

    @Transactional
    public Optional<ItemMaster> update(UUID id, ItemMaster u) {
        return repository.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setCategory(u.getCategory());
            e.setName(u.getName());
            e.setBaseUnit(u.getBaseUnit());
            e.setDescription(u.getDescription());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return repository.save(e);
        });
    }

    @Transactional
    public void delete(UUID id) { repository.deleteById(id); }
}


