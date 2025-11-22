package com.roastive.api.domain.role.controller;

import com.roastive.api.domain.role.model.Role;
import com.roastive.api.domain.role.service.RoleService;
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
@RequestMapping("/v2/roles")
@Validated
public class RoleController {
    private final RoleService service;

    public RoleController(RoleService service) { this.service = service; }

    @GetMapping
    public List<Role> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Role> get(@PathVariable UUID id) {
        Optional<Role> role = service.findById(id);
        return role.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record RoleRequest(@NotBlank @Size(max = 64) String roleName,
                              @Size(max = 4000) String description) {}

    @PostMapping
    public ResponseEntity<Role> create(@Valid @RequestBody RoleRequest req) {
        Role r = new Role();
        r.setRoleName(req.roleName());
        r.setDescription(req.description());
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(service.create(r));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> update(@PathVariable UUID id, @Valid @RequestBody RoleRequest req) {
        Role r = new Role();
        r.setRoleName(req.roleName());
        r.setDescription(req.description());
        r.setUpdatedAt(OffsetDateTime.now());
        return service.update(id, r).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


