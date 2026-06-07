package com.aura.schema;

import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestItem {
    @Field("item_name")
    private String itemName;

    private String category; // medicine, food, shelter, other

    @Builder.Default
    private int quantity = 0;

    @Field("quantity_needed")
    @Builder.Default
    private Integer quantityNeeded = 0;

    @Field("current_stock")
    @Builder.Default
    private Integer currentStock = 0;

    @Field("prolog_item_key")
    private String prologItemKey;
}
