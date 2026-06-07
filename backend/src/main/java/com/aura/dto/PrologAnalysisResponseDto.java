package com.aura.dto;

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
public class PrologAnalysisResponseDto {
    private String id;

    @JsonProperty("request_id")
    private String requestId;

    @JsonProperty("priority_level")
    private String priorityLevel;

    @JsonProperty("priority_color")
    private String priorityColor;

    @JsonProperty("priority_score")
    private int priorityScore;

    @JsonProperty("risk_flags")
    private List<String> riskFlags;

    @JsonProperty("risk_factors")
    private List<String> riskFactors;

    private String rationale;

    @JsonProperty("analyzed_at")
    private Instant analyzedAt;
}
