package com.roastive.api.domain.production.controller;

import com.roastive.api.domain.production.model.*;
import com.roastive.api.domain.production.service.ProductionService;
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
@RequestMapping("/v2/production")
@Validated
public class ProductionController {
    private final ProductionService service;

    public ProductionController(ProductionService service) { this.service = service; }

    // Plan
    @GetMapping("/plans")
    public List<ProductionPlan> listPlans() { return service.findPlans(); }
    @GetMapping("/plans/{id}")
    public ResponseEntity<ProductionPlan> getPlan(@PathVariable UUID id) {
        Optional<ProductionPlan> p = service.findPlan(id);
        return p.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    public record PlanRequest(@NotNull Long roasteryId, @NotNull OffsetDateTime planDate,
                              OffsetDateTime cutoffTime, @NotBlank @Size(max = 32) String status,
                              String notes) {}
    @PostMapping("/plans")
    public ResponseEntity<ProductionPlan> createPlan(@Valid @RequestBody PlanRequest req) {
        ProductionPlan p = new ProductionPlan();
        p.setRoasteryId(req.roasteryId());
        p.setPlanDate(req.planDate());
        p.setCutoffTime(req.cutoffTime());
        p.setStatus(req.status());
        p.setNotes(req.notes());
        p.setCreatedAt(OffsetDateTime.now());
        p.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createPlan(p));
    }
    @PutMapping("/plans/{id}")
    public ResponseEntity<ProductionPlan> updatePlan(@PathVariable UUID id, @Valid @RequestBody PlanRequest req) {
        ProductionPlan p = new ProductionPlan();
        p.setRoasteryId(req.roasteryId());
        p.setPlanDate(req.planDate());
        p.setCutoffTime(req.cutoffTime());
        p.setStatus(req.status());
        p.setNotes(req.notes());
        p.setUpdatedAt(OffsetDateTime.now());
        return service.updatePlan(id, p).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID id) {
        service.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    // Plan detail
    @GetMapping("/plan-details")
    public List<ProductionPlanDetail> listPlanDetails() { return service.findPlanDetails(); }
    public record PlanDetailRequest(@NotNull UUID planId, @NotNull UUID productId,
                                    @NotNull BigDecimal totalQuantity, @NotNull BigDecimal requiredInput,
                                    @NotBlank @Size(max = 16) String unit,
                                    @NotBlank @Size(max = 32) String status) {}
    @PostMapping("/plan-details")
    public ResponseEntity<ProductionPlanDetail> createPlanDetail(@Valid @RequestBody PlanDetailRequest req) {
        ProductionPlanDetail d = new ProductionPlanDetail();
        d.setPlanId(req.planId());
        d.setProductId(req.productId());
        d.setTotalQuantity(req.totalQuantity());
        d.setRequiredInput(req.requiredInput());
        d.setUnit(req.unit());
        d.setStatus(req.status());
        d.setCreatedAt(OffsetDateTime.now());
        d.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createPlanDetail(d));
    }
    @PutMapping("/plan-details/{id}")
    public ResponseEntity<ProductionPlanDetail> updatePlanDetail(@PathVariable UUID id, @Valid @RequestBody PlanDetailRequest req) {
        ProductionPlanDetail d = new ProductionPlanDetail();
        d.setPlanId(req.planId());
        d.setProductId(req.productId());
        d.setTotalQuantity(req.totalQuantity());
        d.setRequiredInput(req.requiredInput());
        d.setUnit(req.unit());
        d.setStatus(req.status());
        d.setUpdatedAt(OffsetDateTime.now());
        return service.updatePlanDetail(id, d).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/plan-details/{id}")
    public ResponseEntity<Void> deletePlanDetail(@PathVariable UUID id) {
        service.deletePlanDetail(id);
        return ResponseEntity.noContent().build();
    }

    // Batch
    @GetMapping("/batches")
    public List<ProductionBatch> listBatches() { return service.findBatches(); }
    public record BatchRequest(@NotNull UUID planId, @NotNull UUID planDetailId,
                               @NotNull UUID roasterId, UUID profileId,
                               @NotNull BigDecimal inputQuantity, @NotNull BigDecimal expectedOutput,
                               @NotNull Integer sequenceNo, @NotBlank @Size(max = 32) String status) {}
    @PostMapping("/batches")
    public ResponseEntity<ProductionBatch> createBatch(@Valid @RequestBody BatchRequest req) {
        ProductionBatch b = new ProductionBatch();
        b.setPlanDetailId(req.planDetailId());
        b.setRoasterId(req.roasterId());
        b.setProfileId(req.profileId());
        b.setInputQuantity(req.inputQuantity());
        b.setExpectedOutput(req.expectedOutput());
        b.setSequenceNo(req.sequenceNo());
        b.setStatus(req.status());
        b.setCreatedAt(OffsetDateTime.now());
        b.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createBatch(b));
    }
    @PutMapping("/batches/{id}")
    public ResponseEntity<ProductionBatch> updateBatch(@PathVariable UUID id, @Valid @RequestBody BatchRequest req) {
        ProductionBatch b = new ProductionBatch();
        b.setPlanDetailId(req.planDetailId());
        b.setRoasterId(req.roasterId());
        b.setProfileId(req.profileId());
        b.setInputQuantity(req.inputQuantity());
        b.setExpectedOutput(req.expectedOutput());
        b.setSequenceNo(req.sequenceNo());
        b.setStatus(req.status());
        b.setUpdatedAt(OffsetDateTime.now());
        return service.updateBatch(id, b).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/batches/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable UUID id) {
        service.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }

