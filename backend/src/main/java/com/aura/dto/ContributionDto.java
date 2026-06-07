package com.aura.dto;

import com.aura.schema.RequestItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContributionDto {
    @JsonProperty("booking_id")
    private String bookingId;

    @JsonProperty("request_id")
    private String requestId;

    private String title;
    private String location;
    private String status;

    @JsonProperty("priority_level")
    private String priorityLevel;

    @JsonProperty("booked_at")
    private Instant bookedAt;

    private List<RequestItem> items;
    private String notes;
}
