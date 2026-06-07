package com.aura.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BookingCreateDto {
    @JsonProperty("request_id")
    private String requestId;
    private String notes;
}
