package com.roastive.api.domain.menu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_menu")
public class Menu {
    @Id
    @Column(name = "menu_id", nullable = false, columnDefinition = "uuid")
    private UUID menuId;

    @Column(name = "parent_id", columnDefinition = "uuid")
    private UUID parentId;

    @Column(name = "menu_key", nullable = false, length = 120)
    private String menuKey;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "path", length = 200)
    private String path;

    @Column(name = "locale", nullable = false, length = 8)
    private String locale;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "depth", nullable = false)
    private int depth;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "icon", length = 64)
    private String icon;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public UUID getMenuId() { return menuId; }
    public void setMenuId(UUID menuId) { this.menuId = menuId; }

    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }

    public String getMenuKey() { return menuKey; }
    public void setMenuKey(String menuKey) { this.menuKey = menuKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
