package com.roastive.api.domain.userrole.controller;

import com.roastive.api.domain.userrole.model.UserRole;
import com.roastive.api.domain.userrole.service.UserRoleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v2/user-roles")
@Validated
public class UserRoleController {
    private final UserRoleService service;

    public UserRoleController(UserRoleService service) { this.service = service; }

    @GetMapping
    public List<UserRole> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<UserRole> get(@PathVariable UUID id) {
        Optional<UserRole> ur = service.findById(id);
        return ur.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UserRoleRequest(UUID userId, UUID roleId) {}

    @PostMapping
    public ResponseEntity<UserRole> create(@Valid @RequestBody UserRoleRequest req) {
        UserRole ur = new UserRole();
        ur.setUserId(req.userId());
        ur.setRoleId(req.roleId());
        return ResponseEntity.ok(service.create(ur));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRole> update(@PathVariable UUID id, @Valid @RequestBody UserRoleRequest req) {
        UserRole ur = new UserRole();
        ur.setUserId(req.userId());
        ur.setRoleId(req.roleId());
        return service.update(id, ur).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


