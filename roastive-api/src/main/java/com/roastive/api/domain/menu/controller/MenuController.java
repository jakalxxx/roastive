package com.roastive.api.domain.menu.controller;

import com.roastive.api.domain.menu.dto.MenuDto;
import com.roastive.api.domain.menu.service.MenuService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v2/menus")
public class MenuController {
    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuDto> list(@RequestParam(name = "locale", defaultValue = "ko") String locale) {
        return menuService.getMenuTree(locale);
    }
}
