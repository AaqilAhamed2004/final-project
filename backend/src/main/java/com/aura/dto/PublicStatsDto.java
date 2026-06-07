package com.aura.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicStatsDto {
    @JsonProperty("total_requests")
    private long totalRequests;

    @JsonProperty("active_relief_zones")
    private long activeReliefZones;

    @JsonProperty("total_donors")
    private long totalDonors;

    @JsonProperty("items_distributed")
    private long itemsDistributed;
}
