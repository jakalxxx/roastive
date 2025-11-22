package com.roastive.api.domain.org.controller;

import com.roastive.api.domain.roastery.repository.RoasteryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v2")
public class OrgStubController {
    private final RoasteryRepository roasteryRepository;

    public OrgStubController(
            RoasteryRepository roasteryRepository
    ) {
        this.roasteryRepository = roasteryRepository;
    }

    // contacts endpoints moved under /v2/roasteries/contacts

    // settings endpoints removed; handled under roastery domain

    @GetMapping("/public/validate-biz")
    public ResponseEntity<?> validateBiz(@RequestParam(name = "biz_no", required = false) String bizNo) {
        String raw = bizNo == null ? "" : bizNo.replaceAll("\\D+", "");
        boolean formatOk = raw.length() == 10; // 간단 형식 검증(10자리)
        if (!formatOk) return ResponseEntity.ok(Map.of("ok", true, "available", false));
        boolean exists = roasteryRepository.existsByBusinessRegNo(bizNo);
        return ResponseEntity.ok(Map.of("ok", true, "available", !exists));
    }
}


