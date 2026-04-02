package com.roastive.api.domain.menu.service;

import com.roastive.api.domain.menu.dto.MenuDto;
import com.roastive.api.domain.menu.model.Menu;
import com.roastive.api.domain.menu.repository.MenuRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class MenuService {
    private final MenuRepository menuRepository;

    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public List<MenuDto> getMenuTree(String locale) {
        String normalized = normalizeLocale(locale);
        List<Menu> menus = menuRepository.findByLocaleAndActiveTrueOrderByDepthAscDisplayOrderAsc(normalized);
        if (menus.isEmpty() && !"ko".equals(normalized)) {
            menus = menuRepository.findByLocaleAndActiveTrueOrderByDepthAscDisplayOrderAsc("ko");
        }

        Map<UUID, MenuDto> index = new LinkedHashMap<>();
        List<MenuDto> roots = new ArrayList<>();

        for (Menu menu : menus) {
            MenuDto dto = MenuDto.from(menu);
            index.put(menu.getMenuId(), dto);

            UUID parentId = menu.getParentId();
            if (parentId == null) {
                roots.add(dto);
            } else {
                MenuDto parent = index.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(dto);
                }
            }
        }

        return roots;
    }

    private String normalizeLocale(String locale) {
        if (locale == null || locale.isBlank()) {
            return "ko";
        }
        return locale.toLowerCase(Locale.ROOT);
    }
}
