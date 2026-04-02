package com.roastive.api.domain.roaster.controller;

import com.roastive.api.domain.roaster.model.RoasterMaster;
import com.roastive.api.domain.roaster.service.RoasterService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roasteries")
@Validated
public class RoasterController {

    private final RoasterService service;

    public RoasterController(RoasterService service) {
        this.service = service;
    }

    @GetMapping("/roasters")
    public ResponseEntity<?> list(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId) {
        if (roasteryId == null) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        }
        List<RoasterMaster> items = service.list(roasteryId);
        return ResponseEntity.ok(Map.of("items", items));
    }

    public record RoasterRequest(
            @NotBlank @Size(max = 160) String roasterName,
            @Size(max = 120) String manufacturer,
            @Size(max = 120) String model,
            @Size(max = 120) String serialNo,
            String installDate,
            @Size(max = 32) String status
    ) {}

    @PostMapping("/roasters")
    public ResponseEntity<?> create(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @RequestBody RoasterRequest body) {
        if (roasteryId == null) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        }
        RoasterMaster created = service.create(
                roasteryId,
                body.roasterName(),
                body.manufacturer(),
                body.model(),
                body.serialNo(),
                body.installDate(),
                body.status()
        );
        return ResponseEntity.ok(Map.of("ok", true, "data", created));
    }

    @PutMapping("/roasters/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id,
                                    @RequestBody RoasterRequest body) {
        if (roasteryId == null) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        }
        Optional<RoasterMaster> updated = service.update(
                roasteryId,
                id,
                body.roasterName(),
                body.manufacturer(),
                body.model(),
                body.serialNo(),
                body.installDate(),
                body.status()
        );
        return updated
                .<ResponseEntity<?>>map(entity -> ResponseEntity.ok(Map.of("ok", true, "data", entity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/roasters/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "X-Roastery-Id", required = false) UUID roasteryId,
                                    @PathVariable("id") UUID id) {
        if (roasteryId == null) {
            return ResponseEntity.status(401).body(Map.of("ok", false, "message", "Unauthorized"));
        }
        service.delete(roasteryId, id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}







