package com.aura.controller;

import com.aura.dto.InventoryBookRequestDto;
import com.aura.schema.InventoryItem;
import com.aura.schema.User;
import com.aura.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    /** GET /api/inventory — All inventory items (public) */
    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryService.getAll();
    }

    /** POST /api/inventory — Add item (gn_officer, super_admin only) */
    @PostMapping
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public InventoryItem addItem(@RequestBody InventoryItem item) {
        return inventoryService.addItem(item);
    }

    /** PATCH /api/inventory/{id} — Partial update (gn_officer, super_admin only) */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public InventoryItem updateItem(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return inventoryService.updateItem(id, updates);
    }

    /** DELETE /api/inventory/{id} — Delete item (gn_officer, super_admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public Map<String, String> deleteItem(@PathVariable String id) {
        inventoryService.deleteItem(id);
        return Map.of("message", "Item deleted successfully");
    }

    /** POST /api/inventory/{id}/book — Book a quantity from inventory (gn_officer, super_admin) */
    @PostMapping("/{id}/book")
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public Map<String, Object> bookItem(
            @PathVariable String id,
            @RequestBody InventoryBookRequestDto dto,
            @AuthenticationPrincipal User currentUser) {
        return inventoryService.bookItem(id, dto, currentUser);
    }
}
