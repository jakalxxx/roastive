package com.roastive.api.domain.roastery.controller;

import com.roastive.api.domain.roastery.service.RoasterySettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/v2/roasteries/settings")
public class RoasterySettingsController {
    private final RoasterySettingsService service;

    public RoasterySettingsController(RoasterySettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> get(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        return service.getSettings(roasteryId)
                .<ResponseEntity<?>>map(data -> ResponseEntity.ok(Map.of("ok", true, "data", data)))
                .orElseGet(() -> ResponseEntity.ok(Map.of("ok", true, "data", Map.of())));
    }

    @PatchMapping
    public ResponseEntity<?> update(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @RequestBody Map<String, Object> body) {
        var settings = service.updateSettings(roasteryId, body);
        return ResponseEntity.ok(Map.of("ok", true, "settings", settings));
    }

    @PostMapping("/init")
    public ResponseEntity<?> init(@RequestHeader(value = "X-User-Id", required = false) String userId,
                                  @RequestBody Map<String, Object> body) {
        UUID roasteryId = service.initRoastery(userId, body);
        return ResponseEntity.ok(Map.of("ok", true, "data", Map.of("roastery_id", roasteryId)));
    }
}


