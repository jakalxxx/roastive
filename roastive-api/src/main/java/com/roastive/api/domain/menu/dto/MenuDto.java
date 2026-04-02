package com.roastive.api.domain.menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.roastive.api.domain.menu.model.Menu;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class MenuDto {
    private UUID menuId;
    private String menuKey;
    private String title;
    private String path;
    private int depth;
    private List<MenuDto> children = new ArrayList<>();

    public static MenuDto from(Menu menu) {
        MenuDto dto = new MenuDto();
        dto.setMenuId(menu.getMenuId());
        dto.setMenuKey(menu.getMenuKey());
        dto.setTitle(menu.getTitle());
        dto.setPath(menu.getPath());
        dto.setDepth(menu.getDepth());
        return dto;
    }

    public UUID getMenuId() { return menuId; }
    public void setMenuId(UUID menuId) { this.menuId = menuId; }

    public String getMenuKey() { return menuKey; }
    public void setMenuKey(String menuKey) { this.menuKey = menuKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public List<MenuDto> getChildren() { return children; }
    public void setChildren(List<MenuDto> children) { this.children = children; }
}
