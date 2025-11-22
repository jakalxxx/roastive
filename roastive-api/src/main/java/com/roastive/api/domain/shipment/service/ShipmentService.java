package com.roastive.api.domain.shipment.service;

import com.roastive.api.domain.shipment.model.ShipmentAddressSnapshot;
import com.roastive.api.domain.shipment.model.ShipmentDetail;
import com.roastive.api.domain.shipment.model.ShipmentMaster;
import com.roastive.api.domain.shipment.repository.ShipmentAddressSnapshotRepository;
import com.roastive.api.domain.shipment.repository.ShipmentDetailRepository;
import com.roastive.api.domain.shipment.repository.ShipmentMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ShipmentService {
    private final ShipmentMasterRepository masterRepo;
    private final ShipmentDetailRepository detailRepo;
    private final ShipmentAddressSnapshotRepository addressRepo;

    public ShipmentService(ShipmentMasterRepository masterRepo, ShipmentDetailRepository detailRepo, ShipmentAddressSnapshotRepository addressRepo) {
        this.masterRepo = masterRepo;
        this.detailRepo = detailRepo;
        this.addressRepo = addressRepo;
    }

    // Master
    public List<ShipmentMaster> findMasters() { return masterRepo.findAll(); }
    public Optional<ShipmentMaster> findMaster(UUID id) { return masterRepo.findById(id); }
    @Transactional public ShipmentMaster createMaster(ShipmentMaster m) { return masterRepo.save(m); }
    @Transactional public Optional<ShipmentMaster> updateMaster(UUID id, ShipmentMaster u) {
        return masterRepo.findById(id).map(e -> {
            e.setRoasteryId(u.getRoasteryId());
            e.setOrderId(u.getOrderId());
            e.setShipmentDate(u.getShipmentDate());
            e.setStatus(u.getStatus());
            e.setTrackingNo(u.getTrackingNo());
            e.setRemarks(u.getRemarks());
            e.setUpdatedAt(u.getUpdatedAt());
            return masterRepo.save(e);
        });
    }
    @Transactional public void deleteMaster(UUID id) { masterRepo.deleteById(id); }

    // Detail
    public List<ShipmentDetail> findDetails() { return detailRepo.findAll(); }
    public Optional<ShipmentDetail> findDetail(UUID id) { return detailRepo.findById(id); }
    @Transactional public ShipmentDetail createDetail(ShipmentDetail d) { return detailRepo.save(d); }
    @Transactional public Optional<ShipmentDetail> updateDetail(UUID id, ShipmentDetail u) {
        return detailRepo.findById(id).map(e -> {
            e.setShipmentId(u.getShipmentId());
            e.setPackagingDetailId(u.getPackagingDetailId());
            e.setQuantity(u.getQuantity());
            return detailRepo.save(e);
        });
    }
    @Transactional public void deleteDetail(UUID id) { detailRepo.deleteById(id); }

    // Address snapshot
    public List<ShipmentAddressSnapshot> findAddresses() { return addressRepo.findAll(); }
    public Optional<ShipmentAddressSnapshot> findAddress(UUID id) { return addressRepo.findById(id); }
    @Transactional public ShipmentAddressSnapshot createAddress(ShipmentAddressSnapshot a) { return addressRepo.save(a); }
    @Transactional public Optional<ShipmentAddressSnapshot> updateAddress(UUID id, ShipmentAddressSnapshot u) {
        return addressRepo.findById(id).map(e -> {
            e.setShipmentId(u.getShipmentId());
            e.setAddressType(u.getAddressType());
            e.setPostalCode(u.getPostalCode());
            e.setAddressLine1(u.getAddressLine1());
            e.setAddressLine2(u.getAddressLine2());
            e.setContactName(u.getContactName());
            e.setPhone(u.getPhone());
            e.setEmail(u.getEmail());
            e.setCreatedAt(u.getCreatedAt());
            return addressRepo.save(e);
        });
    }
    @Transactional public void deleteAddress(UUID id) { addressRepo.deleteById(id); }
}


