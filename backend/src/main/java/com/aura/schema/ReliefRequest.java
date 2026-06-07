package com.aura.schema;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReliefRequest {
    @Id
    private String id;

    @Field("creator_id")
    @Builder.Default
    private String creatorId = "system";

    @Builder.Default
    private String title = "Untitled Relief Request";

    private String description;

    private String location;

    @Builder.Default
    private List<RequestItem> items = new ArrayList<>();

    @Builder.Default
    private String status = "pending"; // pending, approved, ongoing, completed

    @Field("road_status")
    @Builder.Default
    private String roadStatus = "clear"; // clear, blocked, flooded

    @Field("population_size")
    @Builder.Default
    private String populationSize = "medium"; // small, medium, large

    @Field("is_public")
    @Builder.Default
    private boolean isPublic = true;

    @Field("created_at")
    private Instant createdAt;

    @Field("priority_level")
    @Builder.Default
    private String priorityLevel = "LOW";

    @Field("request_type")
    @Builder.Default
    private String requestType = "Aura-Led";

    @Field("urgency_level")
    @Builder.Default
    private String urgencyLevel = "Normal";

    @Builder.Default
    private String etd = "Pending";

    @Field("assigned_team")
    @Builder.Default
    private String assignedTeam = "Unassigned";
}
