package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateAddressRequest;
import com.roastive.api.domain.roastery.dto.RoasteryAddressDto;
import com.roastive.api.domain.roastery.service.RoasteryAddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/v2/roasteries")
public class RoasteryAddressController {
    private final RoasteryAddressService service;

    public RoasteryAddressController(RoasteryAddressService service) {
        this.service = service;
    }

    @GetMapping("/addresses")
    public ResponseEntity<?> list(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var items = service.list(roasteryId);
        return ResponseEntity.ok(Map.of("ok", true, "items", items));
    }

    @GetMapping("/addresses/headquarters")
    public ResponseEntity<?> getHeadquarters(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        return service.getHeadquarters(roasteryId)
                .<ResponseEntity<?>>map(dto -> ResponseEntity.ok(Map.of("ok", true, "data", dto)))
                .orElseGet(() -> ResponseEntity.ok(Map.of("ok", true)));
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> create(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @RequestBody CreateOrUpdateAddressRequest body) {
        try {
            if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
            RoasteryAddressDto dto = service.createOrUpsert(roasteryId, body);
            return ResponseEntity.ok(Map.of("ok", true, "data", dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/addresses/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id,
                                    @RequestBody CreateOrUpdateAddressRequest body) {
        try {
            if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
            return service.update(roasteryId, id, body)
                    .<ResponseEntity<?>>map(dto -> ResponseEntity.ok(Map.of("ok", true, "data", dto)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") UUID id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}


