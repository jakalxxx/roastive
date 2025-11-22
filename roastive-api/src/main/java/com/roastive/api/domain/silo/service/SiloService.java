package com.roastive.api.domain.silo.service;

import com.roastive.api.domain.silo.model.GreenbeanSilo;
import com.roastive.api.domain.silo.model.SiloRelease;
import com.roastive.api.domain.silo.model.SiloReleaseDetail;
import com.roastive.api.domain.silo.repository.GreenbeanSiloRepository;
import com.roastive.api.domain.silo.repository.SiloReleaseDetailRepository;
import com.roastive.api.domain.silo.repository.SiloReleaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class SiloService {
    private final GreenbeanSiloRepository siloRepo;
    private final SiloReleaseRepository releaseRepo;
    private final SiloReleaseDetailRepository detailRepo;

    public SiloService(GreenbeanSiloRepository siloRepo, SiloReleaseRepository releaseRepo, SiloReleaseDetailRepository detailRepo) {
        this.siloRepo = siloRepo;
        this.releaseRepo = releaseRepo;
        this.detailRepo = detailRepo;
    }

    // Silo
    public List<GreenbeanSilo> findSilos() { return siloRepo.findAll(); }
    public Optional<GreenbeanSilo> findSilo(UUID id) { return siloRepo.findById(id); }
    @Transactional public GreenbeanSilo createSilo(GreenbeanSilo s) { return siloRepo.save(s); }
    @Transactional public Optional<GreenbeanSilo> updateSilo(UUID id, GreenbeanSilo u) {
        return siloRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setSiloName(u.getSiloName());
            e.setCapacity(u.getCapacity());
            e.setLocation(u.getLocation());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return siloRepo.save(e);
        });
    }
    @Transactional public void deleteSilo(UUID id) { siloRepo.deleteById(id); }

    // Release
    public List<SiloRelease> findReleases() { return releaseRepo.findAll(); }
    public Optional<SiloRelease> findRelease(UUID id) { return releaseRepo.findById(id); }
    @Transactional public SiloRelease createRelease(SiloRelease r) { return releaseRepo.save(r); }
    @Transactional public Optional<SiloRelease> updateRelease(UUID id, SiloRelease u) {
        return releaseRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setSiloId(u.getSiloId());
            e.setProductionId(u.getProductionId());
            e.setTargetQty(u.getTargetQty());
            e.setReleaseDate(u.getReleaseDate());
            e.setOperator(u.getOperator());
            e.setRemarks(u.getRemarks());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return releaseRepo.save(e);
        });
    }
    @Transactional public void deleteRelease(UUID id) { releaseRepo.deleteById(id); }

    // Release Detail
    public List<SiloReleaseDetail> findReleaseDetails() { return detailRepo.findAll(); }
    public Optional<SiloReleaseDetail> findReleaseDetail(UUID id) { return detailRepo.findById(id); }
    @Transactional public SiloReleaseDetail createReleaseDetail(SiloReleaseDetail d) { return detailRepo.save(d); }
    @Transactional public Optional<SiloReleaseDetail> updateReleaseDetail(UUID id, SiloReleaseDetail u) {
        return detailRepo.findById(id).map(e -> {
            e.setReleaseId(u.getReleaseId());
            e.setRoasteryId(u.getRoasteryId());
            e.setSiloId(u.getSiloId());
            e.setItemId(u.getItemId());
            e.setLotNo(u.getLotNo());
            e.setReleaseQty(u.getReleaseQty());
            e.setCreatedAt(u.getCreatedAt());
            return detailRepo.save(e);
        });
    }
    @Transactional public void deleteReleaseDetail(UUID id) { detailRepo.deleteById(id); }
}


