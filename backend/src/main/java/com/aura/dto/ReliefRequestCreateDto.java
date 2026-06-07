package com.aura.dto;

import com.aura.schema.RequestItem;
import lombok.Data;
import java.util.List;

@Data
public class ReliefRequestCreateDto {
    private String title;
    private String description;
    private String location;
    private List<RequestItem> items;
    private String roadStatus = "clear";
    private String populationSize = "medium";
    private boolean isPublic = true;
}
