package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateContactRequest;
import com.roastive.api.domain.roastery.dto.RoasteryContactDto;
import com.roastive.api.domain.roastery.model.RoasteryContact;
import com.roastive.api.domain.roastery.repository.RoasteryContactRepository;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roastery.service.mapper.RoasteryContactMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoasteryContactService {
    private final RoasteryRepository roasteryRepository;
    private final RoasteryContactRepository contactRepository;
    private final RoasteryContactMapper mapper;

    public RoasteryContactService(RoasteryRepository roasteryRepository,
                                  RoasteryContactRepository contactRepository,
                                  RoasteryContactMapper mapper) {
        this.roasteryRepository = roasteryRepository;
        this.contactRepository = contactRepository;
        this.mapper = mapper;
    }

    private Optional<UUID> resolveRoasteryId(UUID roasteryId) {
        if (roasteryId != null) return Optional.of(roasteryId);
        return roasteryRepository.findAll().stream().findFirst().map(r -> r.getRoasteryId());
    }

    public List<RoasteryContactDto> list(UUID roasteryId) {
        Optional<UUID> rid = resolveRoasteryId(roasteryId);
        if (rid.isEmpty()) return List.of();
        return contactRepository.findByRoasteryIdOrderByCreatedAtDesc(rid.get()).stream()
                .map(mapper::toDto)
                .toList();
    }

    public RoasteryContactDto create(UUID roasteryId, CreateOrUpdateContactRequest req) {
        UUID rid = resolveRoasteryId(roasteryId).orElseThrow(() -> new IllegalArgumentException("No roastery"));
        RoasteryContact c = new RoasteryContact();
        c.setContactId(UUID.randomUUID());
        c.setRoasteryId(rid);
        c.setContactName(req.getContactName());
        c.setPosition(req.getPosition());
        c.setPhone(req.getPhone());
        c.setEmail(req.getEmail());
        c.setPrimary(Boolean.TRUE.equals(req.getIsPrimary()));
        c.setCreatedAt(OffsetDateTime.now());
        return mapper.toDto(contactRepository.save(c));
    }

    public Optional<RoasteryContactDto> update(UUID id, CreateOrUpdateContactRequest req) {
        return contactRepository.findById(id).map(c -> {
            if (req.getContactName() != null) c.setContactName(req.getContactName());
            if (req.getPosition() != null) c.setPosition(req.getPosition());
            if (req.getPhone() != null) c.setPhone(req.getPhone());
            if (req.getEmail() != null) c.setEmail(req.getEmail());
            if (req.getIsPrimary() != null) c.setPrimary(Boolean.TRUE.equals(req.getIsPrimary()));
            return mapper.toDto(contactRepository.save(c));
        });
    }

    public void delete(UUID id) {
        contactRepository.deleteById(id);
    }
}


