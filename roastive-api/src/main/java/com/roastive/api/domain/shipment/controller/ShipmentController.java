package com.roastive.api.domain.shipment.controller;

import com.roastive.api.domain.shipment.model.ShipmentAddressSnapshot;
import com.roastive.api.domain.shipment.model.ShipmentDetail;
import com.roastive.api.domain.shipment.model.ShipmentMaster;
import com.roastive.api.domain.shipment.service.ShipmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/shipments")
@Validated
public class ShipmentController {
    private final ShipmentService service;

    public ShipmentController(ShipmentService service) { this.service = service; }

    // Master
    @GetMapping
    public List<ShipmentMaster> listMasters() { return service.findMasters(); }
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentMaster> getMaster(@PathVariable UUID id) {
        Optional<ShipmentMaster> m = service.findMaster(id);
        return m.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    public record MasterRequest(@NotNull Long roasteryId, @NotNull Long orderId,
                                @NotNull OffsetDateTime shipmentDate,
                                @NotBlank @Size(max = 32) String status,
                                @Size(max = 120) String trackingNo, String remarks) {}
    @PostMapping
    public ResponseEntity<ShipmentMaster> createMaster(@Valid @RequestBody MasterRequest req) {
        ShipmentMaster m = new ShipmentMaster();
        m.setRoasteryId(req.roasteryId());
        m.setOrderId(req.orderId());
        m.setShipmentDate(req.shipmentDate());
        m.setStatus(req.status());
        m.setTrackingNo(req.trackingNo());
        m.setRemarks(req.remarks());
        m.setCreatedAt(OffsetDateTime.now());
        m.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createMaster(m));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ShipmentMaster> updateMaster(@PathVariable UUID id, @Valid @RequestBody MasterRequest req) {
        ShipmentMaster m = new ShipmentMaster();
        m.setRoasteryId(req.roasteryId());
        m.setOrderId(req.orderId());
        m.setShipmentDate(req.shipmentDate());
        m.setStatus(req.status());
        m.setTrackingNo(req.trackingNo());
        m.setRemarks(req.remarks());
        m.setUpdatedAt(OffsetDateTime.now());
        return service.updateMaster(id, m).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaster(@PathVariable UUID id) {
        service.deleteMaster(id);
        return ResponseEntity.noContent().build();
    }

    // Detail
    @GetMapping("/details")
    public List<ShipmentDetail> listDetails() { return service.findDetails(); }
    public record DetailRequest(@NotNull UUID shipmentId, Long packagingDetailId, @NotNull Integer quantity) {}
    @PostMapping("/details")
    public ResponseEntity<ShipmentDetail> createDetail(@Valid @RequestBody DetailRequest req) {
        ShipmentDetail d = new ShipmentDetail();
        d.setShipmentId(req.shipmentId());
        d.setPackagingDetailId(req.packagingDetailId());
        d.setQuantity(req.quantity());
        return ResponseEntity.ok(service.createDetail(d));
    }
    @PutMapping("/details/{id}")
    public ResponseEntity<ShipmentDetail> updateDetail(@PathVariable UUID id, @Valid @RequestBody DetailRequest req) {
        ShipmentDetail d = new ShipmentDetail();
        d.setShipmentId(req.shipmentId());
        d.setPackagingDetailId(req.packagingDetailId());
        d.setQuantity(req.quantity());
        return service.updateDetail(id, d).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/details/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable UUID id) {
        service.deleteDetail(id);
        return ResponseEntity.noContent().build();
    }

    // Address snapshot
    @GetMapping("/addresses")
    public List<ShipmentAddressSnapshot> listAddresses() { return service.findAddresses(); }
    public record AddressRequest(@NotNull Long shipmentId, @NotBlank @Size(max = 16) String addressType,
                                 @Size(max = 20) String postalCode,
                                 @NotBlank @Size(max = 200) String addressLine1,
                                 @Size(max = 200) String addressLine2,
                                 @NotBlank @Size(max = 120) String contactName,
                                 @Size(max = 64) String phone,
                                 @Size(max = 160) String email) {}
    @PostMapping("/addresses")
    public ResponseEntity<ShipmentAddressSnapshot> createAddress(@Valid @RequestBody AddressRequest req) {
        ShipmentAddressSnapshot a = new ShipmentAddressSnapshot();
        a.setShipmentId(req.shipmentId());
        a.setAddressType(req.addressType());
        a.setPostalCode(req.postalCode());
        a.setAddressLine1(req.addressLine1());
        a.setAddressLine2(req.addressLine2());
        a.setContactName(req.contactName());
        a.setPhone(req.phone());
        a.setEmail(req.email());
        a.setCreatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.createAddress(a));
    }
    @PutMapping("/addresses/{id}")
    public ResponseEntity<ShipmentAddressSnapshot> updateAddress(@PathVariable UUID id, @Valid @RequestBody AddressRequest req) {
        ShipmentAddressSnapshot a = new ShipmentAddressSnapshot();
        a.setShipmentId(req.shipmentId());
        a.setAddressType(req.addressType());
        a.setPostalCode(req.postalCode());
        a.setAddressLine1(req.addressLine1());
        a.setAddressLine2(req.addressLine2());
        a.setContactName(req.contactName());
        a.setPhone(req.phone());
        a.setEmail(req.email());
        a.setCreatedAt(OffsetDateTime.now());
        return service.updateAddress(id, a).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID id) {
        service.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}


