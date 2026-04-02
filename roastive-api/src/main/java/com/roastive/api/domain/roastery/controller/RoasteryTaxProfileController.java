package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.dto.CreateOrUpdateTaxProfileRequest;
import com.roastive.api.domain.roastery.service.RoasteryTaxProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roasteries")
public class RoasteryTaxProfileController {
    private final RoasteryTaxProfileService service;

    public RoasteryTaxProfileController(RoasteryTaxProfileService service) {
        this.service = service;
    }

    @GetMapping("/tax-profile")
    public ResponseEntity<?> get(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        return service.get(roasteryId)
                .<ResponseEntity<?>>map(profile -> ResponseEntity.ok(Map.of("ok", true, "data", profile)))
                .orElseGet(() -> ResponseEntity.ok(Map.of("ok", true)));
    }

    @PostMapping("/tax-profile")
    public ResponseEntity<?> upsert(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @RequestBody CreateOrUpdateTaxProfileRequest body) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        var data = service.upsert(roasteryId, body);
        return ResponseEntity.ok(Map.of("ok", true, "data", data));
    }

    @PatchMapping("/tax-profile/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id,
                                    @RequestBody CreateOrUpdateTaxProfileRequest body) {
        if (roasteryId == null) return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        return service.update(roasteryId, id, body)
                .<ResponseEntity<?>>map(profile -> ResponseEntity.ok(Map.of("ok", true, "data", profile)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
















