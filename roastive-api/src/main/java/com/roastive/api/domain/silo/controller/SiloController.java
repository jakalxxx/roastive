package com.roastive.api.domain.silo.controller;

import com.roastive.api.domain.silo.model.GreenbeanSilo;
import com.roastive.api.domain.silo.model.SiloRelease;
import com.roastive.api.domain.silo.model.SiloReleaseDetail;
import com.roastive.api.domain.silo.service.SiloService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/silos")
@Validated
public class SiloController {
    private final SiloService service;

    public SiloController(SiloService service) { this.service = service; }

    // Silo
    @GetMapping
    public List<GreenbeanSilo> listSilos() { return service.findSilos(); }

    @GetMapping("/{id}")
    public ResponseEntity<GreenbeanSilo> getSilo(@PathVariable UUID id) {
        Optional<GreenbeanSilo> s = service.findSilo(id);
        return s.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record SiloRequest(@NotNull Long roasteryId,
                              @NotBlank @Size(max = 120) String siloName,
                              BigDecimal capacity,
                              @Size(max = 160) String location,
                              @NotBlank @Size(max = 32) String status) {}

    @PostMapping
    public ResponseEntity<GreenbeanSilo> createSilo(@Valid @RequestBody SiloRequest req) {
        GreenbeanSilo s = new GreenbeanSilo();
        s.setRoasteryId(req.roasteryId());
        s.setSiloName(req.siloName());
        s.setCapacity(req.capacity());
        s.setLocation(req.location());
        s.setStatus(req.status());
        s.setCreatedAt(OffsetDateTime.now());
        s.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createSilo(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GreenbeanSilo> updateSilo(@PathVariable UUID id, @Valid @RequestBody SiloRequest req) {
        GreenbeanSilo s = new GreenbeanSilo();
        s.setRoasteryId(req.roasteryId());
        s.setSiloName(req.siloName());
        s.setCapacity(req.capacity());
        s.setLocation(req.location());
        s.setStatus(req.status());
        s.setUpdatedAt(OffsetDateTime.now());
        return service.updateSilo(id, s).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSilo(@PathVariable UUID id) {
        service.deleteSilo(id);
        return ResponseEntity.noContent().build();
    }

    // Release
    @GetMapping("/releases")
    public List<SiloRelease> listReleases() { return service.findReleases(); }

    @GetMapping("/releases/{id}")
    public ResponseEntity<SiloRelease> getRelease(@PathVariable UUID id) {
        Optional<SiloRelease> r = service.findRelease(id);
        return r.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ReleaseRequest(@NotNull Long roasteryId,
                                 @NotNull UUID siloId,
                                 UUID productionId,
                                 @NotNull BigDecimal targetQty,
                                 @NotNull OffsetDateTime releaseDate,
                                 @Size(max = 120) String operator,
                                 String remarks,
                                 @NotBlank @Size(max = 32) String status) {}

    @PostMapping("/releases")
    public ResponseEntity<SiloRelease> createRelease(@Valid @RequestBody ReleaseRequest req) {
        SiloRelease r = new SiloRelease();
        r.setRoasteryId(req.roasteryId());
        r.setSiloId(req.siloId());
        r.setProductionId(req.productionId());
        r.setTargetQty(req.targetQty());
        r.setReleaseDate(req.releaseDate());
        r.setOperator(req.operator());
        r.setRemarks(req.remarks());
        r.setStatus(req.status());
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createRelease(r));
    }

    @PutMapping("/releases/{id}")
    public ResponseEntity<SiloRelease> updateRelease(@PathVariable UUID id, @Valid @RequestBody ReleaseRequest req) {
        SiloRelease r = new SiloRelease();
        r.setRoasteryId(req.roasteryId());
        r.setSiloId(req.siloId());
        r.setProductionId(req.productionId());
        r.setTargetQty(req.targetQty());
        r.setReleaseDate(req.releaseDate());
        r.setOperator(req.operator());
        r.setRemarks(req.remarks());
        r.setStatus(req.status());
        r.setUpdatedAt(OffsetDateTime.now());
        return service.updateRelease(id, r).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/releases/{id}")
    public ResponseEntity<Void> deleteRelease(@PathVariable UUID id) {
        service.deleteRelease(id);
        return ResponseEntity.noContent().build();
    }

    // Release detail
    @GetMapping("/release-details")
    public List<SiloReleaseDetail> listReleaseDetails() { return service.findReleaseDetails(); }

    @GetMapping("/release-details/{id}")
    public ResponseEntity<SiloReleaseDetail> getReleaseDetail(@PathVariable UUID id) {
        Optional<SiloReleaseDetail> d = service.findReleaseDetail(id);
        return d.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ReleaseDetailRequest(@NotNull UUID releaseId,
                                       @NotNull Long roasteryId,
                                       @NotNull UUID siloId,
                                       @NotNull UUID itemId,
                                       @NotBlank @Size(max = 80) String lotNo,
                                       @NotNull BigDecimal releaseQty) {}

    @PostMapping("/release-details")
    public ResponseEntity<SiloReleaseDetail> createReleaseDetail(@Valid @RequestBody ReleaseDetailRequest req) {
        SiloReleaseDetail d = new SiloReleaseDetail();
        d.setReleaseId(req.releaseId());
        d.setRoasteryId(req.roasteryId());
        d.setSiloId(req.siloId());
        d.setItemId(req.itemId());
        d.setLotNo(req.lotNo());
        d.setReleaseQty(req.releaseQty());
        d.setCreatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createReleaseDetail(d));
    }

    @PutMapping("/release-details/{id}")
    public ResponseEntity<SiloReleaseDetail> updateReleaseDetail(@PathVariable UUID id, @Valid @RequestBody ReleaseDetailRequest req) {
        SiloReleaseDetail d = new SiloReleaseDetail();
        d.setReleaseId(req.releaseId());
        d.setRoasteryId(req.roasteryId());
        d.setSiloId(req.siloId());
        d.setItemId(req.itemId());
        d.setLotNo(req.lotNo());
        d.setReleaseQty(req.releaseQty());
        d.setCreatedAt(OffsetDateTime.now());
        return service.updateReleaseDetail(id, d).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/release-details/{id}")
    public ResponseEntity<Void> deleteReleaseDetail(@PathVariable UUID id) {
        service.deleteReleaseDetail(id);
        return ResponseEntity.noContent().build();
    }
}