    // Schedule
    @GetMapping("/schedules")
    public List<ProductionSchedule> listSchedules() { return service.findSchedules(); }
    public record ScheduleRequest(@NotNull UUID batchId,
                                  @NotNull OffsetDateTime startTime,
                                  @NotNull OffsetDateTime endTime,
                                  @Size(max = 120) String operator,
                                  @NotBlank @Size(max = 32) String status) {}
    @PostMapping("/schedules")
    public ResponseEntity<ProductionSchedule> createSchedule(@Valid @RequestBody ScheduleRequest req) {
        ProductionSchedule s = new ProductionSchedule();
        s.setBatchId(req.batchId());
        s.setStartTime(req.startTime());
        s.setEndTime(req.endTime());
        s.setOperator(req.operator());
        s.setStatus(req.status());
        s.setCreatedAt(OffsetDateTime.now());
        s.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createSchedule(s));
    }
    @PutMapping("/schedules/{id}")
    public ResponseEntity<ProductionSchedule> updateSchedule(@PathVariable UUID id, @Valid @RequestBody ScheduleRequest req) {
        ProductionSchedule s = new ProductionSchedule();
        s.setBatchId(req.batchId());
        s.setStartTime(req.startTime());
        s.setEndTime(req.endTime());
        s.setOperator(req.operator());
        s.setStatus(req.status());
        s.setUpdatedAt(OffsetDateTime.now());
        return service.updateSchedule(id, s).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID id) {
        service.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    // Run
    @GetMapping("/runs")
    public List<ProductionMaster> listRuns() { return service.findRuns(); }
    public record RunRequest(@NotNull Long roasteryId, UUID batchId,
                             @NotNull UUID productId, @NotNull UUID roasterId,
                             OffsetDateTime productionDate,
                             @NotBlank @Size(max = 32) String status,
                             @Size(max = 120) String operator,
                             @Size(max = 80) String lotNo) {}
    @PostMapping("/runs")
    public ResponseEntity<ProductionMaster> createRun(@Valid @RequestBody RunRequest req) {
        ProductionMaster m = new ProductionMaster();
        m.setRoasteryId(req.roasteryId());
        m.setBatchId(req.batchId());
        m.setProductId(req.productId());
        m.setRoasterId(req.roasterId());
        m.setProductionDate(req.productionDate());
        m.setStatus(req.status());
        m.setOperator(req.operator());
        m.setLotNo(req.lotNo());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createRun(m));
    }
    @PutMapping("/runs/{id}")
    public ResponseEntity<ProductionMaster> updateRun(@PathVariable UUID id, @Valid @RequestBody RunRequest req) {
        ProductionMaster m = new ProductionMaster();
        m.setRoasteryId(req.roasteryId());
        m.setBatchId(req.batchId());
        m.setProductId(req.productId());
        m.setRoasterId(req.roasterId());
        m.setProductionDate(req.productionDate());
        m.setStatus(req.status());
        m.setOperator(req.operator());
        m.setLotNo(req.lotNo());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.updateRun(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/runs/{id}")
    public ResponseEntity<Void> deleteRun(@PathVariable UUID id) {
        service.deleteRun(id);
        return ResponseEntity.noContent().build();
    }

    // Input
    @GetMapping("/inputs")
    public List<ProductionInput> listInputs() { return service.findInputs(); }
    public record InputRequest(@NotNull UUID productionId, @NotNull UUID releaseDetailId,
                               @NotBlank @Size(max = 80) String lotNo,
                               @NotNull BigDecimal inputQuantity,
                               OffsetDateTime createdAt) {}
    @PostMapping("/inputs")
    public ResponseEntity<ProductionInput> createInput(@Valid @RequestBody InputRequest req) {
        ProductionInput i = new ProductionInput();
        i.setProductionId(req.productionId());
        i.setReleaseDetailId(req.releaseDetailId());
        i.setLotNo(req.lotNo());
        i.setInputQuantity(req.inputQuantity());
        i.setCreatedAt(req.createdAt() != null ? req.createdAt() : OffsetDateTime.now());
        return ResponseEntity.ok(service.createInput(i));
    }
    @PutMapping("/inputs/{id}")
    public ResponseEntity<ProductionInput> updateInput(@PathVariable UUID id, @Valid @RequestBody InputRequest req) {
        ProductionInput i = new ProductionInput();
        i.setProductionId(req.productionId());
        i.setReleaseDetailId(req.releaseDetailId());
        i.setLotNo(req.lotNo());
        i.setInputQuantity(req.inputQuantity());
        i.setCreatedAt(OffsetDateTime.now());
        return service.updateInput(id, i).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/inputs/{id}")
    public ResponseEntity<Void> deleteInput(@PathVariable UUID id) {
        service.deleteInput(id);
        return ResponseEntity.noContent().build();
    }

    // Output
    @GetMapping("/outputs")
    public List<ProductionOutput> listOutputs() { return service.findOutputs(); }
    public record OutputRequest(@NotNull UUID productionId,
                                @NotNull BigDecimal roastedQuantity,
                                BigDecimal defectQuantity,
                                OffsetDateTime outputDate,
                                String remarks) {}
    @PostMapping("/outputs")
    public ResponseEntity<ProductionOutput> createOutput(@Valid @RequestBody OutputRequest req) {
        ProductionOutput o = new ProductionOutput();
        o.setProductionId(req.productionId());
        o.setRoastedQuantity(req.roastedQuantity());
        o.setDefectQuantity(req.defectQuantity());
        o.setOutputDate(req.outputDate() != null ? req.outputDate() : OffsetDateTime.now());
        o.setRemarks(req.remarks());
        return ResponseEntity.ok(service.createOutput(o));
    }
    @PutMapping("/outputs/{id}")
    public ResponseEntity<ProductionOutput> updateOutput(@PathVariable UUID id, @Valid @RequestBody OutputRequest req) {
        ProductionOutput o = new ProductionOutput();
        o.setProductionId(req.productionId());
        o.setRoastedQuantity(req.roastedQuantity());
        o.setDefectQuantity(req.defectQuantity());
        o.setOutputDate(OffsetDateTime.now());
        o.setRemarks(req.remarks());
        return service.updateOutput(id, o).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/outputs/{id}")
    public ResponseEntity<Void> deleteOutput(@PathVariable UUID id) {
        service.deleteOutput(id);
        return ResponseEntity.noContent().build();
    }
}


