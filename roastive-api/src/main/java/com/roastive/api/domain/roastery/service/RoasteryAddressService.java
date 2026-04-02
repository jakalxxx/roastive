package com.roastive.api.domain.roastery.service;

import com.roastive.api.domain.codeset.repository.CodeSetRepository;
import com.roastive.api.domain.roastery.dto.CreateOrUpdateAddressRequest;
import com.roastive.api.domain.roastery.dto.RoasteryAddressDto;
import com.roastive.api.domain.roastery.model.Roastery;
import com.roastive.api.domain.roastery.model.RoasteryAddress;
import com.roastive.api.domain.roastery.model.RoasterySite;
import com.roastive.api.domain.roastery.repository.RoasteryAddressRepository;
import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import com.roastive.api.domain.roastery.repository.RoasterySiteRepository;
import com.roastive.api.domain.roastery.service.mapper.RoasteryAddressMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class RoasteryAddressService {
    private final RoasteryRepository roasteryRepository;
    private final RoasteryAddressRepository addressRepository;
    private final RoasterySiteRepository siteRepository;
    private final CodeSetRepository codeSetRepository;
    private final RoasteryAddressMapper addressMapper;

    public RoasteryAddressService(RoasteryRepository roasteryRepository,
                                  RoasteryAddressRepository addressRepository,
                                  RoasterySiteRepository siteRepository,
                                  CodeSetRepository codeSetRepository,
                                  RoasteryAddressMapper addressMapper) {
        this.roasteryRepository = roasteryRepository;
        this.addressRepository = addressRepository;
        this.siteRepository = siteRepository;
        this.codeSetRepository = codeSetRepository;
        this.addressMapper = addressMapper;
    }

    private Optional<Roastery> resolveRoastery(UUID roasteryId) {
        if (roasteryId != null) return roasteryRepository.findById(roasteryId);
        List<Roastery> all = roasteryRepository.findAll();
        return all.isEmpty() ? Optional.empty() : Optional.of(all.get(0));
    }

    private String labelForType(String type) {
        return codeSetRepository.findByCodeTypeOrderBySortAsc("ADDRESS_TYPE")
                .stream().filter(cs -> Objects.equals(cs.getCodeKey(), type))
                .map(cs -> cs.getLabel()).findFirst().orElse(type);
    }

    private RoasteryAddressDto toDto(RoasteryAddress a) {
        RoasteryAddressDto dto = addressMapper.toDto(a);
        dto.setAddressTypeLabel(labelForType(a.getAddressType()));
        if (dto.getBranchSeqNo() == null) {
            siteRepository.findByAddressId(a.getAddressId())
                    .ifPresent(site -> dto.setBranchSeqNo(site.getBranchSeqNo()));
        }
        return dto;
    }

    public List<RoasteryAddressDto> list(UUID roasteryId) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) return List.of();
        Roastery r = ro.get();
        return addressRepository.findByRoasteryIdOrderByCreatedAtDesc(r.getRoasteryId())
                .stream().map(this::toDto).toList();
    }

    public Optional<RoasteryAddressDto> getHeadquarters(UUID roasteryId) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) return Optional.empty();
        Roastery r = ro.get();
        RoasteryAddress a = addressRepository.findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(r.getRoasteryId(), "HEADQUARTERS");
        return Optional.ofNullable(a).map(this::toDto);
    }

    public RoasteryAddressDto createOrUpsert(UUID roasteryId, CreateOrUpdateAddressRequest req) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) throw new IllegalArgumentException("No roastery");
        Roastery r = ro.get();
        String type = req.getAddressType();
        String postal = Optional.ofNullable(req.getPostalCode()).orElse("").trim();
        String addr1 = Optional.ofNullable(req.getAddressLine1()).orElse("").trim();
        String addr2 = Optional.ofNullable(req.getAddressLine2()).orElse("").trim();
        if (type == null || type.isBlank()) throw new IllegalArgumentException("address_type required");
        if (postal.isBlank() || addr1.isBlank()) throw new IllegalArgumentException("postal_code/address_line1 required");

        if ("HEADQUARTERS".equalsIgnoreCase(type)) {
            RoasteryAddress existing = addressRepository.findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(r.getRoasteryId(), "HEADQUARTERS");
            if (existing != null) {
                existing.setPostalCode(postal);
                existing.setAddressLine1(addr1);
                existing.setAddressLine2(addr2.isBlank() ? null : addr2);
                existing.setCity(req.getCity());
                existing.setState(req.getState());
                existing.setCountry(Optional.ofNullable(req.getCountry()).orElse("KR"));
                existing.setDefault(true);
                existing.setBranchSeqNo("0000");
                RoasteryAddress saved = addressRepository.save(existing);
                return toDto(saved);
            }
        }

        RoasteryAddress addr = new RoasteryAddress();
        addr.setAddressId(UUID.randomUUID());
        addr.setRoasteryId(r.getRoasteryId());
        addr.setAddressType(type);
        addr.setPostalCode(postal);
        addr.setAddressLine1(addr1);
        addr.setAddressLine2(addr2.isBlank() ? null : addr2);
        addr.setCity(req.getCity());
        addr.setState(req.getState());
        addr.setCountry(Optional.ofNullable(req.getCountry()).orElse("KR"));
        boolean isHQ = "HEADQUARTERS".equalsIgnoreCase(type);
        addr.setDefault(isHQ);
        addr.setCreatedAt(OffsetDateTime.now());
        String branchSeqNo = "0000";
        if (!isHQ) {
            String userSeq = Optional.ofNullable(req.getBranchSeqNo()).orElse("").trim();
            if (!userSeq.matches("^[0-9]{4}$")) {
                throw new IllegalArgumentException("종사업장 번호는 숫자 4자리여야 합니다.");
            }
            if (siteRepository.existsByRoasteryIdAndBranchSeqNo(r.getRoasteryId(), userSeq)) {
                throw new IllegalArgumentException("이미 사용 중인 종사업장 번호입니다.");
            }
            branchSeqNo = userSeq;
        }
        addr.setBranchSeqNo(branchSeqNo);
        RoasteryAddress saved = addressRepository.save(addr);

        RoasterySite site = new RoasterySite();
        site.setSiteId(UUID.randomUUID());
        site.setRoasteryId(r.getRoasteryId());
        String siteCode = (type + "-" + UUID.randomUUID().toString().substring(0, 6)).toUpperCase();
        String siteName = isHQ
                ? Optional.ofNullable(r.getLegalName()).filter(s -> !s.isBlank()).orElse("본점")
                : Optional.ofNullable(req.getSiteName()).filter(s -> !s.isBlank()).orElse("사업장");
        String siteType = Optional.ofNullable(req.getSiteType()).orElse("OFFICE");
        site.setSiteCode(siteCode);
        site.setSiteName(siteName);
        site.setType(siteType);
        site.setDefault(isHQ);
        site.setAddressId(saved.getAddressId());
        site.setStatus("ACTIVE");
        site.setCreatedAt(OffsetDateTime.now());
        site.setBranchSeqNo(branchSeqNo);
        siteRepository.save(site);

        return toDto(saved);
    }

    // no auto generator anymore; user-provided for non-HQ

    public Optional<RoasteryAddressDto> update(UUID roasteryId, UUID id, CreateOrUpdateAddressRequest req) {
        Optional<Roastery> ro = resolveRoastery(roasteryId);
        if (ro.isEmpty()) return Optional.empty();
        return addressRepository.findById(id).map(a -> {
            if (req.getAddressType() != null && !req.getAddressType().isBlank()) {
                String newType = req.getAddressType();
                if ("HEADQUARTERS".equalsIgnoreCase(newType)) {
                    Roastery r = ro.get();
                    RoasteryAddress existing = addressRepository.findFirstByRoasteryIdAndAddressTypeOrderByCreatedAtDesc(r.getRoasteryId(), "HEADQUARTERS");
                    if (existing != null && !Objects.equals(existing.getAddressId(), a.getAddressId())) {
                        throw new IllegalArgumentException("본점(HEADQUARTERS) 주소는 하나만 등록할 수 있습니다.");
                    }
                }
                a.setAddressType(newType);
            }
            if (req.getPostalCode() != null) a.setPostalCode(req.getPostalCode());
            if (req.getAddressLine1() != null) a.setAddressLine1(req.getAddressLine1());
            if (req.getAddressLine2() != null) a.setAddressLine2(req.getAddressLine2());
            if (req.getCity() != null) a.setCity(req.getCity());
            if (req.getState() != null) a.setState(req.getState());
            if (req.getCountry() != null) a.setCountry(req.getCountry());
            // Update branch seq (non-HQ only)
            if (!"HEADQUARTERS".equalsIgnoreCase(a.getAddressType()) && req.getBranchSeqNo() != null && !req.getBranchSeqNo().isBlank()) {
                String userSeq = req.getBranchSeqNo().trim();
                if (!userSeq.matches("^[0-9]{4}$")) {
                    throw new IllegalArgumentException("종사업장 번호는 숫자 4자리여야 합니다.");
                }
                Roastery r = ro.get();
                if (siteRepository.existsByRoasteryIdAndBranchSeqNo(r.getRoasteryId(), userSeq)) {
                    siteRepository.findByAddressId(a.getAddressId()).ifPresent(existingSite -> {
                        if (!Objects.equals(existingSite.getBranchSeqNo(), userSeq)) {
                            throw new IllegalArgumentException("이미 사용 중인 종사업장 번호입니다.");
                        }
                    });
                }
                a.setBranchSeqNo(userSeq);
                siteRepository.findByAddressId(a.getAddressId()).ifPresent(existingSite -> {
                    existingSite.setBranchSeqNo(userSeq);
                    siteRepository.save(existingSite);
                });
            }

            RoasteryAddress saved = addressRepository.save(a);
            
            return toDto(saved);
        });
    }

    public void delete(UUID id) {
        addressRepository.deleteById(id);
    }
}


