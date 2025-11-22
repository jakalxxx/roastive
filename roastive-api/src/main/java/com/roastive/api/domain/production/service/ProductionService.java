package com.roastive.api.domain.production.service;

import com.roastive.api.domain.production.model.*;
import com.roastive.api.domain.production.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ProductionService {
    private final ProductionPlanRepository planRepo;
    private final ProductionPlanDetailRepository planDetailRepo;
    private final ProductionBatchRepository batchRepo;
    private final ProductionScheduleRepository scheduleRepo;
    private final ProductionMasterRepository masterRepo;
    private final ProductionInputRepository inputRepo;
    private final ProductionOutputRepository outputRepo;

    public ProductionService(ProductionPlanRepository planRepo,
                             ProductionPlanDetailRepository planDetailRepo,
                             ProductionBatchRepository batchRepo,
                             ProductionScheduleRepository scheduleRepo,
                             ProductionMasterRepository masterRepo,
                             ProductionInputRepository inputRepo,
                             ProductionOutputRepository outputRepo) {
        this.planRepo = planRepo;
        this.planDetailRepo = planDetailRepo;
        this.batchRepo = batchRepo;
        this.scheduleRepo = scheduleRepo;
        this.masterRepo = masterRepo;
        this.inputRepo = inputRepo;
        this.outputRepo = outputRepo;
    }

    // Plan
    public List<ProductionPlan> findPlans() { return planRepo.findAll(); }
    public Optional<ProductionPlan> findPlan(UUID id) { return planRepo.findById(id); }
    @Transactional public ProductionPlan createPlan(ProductionPlan p) { return planRepo.save(p); }
    @Transactional public Optional<ProductionPlan> updatePlan(UUID id, ProductionPlan u) {
        return planRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setPlanDate(u.getPlanDate());
            e.setCutoffTime(u.getCutoffTime());
            e.setStatus(u.getStatus());
            e.setNotes(u.getNotes());
            e.setUpdatedAt(u.getUpdatedAt());
            return planRepo.save(e);
        });
    }
    @Transactional public void deletePlan(UUID id) { planRepo.deleteById(id); }

    // Plan detail
    public List<ProductionPlanDetail> findPlanDetails() { return planDetailRepo.findAll(); }
    public Optional<ProductionPlanDetail> findPlanDetail(UUID id) { return planDetailRepo.findById(id); }
    @Transactional public ProductionPlanDetail createPlanDetail(ProductionPlanDetail d) { return planDetailRepo.save(d); }
    @Transactional public Optional<ProductionPlanDetail> updatePlanDetail(UUID id, ProductionPlanDetail u) {
        return planDetailRepo.findById(id).map(e -> {
            e.setPlanId(u.getPlanId());
            e.setProductId(u.getProductId());
            e.setTotalQuantity(u.getTotalQuantity());
            e.setRequiredInput(u.getRequiredInput());
            e.setUnit(u.getUnit());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return planDetailRepo.save(e);
        });
    }
    @Transactional public void deletePlanDetail(UUID id) { planDetailRepo.deleteById(id); }

    // Batch
    public List<ProductionBatch> findBatches() { return batchRepo.findAll(); }
    public Optional<ProductionBatch> findBatch(UUID id) { return batchRepo.findById(id); }
    @Transactional public ProductionBatch createBatch(ProductionBatch b) { return batchRepo.save(b); }
    @Transactional public Optional<ProductionBatch> updateBatch(UUID id, ProductionBatch u) {
        return batchRepo.findById(id).map(e -> {
            e.setPlanDetailId(u.getPlanDetailId());
            e.setRoasterId(u.getRoasterId());
            e.setProfileId(u.getProfileId());
            e.setInputQuantity(u.getInputQuantity());
            e.setExpectedOutput(u.getExpectedOutput());
            e.setSequenceNo(u.getSequenceNo());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return batchRepo.save(e);
        });
    }
    @Transactional public void deleteBatch(UUID id) { batchRepo.deleteById(id); }

    // Schedule
    public List<ProductionSchedule> findSchedules() { return scheduleRepo.findAll(); }
    public Optional<ProductionSchedule> findSchedule(UUID id) { return scheduleRepo.findById(id); }
    @Transactional public ProductionSchedule createSchedule(ProductionSchedule s) { return scheduleRepo.save(s); }
    @Transactional public Optional<ProductionSchedule> updateSchedule(UUID id, ProductionSchedule u) {
        return scheduleRepo.findById(id).map(e -> {
            e.setBatchId(u.getBatchId());
            e.setStartTime(u.getStartTime());
            e.setEndTime(u.getEndTime());
            e.setOperator(u.getOperator());
            e.setStatus(u.getStatus());
            e.setUpdatedAt(u.getUpdatedAt());
            return scheduleRepo.save(e);
        });
    }
    @Transactional public void deleteSchedule(UUID id) { scheduleRepo.deleteById(id); }

    // Master
    public List<ProductionMaster> findRuns() { return masterRepo.findAll(); }
    public Optional<ProductionMaster> findRun(UUID id) { return masterRepo.findById(id); }
    @Transactional public ProductionMaster createRun(ProductionMaster m) { return masterRepo.save(m); }
    @Transactional public Optional<ProductionMaster> updateRun(UUID id, ProductionMaster u) {
        return masterRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setBatchId(u.getBatchId());
            e.setProductId(u.getProductId());
            e.setRoasterId(u.getRoasterId());
            e.setProductionDate(u.getProductionDate());
            e.setStatus(u.getStatus());
            e.setOperator(u.getOperator());
            e.setLotNo(u.getLotNo());
            e.setUpdatedAt(u.getUpdatedAt());
            return masterRepo.save(e);
        });
    }
    @Transactional public void deleteRun(UUID id) { masterRepo.deleteById(id); }

    // Input
    public List<ProductionInput> findInputs() { return inputRepo.findAll(); }
    public Optional<ProductionInput> findInput(UUID id) { return inputRepo.findById(id); }
    @Transactional public ProductionInput createInput(ProductionInput i) { return inputRepo.save(i); }
    @Transactional public Optional<ProductionInput> updateInput(UUID id, ProductionInput u) {
        return inputRepo.findById(id).map(e -> {
            e.setProductionId(u.getProductionId());
            e.setReleaseDetailId(u.getReleaseDetailId());
            e.setLotNo(u.getLotNo());
            e.setInputQuantity(u.getInputQuantity());
            e.setCreatedAt(u.getCreatedAt());
            return inputRepo.save(e);
        });
    }
    @Transactional public void deleteInput(UUID id) { inputRepo.deleteById(id); }

    // Output
    public List<ProductionOutput> findOutputs() { return outputRepo.findAll(); }
    public Optional<ProductionOutput> findOutput(UUID id) { return outputRepo.findById(id); }
    @Transactional public ProductionOutput createOutput(ProductionOutput o) { return outputRepo.save(o); }
    @Transactional public Optional<ProductionOutput> updateOutput(UUID id, ProductionOutput u) {
        return outputRepo.findById(id).map(e -> {
            e.setProductionId(u.getProductionId());
            e.setRoastedQuantity(u.getRoastedQuantity());
            e.setDefectQuantity(u.getDefectQuantity());
            e.setOutputDate(u.getOutputDate());
            e.setRemarks(u.getRemarks());
            return outputRepo.save(e);
        });
    }
    @Transactional public void deleteOutput(UUID id) { outputRepo.deleteById(id); }
}


