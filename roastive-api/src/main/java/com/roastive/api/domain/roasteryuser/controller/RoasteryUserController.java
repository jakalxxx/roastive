package com.roastive.api.domain.roasteryuser.controller;

import com.roastive.api.domain.roasteryuser.model.RoasteryUser;
import com.roastive.api.domain.roasteryuser.service.RoasteryUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/roastery-users")
@Validated
public class RoasteryUserController {
    private final RoasteryUserService service;

    public RoasteryUserController(RoasteryUserService service) { this.service = service; }

    @GetMapping
    public List<RoasteryUser> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<RoasteryUser> get(@PathVariable UUID id) {
        Optional<RoasteryUser> ru = service.findById(id);
        return ru.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record RoasteryUserRequest(UUID roasteryId, UUID userId,
                                      @NotBlank @Size(max = 64) String roleName,
                                      @NotBlank @Size(max = 32) String status) {}

    @PostMapping
    public ResponseEntity<RoasteryUser> create(@Valid @RequestBody RoasteryUserRequest req) {
        RoasteryUser ru = new RoasteryUser();
        ru.setRoasteryId(req.roasteryId());
        ru.setUserId(req.userId());
        ru.setRoleName(req.roleName());
        ru.setStatus(req.status());
        ru.setJoinedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(ru));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoasteryUser> update(@PathVariable UUID id, @Valid @RequestBody RoasteryUserRequest req) {
        RoasteryUser ru = new RoasteryUser();
        ru.setRoasteryId(req.roasteryId());
        ru.setUserId(req.userId());
        ru.setRoleName(req.roleName());
        ru.setStatus(req.status());
        ru.setJoinedAt(OffsetDateTime.now());
        return service.update(id, ru).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


