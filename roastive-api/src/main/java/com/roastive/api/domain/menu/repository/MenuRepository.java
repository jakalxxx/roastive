package com.roastive.api.domain.menu.repository;

import com.roastive.api.domain.menu.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuRepository extends JpaRepository<Menu, UUID> {
    List<Menu> findByLocaleAndActiveTrueOrderByDepthAscDisplayOrderAsc(String locale);
}
