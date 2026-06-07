package com.aura.schema;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Document(collection = "donor_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    private String id;

    // Donor Booking fields
    @Field("request_id")
    private String requestId;

    private String notes;

    @Field("donor_id")
    private String donorId;

    @Field("booked_at")
    private Instant bookedAt;

    // Inventory Booking fields
    private String type; // e.g. "inventory_booking"

    @Field("item_id")
    private String itemId;

    @Field("item_name")
    private String itemName;

    @Field("quantity_booked")
    private Integer quantityBooked;

    @Field("officer_id")
    private String officerId;

    @Field("officer_name")
    private String officerName;
}
