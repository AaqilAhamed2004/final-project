package com.aura.service;

import com.aura.dto.InventoryBookRequestDto;
import com.aura.schema.Booking;
import com.aura.schema.InventoryItem;
import com.aura.repository.BookingRepository;
import com.aura.repository.InventoryRepository;
import com.aura.schema.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /** Returns all inventory items. */
    public List<InventoryItem> getAll() {
        return inventoryRepository.findAll();
    }

    /** Adds a new inventory item. */
    public InventoryItem addItem(InventoryItem item) {
        return inventoryRepository.save(item);
    }

    /**
     * Partially updates an inventory item's fields.
     * Mirrors the PATCH /{id} route in inventory.py.
     */
    public InventoryItem updateItem(String id, Map<String, Object> updates) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));

        if (updates.containsKey("item_name"))   item.setItemName((String) updates.get("item_name"));
        if (updates.containsKey("category"))     item.setCategory((String) updates.get("category"));
        if (updates.containsKey("location"))     item.setLocation((String) updates.get("location"));
        if (updates.containsKey("warehouse"))    item.setWarehouse((String) updates.get("warehouse"));
        if (updates.containsKey("condition"))    item.setCondition((String) updates.get("condition"));
        if (updates.containsKey("bin_location")) item.setBinLocation((String) updates.get("bin_location"));
        if (updates.containsKey("quantity"))     item.setQuantity(((Number) updates.get("quantity")).intValue());
        if (updates.containsKey("expiration_date")) item.setExpirationDate((String) updates.get("expiration_date"));
        if (updates.containsKey("last_audit"))   item.setLastAudit((String) updates.get("last_audit"));

        return inventoryRepository.save(item);
    }

    /** Deletes an inventory item by id. */
    public void deleteItem(String id) {
        if (!inventoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
        inventoryRepository.deleteById(id);
    }

    /**
     * Books (reserves) a quantity from inventory and records the transaction.
     * Mirrors the POST /{id}/book route in inventory.py.
     */
    public Map<String, Object> bookItem(String id, InventoryBookRequestDto dto, User currentUser) {
        // 1. Retrieve item
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        // 2. Validate quantity
        if (dto.getQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking quantity must be greater than zero");
        }
        if (item.getQuantity() < dto.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Requested: " + dto.getQuantity() + ", Available: " + item.getQuantity());
        }

        // 3. Deduct quantity
        int newQuantity = item.getQuantity() - dto.getQuantity();
        item.setQuantity(newQuantity);
        inventoryRepository.save(item);

        // 4. Record booking transaction in donor_bookings collection
        Booking booking = Booking.builder()
                .type("inventory_booking")
                .itemId(id)
                .itemName(item.getItemName())
                .quantityBooked(dto.getQuantity())
                .officerId(currentUser.getId())
                .officerName(currentUser.getFullName())
                .bookedAt(Instant.now())
                .build();
        bookingRepository.save(booking);

        return Map.of("message", "Inventory booked successfully", "remaining_quantity", newQuantity);
    }
}
