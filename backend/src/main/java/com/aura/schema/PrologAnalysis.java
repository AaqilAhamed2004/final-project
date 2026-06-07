package com.aura.schema;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "prolog_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrologAnalysis {
    @Id
    private String id;

    @Indexed(unique = true)
    @Field("request_id")
    private String requestId;

    @Field("priority_level")
    @Builder.Default
    private String priorityLevel = "Standard";

    @Field("priority_color")
    @Builder.Default
    private String priorityColor = "yellow";

    @Field("priority_score")
    @Builder.Default
    private int priorityScore = 30;

    @Field("risk_flags")
    @Builder.Default
    private List<String> riskFlags = new ArrayList<>();

    @Field("analyzed_at")
    private Instant analyzedAt;
}
