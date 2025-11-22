package com.roastive.api.domain.purchase.service;

import com.roastive.api.domain.purchase.model.PurchaseDetail;
import com.roastive.api.domain.purchase.model.PurchaseMaster;
import com.roastive.api.domain.purchase.repository.PurchaseDetailRepository;
import com.roastive.api.domain.purchase.repository.PurchaseMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PurchaseService {
    private final PurchaseMasterRepository masterRepo;
    private final PurchaseDetailRepository detailRepo;

    public PurchaseService(PurchaseMasterRepository masterRepo, PurchaseDetailRepository detailRepo) {
        this.masterRepo = masterRepo;
        this.detailRepo = detailRepo;
    }

    // Master
    public List<PurchaseMaster> findMasters() { return masterRepo.findAll(); }
    public Optional<PurchaseMaster> findMaster(UUID id) { return masterRepo.findById(id); }

    @Transactional
    public PurchaseMaster createMaster(PurchaseMaster m) { return masterRepo.save(m); }

    @Transactional
    public Optional<PurchaseMaster> updateMaster(UUID id, PurchaseMaster u) {
        return masterRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setSupplierId(u.getSupplierId());
            e.setPurchaseNo(u.getPurchaseNo());
            e.setInvoiceNo(u.getInvoiceNo());
            e.setPurchaseDate(u.getPurchaseDate());
            e.setExpectedArrival(u.getExpectedArrival());
            e.setCurrency(u.getCurrency());
            e.setPaymentTerms(u.getPaymentTerms());
            e.setPaymentDate(u.getPaymentDate());
            e.setStatus(u.getStatus());
            e.setRemarks(u.getRemarks());
            e.setTotalAmount(u.getTotalAmount());
            e.setUpdatedAt(u.getUpdatedAt());
            return masterRepo.save(e);
        });
    }

    @Transactional
    public void deleteMaster(UUID id) { masterRepo.deleteById(id); }

    // Detail
    public List<PurchaseDetail> findDetails() { return detailRepo.findAll(); }
    public Optional<PurchaseDetail> findDetail(UUID id) { return detailRepo.findById(id); }

    @Transactional
    public PurchaseDetail createDetail(PurchaseDetail d) {
        PurchaseDetail saved = detailRepo.save(d);
        recalcTotal(saved.getPurchaseId());
        return saved;
    }

    @Transactional
    public Optional<PurchaseDetail> updateDetail(UUID id, PurchaseDetail u) {
        Optional<PurchaseDetail> updated = detailRepo.findById(id).map(e -> {
            e.setPurchaseId(u.getPurchaseId());
            e.setItemId(u.getItemId());
            e.setQuantity(u.getQuantity());
            e.setUnit(u.getUnit());
            e.setUnitPrice(u.getUnitPrice());
            e.setAmount(u.getAmount());
            e.setLotHint(u.getLotHint());
            e.setRemarks(u.getRemarks());
            e.setUpdatedAt(u.getUpdatedAt());
            return detailRepo.save(e);
        });
        updated.ifPresent(d -> recalcTotal(d.getPurchaseId()));
        return updated;
    }

    @Transactional
    public void deleteDetail(UUID id) {
        detailRepo.findById(id).ifPresent(d -> {
            UUID purchaseId = d.getPurchaseId();
            detailRepo.deleteById(id);
            recalcTotal(purchaseId);
        });
    }

    private void recalcTotal(UUID purchaseId) {
        masterRepo.findById(purchaseId).ifPresent(master -> {
            List<PurchaseDetail> details = detailRepo.findAll().stream()
                    .filter(d -> purchaseId.equals(d.getPurchaseId()))
                    .toList();
            BigDecimal total = details.stream()
                    .map(PurchaseDetail::getAmount)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            master.setTotalAmount(total);
            masterRepo.save(master);
        });
    }
}


