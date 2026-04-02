package com.roastive.api.domain.roaster.service;

import com.roastive.api.domain.roaster.model.RoasterMaster;
import com.roastive.api.domain.roaster.repository.RoasterMasterRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RoasterService {

    private final RoasterMasterRepository repository;

    public RoasterService(RoasterMasterRepository repository) {
        this.repository = repository;
    }

    public List<RoasterMaster> list(UUID roasteryId) {
        return repository.findByRoasteryId(roasteryId);
    }

    public RoasterMaster create(UUID roasteryId, String roasterName, String manufacturer, String model,
                                String serialNo, String installDate, String status) {
        RoasterMaster entity = new RoasterMaster();
        entity.setRoasteryId(roasteryId);
        entity.setRoasterName(roasterName);
        entity.setManufacturer(manufacturer);
        entity.setModel(model);
        entity.setSerialNo(serialNo);
        entity.setPurchaseDate(parseDateOrNull(installDate));
        entity.setStatus(status != null && !status.isBlank() ? status : "OPERATIONAL");
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());
        return repository.save(entity);
    }

    public Optional<RoasterMaster> update(UUID roasteryId, UUID id, String roasterName, String manufacturer,
                                          String model, String serialNo, String installDate, String status) {
        return repository.findById(id)
                .filter(existing -> roasteryId.equals(existing.getRoasteryId()))
                .map(existing -> {
                    existing.setRoasterName(roasterName);
                    existing.setManufacturer(manufacturer);
                    existing.setModel(model);
                    existing.setSerialNo(serialNo);
                    existing.setPurchaseDate(parseDateOrNull(installDate));
                    if (status != null && !status.isBlank()) {
                        existing.setStatus(status);
                    }
                    existing.setUpdatedAt(OffsetDateTime.now());
                    return repository.save(existing);
                });
    }

    public void delete(UUID roasteryId, UUID id) {
        repository.findById(id)
                .filter(existing -> roasteryId.equals(existing.getRoasteryId()))
                .ifPresent(repository::delete);
    }

    private OffsetDateTime parseDateOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return OffsetDateTime.parse(value.trim());
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }
}







