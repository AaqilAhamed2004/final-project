package com.aura.schema;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Document(collection = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {
    @Id
    private String id;

    @Field("item_name")
    private String itemName;

    private String category;

    private int quantity;

    @Field("prolog_item_key")
    private String prologItemKey;

    @Builder.Default
    private String location = "Main Hub";

    @Builder.Default
    private String warehouse = "Main Hub";

    @Field("bin_location")
    @Builder.Default
    private String binLocation = "A-1";

    @Builder.Default
    private String condition = "New";

    @Field("expiration_date")
    @Builder.Default
    private String expirationDate = "2026-12-31";

    @Field("last_audit")
    @Builder.Default
    private String lastAudit = "2024-01-01";
}
