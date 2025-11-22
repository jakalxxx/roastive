package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roasteryuser.model.RoasteryUser;
import com.roastive.api.domain.roasteryuser.repository.RoasteryUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class RoasterySettingsService {
    private final RoasteryRepository roasteryRepository;
    private final RoasteryUserRepository roasteryUserRepository;

    public RoasterySettingsService(RoasteryRepository roasteryRepository, RoasteryUserRepository roasteryUserRepository) {
        this.roasteryRepository = roasteryRepository;
        this.roasteryUserRepository = roasteryUserRepository;
    }

    private Optional<Roastery> resolveRoastery(UUID roasteryId) {
        if (roasteryId != null) return roasteryRepository.findById(roasteryId);
        List<Roastery> all = roasteryRepository.findAll();
        return all.isEmpty() ? Optional.empty() : Optional.of(all.get(0));
    }

    public Optional<Map<String, Object>> getSettings(UUID roasteryId) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) return Optional.empty();
        Roastery r = ro.get();
        Map<String, Object> data = new HashMap<>();
        data.put("legal_name", r.getLegalName());
        data.put("representative_name", r.getRepresentativeName());
        data.put("brand_name", r.getBrandName());
        data.put("business_reg_no", r.getBusinessRegNo());
        data.put("phone", r.getPhone());
        data.put("email", r.getEmail());
        data.put("website", r.getWebsite());
        data.put("timezone", r.getTimezone());
        data.put("base_currency", r.getBaseCurrency());
        data.put("default_unit", r.getDefaultUnit());
        data.put("status", r.getStatus());
        return Optional.of(data);
    }

    @Transactional
    public Map<String, Object> updateSettings(UUID roasteryId, Map<String, Object> body) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) return Map.of();
        Roastery r = ro.get();
        if (body.containsKey("representative_name")) r.setRepresentativeName((String) body.get("representative_name"));
        if (body.containsKey("brand_name")) r.setBrandName((String) body.get("brand_name"));
        if (body.containsKey("phone")) r.setPhone((String) body.get("phone"));
        if (body.containsKey("email")) r.setEmail((String) body.get("email"));
        if (body.containsKey("website")) r.setWebsite((String) body.get("website"));
        if (body.containsKey("timezone")) r.setTimezone((String) body.get("timezone"));
        if (body.containsKey("base_currency")) r.setBaseCurrency((String) body.get("base_currency"));
        if (body.containsKey("default_unit")) r.setDefaultUnit((String) body.get("default_unit"));
        r.setUpdatedAt(OffsetDateTime.now());
        roasteryRepository.save(r);
        return body;
    }

    @Transactional
    public UUID initRoastery(String userId, Map<String, Object> body) {
        Roastery r = new Roastery();
        r.setRoasteryId(UUID.randomUUID());
        r.setRoasteryName(String.valueOf(body.getOrDefault("brand_name", "Default Roastery")));
        r.setCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        r.setStatus(String.valueOf(body.getOrDefault("status", "ACTIVE")));
        r.setLegalName((String) body.getOrDefault("legal_name", null));
        r.setRepresentativeName((String) body.getOrDefault("representative_name", null));
        r.setBrandName((String) body.getOrDefault("brand_name", null));
        r.setBusinessRegNo((String) body.getOrDefault("business_reg_no", null));
        r.setPhone((String) body.getOrDefault("phone", null));
        r.setEmail((String) body.getOrDefault("email", null));
        r.setWebsite((String) body.getOrDefault("website", null));
        r.setTimezone((String) body.getOrDefault("timezone", "Asia/Seoul"));
        r.setBaseCurrency((String) body.getOrDefault("base_currency", "KRW"));
        r.setDefaultUnit((String) body.getOrDefault("default_unit", "KG"));
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        Roastery saved = roasteryRepository.save(r);

        if (userId != null && !userId.isBlank()) {
            try {
                UUID uid = UUID.fromString(userId);
                if (!roasteryUserRepository.existsByUserIdAndRoasteryId(uid, saved.getRoasteryId())) {
                    RoasteryUser link = new RoasteryUser();
                    link.setRoasteryId(saved.getRoasteryId());
                    link.setUserId(uid);
                    link.setRoleName("OWNER");
                    link.setStatus("ACTIVE");
                    roasteryUserRepository.save(link);
                }
            } catch (IllegalArgumentException ignored) {}
        }

        return saved.getRoasteryId();
    }
}


