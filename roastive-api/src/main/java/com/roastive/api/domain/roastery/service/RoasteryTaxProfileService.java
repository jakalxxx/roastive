package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateTaxProfileRequest;
import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.model.RoasteryTaxProfile;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roastery.repository.RoasteryTaxProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoasteryTaxProfileService {
    private final RoasteryRepository roasteryRepository;
    private final RoasteryTaxProfileRepository taxProfileRepository;

    public RoasteryTaxProfileService(RoasteryRepository roasteryRepository,
                                     RoasteryTaxProfileRepository taxProfileRepository) {
        this.roasteryRepository = roasteryRepository;
        this.taxProfileRepository = taxProfileRepository;
    }

    private Roastery resolveRoastery(UUID roasteryId) {
        if (roasteryId == null) throw new IllegalArgumentException("로스터리 정보가 필요합니다.");
        return roasteryRepository.findById(roasteryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 로스터리입니다."));
    }

    public Optional<RoasteryTaxProfile> get(UUID roasteryId) {
        Roastery roastery = resolveRoastery(roasteryId);
        return taxProfileRepository.findFirstByRoasteryIdOrderByCreatedAtDesc(roastery.getRoasteryId());
    }

    @Transactional
    public RoasteryTaxProfile upsert(UUID roasteryId, CreateOrUpdateTaxProfileRequest req) {
        Roastery roastery = resolveRoastery(roasteryId);
        return taxProfileRepository.findFirstByRoasteryIdOrderByCreatedAtDesc(roastery.getRoasteryId())
                .map(existing -> apply(existing, req))
                .map(taxProfileRepository::save)
                .orElseGet(() -> {
                    RoasteryTaxProfile profile = new RoasteryTaxProfile();
                    profile.setTaxProfileId(UUID.randomUUID());
                    profile.setRoasteryId(roastery.getRoasteryId());
                    profile.setCreatedAt(OffsetDateTime.now());
                    return taxProfileRepository.save(apply(profile, req));
                });
    }

    @Transactional
    public Optional<RoasteryTaxProfile> update(UUID roasteryId, UUID taxProfileId, CreateOrUpdateTaxProfileRequest req) {
        Roastery roastery = resolveRoastery(roasteryId);
        return taxProfileRepository.findByTaxProfileIdAndRoasteryId(taxProfileId, roastery.getRoasteryId())
                .map(existing -> taxProfileRepository.save(apply(existing, req)));
    }

    private RoasteryTaxProfile apply(RoasteryTaxProfile profile, CreateOrUpdateTaxProfileRequest req) {
        profile.setVatNo(req.getVatNo());
        profile.setTaxType(req.getTaxType());
        profile.setInvoiceEmission(req.getInvoiceEmission());
        profile.setInvoiceEmail(req.getInvoiceEmail());
        profile.setRemarks(req.getRemarks());
        return profile;
    }
}
















